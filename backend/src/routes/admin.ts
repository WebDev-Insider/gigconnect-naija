import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { supabase } from '../config/database';

const router = Router();

// GET /users - List all users (admin)
router.get('/users', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id,email,full_name,phone,role,status,created_at')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) throw error;

    res.json({ success: true, data: data || [] });
  } catch (error) {
    console.error('Admin list users error:', error);
    res.status(500).json({ success: false, error: 'Failed to list users' });
  }
});

// POST /users/:id/verify - Verify user KYC (admin)
router.post('/users/:id/verify', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('users')
      .update({ status: 'verified' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'User verified', data });
  } catch (error) {
    console.error('Admin verify user error:', error);
    res.status(500).json({ success: false, error: 'Failed to verify user' });
  }
});

// POST /orders/:id/release - Release escrow funds (admin)
router.post('/orders/:id/release', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, message: 'Escrow released', data: updated });
  } catch (error) {
    console.error('Admin release escrow error:', error);
    res.status(500).json({ success: false, error: 'Failed to release escrow' });
  }
});

export default router;
