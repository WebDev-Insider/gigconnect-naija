import { Router } from 'express';
import { supabase } from '../config/database';
import { 
  verifyPaystackWebhook, 
  parseWebhookData, 
  validatePaymentAmount,
  WEBHOOK_EVENTS 
} from '../config/paystack';
import { OrderStatus, TransactionType, TransactionStatus } from '../types';

const router = Router();

// Paystack webhook handler
router.post('/paystack', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature'] as string;
    const body = JSON.stringify(req.body);

    // Verify webhook signature
    if (!verifyPaystackWebhook(body, signature)) {
      console.error('Invalid Paystack webhook signature');
      return res.status(401).json({ error: 'Invalid signature' });
    }

    // Parse webhook data
    const webhookData = parseWebhookData(body);
    if (!webhookData) {
      console.error('Failed to parse webhook data');
      return res.status(400).json({ error: 'Invalid webhook data' });
    }

    // Validate webhook event
    if (!Object.values(WEBHOOK_EVENTS).includes(webhookData.event as any)) {
      console.error('Invalid webhook event:', webhookData.event);
      return res.status(400).json({ error: 'Invalid event type' });
    }

    console.log('Processing Paystack webhook:', webhookData.event);

    // Handle different webhook events
    switch (webhookData.event) {
      case WEBHOOK_EVENTS.CHARGE_SUCCESS:
        await handleChargeSuccess(webhookData);
        break;
      
      case WEBHOOK_EVENTS.CHARGE_FAILED:
        await handleChargeFailed(webhookData);
        break;
      
      case WEBHOOK_EVENTS.TRANSFER_SUCCESS:
        await handleTransferSuccess(webhookData);
        break;
      
      case WEBHOOK_EVENTS.TRANSFER_FAILED:
        await handleTransferFailed(webhookData);
        break;
      
      default:
        console.log('Unhandled webhook event:', webhookData.event);
    }

    res.json({ status: 'success' });

  } catch (error) {
    console.error('Paystack webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Handle successful charge (payment received)
async function handleChargeSuccess(webhookData: any): Promise<void> {
  try {
    const { reference, amount, status, customer } = webhookData.data;

    // Find order by payment reference
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (orderError || !order) {
      console.error('Order not found for reference:', reference);
      return;
    }

    // Validate payment amount
    if (!validatePaymentAmount(order.amount_cents, amount)) {
      console.error('Payment amount mismatch:', { expected: order.amount_cents, received: amount });
      return;
    }

    // Start database transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        order_id: order.id,
        type: TransactionType.ESCROW_CREDIT,
        amount_cents: amount,
        status: TransactionStatus.COMPLETED,
        paystack_reference: reference,
        metadata: {
          customer_email: customer.email,
          payment_channel: webhookData.data.channel,
          paid_at: webhookData.data.paid_at
        }
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Failed to create transaction:', transactionError);
      return;
    }

    // Update order status to in_escrow
    const { error: updateError } = await supabase
      .from('orders')
      .update({ 
        status: OrderStatus.IN_ESCROW,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    if (updateError) {
      console.error('Failed to update order status:', updateError);
      return;
    }

    // Update freelancer's reserved amount in wallet
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        reserved_cents: supabase.sql`reserved_cents + ${amount}`,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', order.freelancer_id);

    if (walletError) {
      console.error('Failed to update wallet:', walletError);
      return;
    }

    console.log('Payment verified and escrow created for order:', order.id);

    // TODO: Send notifications to freelancer and client
    // await sendPaymentVerifiedNotification(order.id);

  } catch (error) {
    console.error('Error handling charge success:', error);
  }
}

// Handle failed charge
async function handleChargeFailed(webhookData: any): Promise<void> {
  try {
    const { reference, amount, status, customer } = webhookData.data;

    // Find order by payment reference
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (orderError || !order) {
      console.error('Order not found for reference:', reference);
      return;
    }

    // Create failed transaction record
    await supabase
      .from('transactions')
      .insert({
        order_id: order.id,
        type: TransactionType.ESCROW_CREDIT,
        amount_cents: amount,
        status: TransactionStatus.FAILED,
        paystack_reference: reference,
        metadata: {
          customer_email: customer.email,
          failure_reason: webhookData.data.gateway_response,
          failed_at: new Date().toISOString()
        }
      });

    // Update order status back to pending_payment
    await supabase
      .from('orders')
      .update({ 
        status: OrderStatus.PENDING_PAYMENT,
        updated_at: new Date().toISOString()
      })
      .eq('id', order.id);

    console.log('Payment failed for order:', order.id);

    // TODO: Send notification to client about payment failure
    // await sendPaymentFailedNotification(order.id);

  } catch (error) {
    console.error('Error handling charge failed:', error);
  }
}

// Handle successful transfer (payout to freelancer)
async function handleTransferSuccess(webhookData: any): Promise<void> {
  try {
    const { reference, amount, status } = webhookData.data;

    // Find transaction by Paystack reference
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('paystack_reference', reference)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction not found for reference:', reference);
      return;
    }

    // Update transaction status
    await supabase
      .from('transactions')
      .update({ 
        status: TransactionStatus.COMPLETED,
        metadata: {
          ...transaction.metadata,
          transfer_completed_at: new Date().toISOString(),
          transfer_reference: reference
        }
      })
      .eq('id', transaction.id);

    console.log('Transfer completed for transaction:', transaction.id);

    // TODO: Send notification to freelancer about successful payout
    // await sendPayoutSuccessNotification(transaction.order_id);

  } catch (error) {
    console.error('Error handling transfer success:', error);
  }
}

// Handle failed transfer
async function handleTransferFailed(webhookData: any): Promise<void> {
  try {
    const { reference, amount, status } = webhookData.data;

    // Find transaction by Paystack reference
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .select('*')
      .eq('paystack_reference', reference)
      .single();

    if (transactionError || !transaction) {
      console.error('Transaction not found for reference:', reference);
      return;
    }

    // Update transaction status
    await supabase
      .from('transactions')
      .update({ 
        status: TransactionStatus.FAILED,
        metadata: {
          ...transaction.metadata,
          transfer_failed_at: new Date().toISOString(),
          failure_reason: webhookData.data.gateway_response
        }
      })
      .eq('id', transaction.id);

    console.log('Transfer failed for transaction:', transaction.id);

    // TODO: Send notification to admin about failed payout
    // await sendPayoutFailedNotification(transaction.order_id);

  } catch (error) {
    console.error('Error handling transfer failed:', error);
  }
}

// Supabase auth webhook (optional)
router.post('/supabase/auth', async (req, res) => {
  try {
    const { type, table, record, old_record } = req.body;

    console.log('Supabase auth webhook:', { type, table, record });

    // Handle different auth events
    switch (type) {
      case 'INSERT':
        if (table === 'users') {
          // New user created
          console.log('New user created:', record.id);
        }
        break;
      
      case 'UPDATE':
        if (table === 'users') {
          // User updated
          console.log('User updated:', record.id);
        }
        break;
      
      case 'DELETE':
        if (table === 'users') {
          // User deleted
          console.log('User deleted:', old_record.id);
        }
        break;
    }

    res.json({ status: 'success' });

  } catch (error) {
    console.error('Supabase auth webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Health check for webhooks
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Webhook endpoints are healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
