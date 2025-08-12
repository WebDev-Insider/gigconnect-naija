import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { supabase } from '../config/database';
import { generatePaymentReference, getPaystackAccountDetails } from '../config/paystack';

const router = Router();

// POST /initiate - Initiate payment
router.post(
  '/initiate',
  authenticateToken,
  body('orderId').isString().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      }

      const { orderId } = req.body as { orderId: string };

      // Fetch order
      const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', orderId).single();
      if (orderErr || !order) {
        return res.status(404).json({ success: false, error: 'Order not found' });
      }

      const reference = generatePaymentReference(orderId);

      const { error: updateErr } = await supabase
        .from('orders')
        .update({ payment_reference: reference, status: 'payment_pending_verification' })
        .eq('id', orderId);

      if (updateErr) throw updateErr;

      const account = getPaystackAccountDetails();
      res.status(201).json({ success: true, data: { reference, account } });
    } catch (error) {
      console.error('Initiate payment error:', error);
      res.status(500).json({ success: false, error: 'Failed to initiate payment' });
    }
  }
);

// POST /verify - Verify payment proof (manual)
router.post(
  '/verify',
  authenticateToken,
  body('reference').isString().notEmpty(),
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
      }

      const { reference } = req.body as { reference: string };

      // Lookup order by reference
      const { data: order, error: orderErr } = await supabase
        .from('orders')
        .select('*')
        .eq('payment_reference', reference)
        .single();

      if (orderErr || !order) {
        return res.status(404).json({ success: false, error: 'Order not found for reference' });
      }

      // Mark as in_escrow (simulate verification success)
      const { data: updated, error: updateErr } = await supabase
        .from('orders')
        .update({ status: 'in_escrow' })
        .eq('id', order.id)
        .select()
        .single();

      if (updateErr) throw updateErr;

      res.json({ success: true, message: 'Payment verified', data: updated });
    } catch (error) {
      console.error('Verify payment error:', error);
      res.status(500).json({ success: false, error: 'Failed to verify payment' });
    }
  }
);

// GET /status/:orderId - Get payment status
router.get('/status/:orderId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { data: order, error } = await supabase.from('orders').select('status,payment_reference').eq('id', orderId).single();
    if (error || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get payment status error:', error);
    res.status(500).json({ success: false, error: 'Failed to get payment status' });
  }
});

export default router;
