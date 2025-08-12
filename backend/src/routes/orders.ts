import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { supabase } from '../config/database';

const router = Router();

const createValidation = [
  body('freelancerUserId').isString().notEmpty(),
  body('amount_cents').isInt({ min: 1000 }),
  body('currency').isString().notEmpty(),
  body('projectId').optional().isString(),
];

// POST / - Create new order
router.post('/', authenticateToken, createValidation, async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: errors.array() });
    }

    const clientUserId = req.user!.id;
    const { freelancerUserId, amount_cents, currency, projectId } = req.body as any;

    // Resolve client_id and freelancer_id
    const { data: clientRow, error: clientErr } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', clientUserId)
      .single();

    const { data: freelancerRow, error: freelancerErr } = await supabase
      .from('freelancers')
      .select('id')
      .eq('user_id', freelancerUserId)
      .single();

    if (clientErr || !clientRow) {
      return res.status(400).json({ success: false, error: 'Client profile not found' });
    }
    if (freelancerErr || !freelancerRow) {
      return res.status(400).json({ success: false, error: 'Freelancer profile not found' });
    }

    const { data: order, error: orderErr } = await supabase
      .from('orders')
      .insert({
        client_id: clientRow.id,
        freelancer_id: freelancerRow.id,
        amount_cents,
        currency,
        status: 'pending_payment',
        custom_instructions: projectId || null,
      })
      .select()
      .single();

    if (orderErr) throw orderErr;

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ success: false, error: 'Failed to create order' });
  }
});

// GET / - List user orders
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.id;

    // Determine client or freelancer role by presence in respective table
    const [{ data: clientRow }, { data: freelancerRow }] = await Promise.all([
      supabase.from('clients').select('id').eq('user_id', userId).single(),
      supabase.from('freelancers').select('id').eq('user_id', userId).single(),
    ]);

    const orFilter = clientRow && freelancerRow
      ? `client_id.eq.${(clientRow as any).id},freelancer_id.eq.${(freelancerRow as any).id}`
      : clientRow
      ? `client_id.eq.${(clientRow as any).id}`
      : `freelancer_id.eq.${(freelancerRow as any)?.id}`;

    const { data: orders, error } = await supabase
      .from('orders')
      .select('*')
      .or(orFilter)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: orders || [] });
  } catch (error) {
    console.error('List orders error:', error);
    res.status(500).json({ success: false, error: 'Failed to list orders' });
  }
});

// GET /:id - Get order details
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: order, error } = await supabase.from('orders').select('*').eq('id', id).single();
    if (error || !order) {
      return res.status(404).json({ success: false, error: 'Order not found' });
    }
    res.json({ success: true, data: order });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ success: false, error: 'Failed to get order' });
  }
});

// PUT /:id/status - Update order status
router.put('/:id/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };

    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Order status updated', data: updated });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ success: false, error: 'Failed to update order status' });
  }
});

export default router;
