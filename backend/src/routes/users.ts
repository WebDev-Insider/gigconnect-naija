import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/database';
import { authenticateToken, requireRole, auditLog } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// Get user profile by ID
router.get('/:id', 
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Users can only view their own profile or admins can view any
      if (req.user?.id !== id && req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      // Get role-specific profile data
      let profileData: any = { ...user };

      if (user.role === UserRole.FREELANCER) {
        const { data: freelancerProfile } = await supabase
          .from('freelancers')
          .select('*')
          .eq('user_id', id)
          .single();

        if (freelancerProfile) {
          profileData.freelancer = freelancerProfile;
        }
      } else if (user.role === UserRole.CLIENT) {
        const { data: clientProfile } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', id)
          .single();

        if (clientProfile) {
          profileData.client = clientProfile;
        }
      }

      res.json({
        success: true,
        data: profileData
      });

    } catch (error) {
      console.error('Get user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }
);

// Update user profile
router.put('/:id',
  authenticateToken,
  body('full_name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/),
  body('metadata').optional().isObject(),
  auditLog('profile_update'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      
      // Users can only update their own profile
      if (req.user?.id !== id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const { full_name, phone, metadata } = req.body;
      const updateData: any = {};

      if (full_name) updateData.full_name = full_name;
      if (phone) updateData.phone = phone;
      if (metadata) updateData.metadata = metadata;

      const { data: updatedUser, error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }
);

// Submit KYC documents
router.post('/:id/kyc',
  authenticateToken,
  body('docs').isObject().notEmpty(),
  auditLog('kyc_submission'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      const { docs } = req.body;
      
      // Users can only submit KYC for themselves
      if (req.user?.id !== id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Check if KYC record already exists
      const { data: existingKYC } = await supabase
        .from('kyc_records')
        .select('id, status')
        .eq('user_id', id)
        .single();

      if (existingKYC) {
        if (existingKYC.status === 'verified') {
          return res.status(400).json({
            success: false,
            error: 'KYC already verified'
          });
        }
        
        // Update existing KYC record
        const { data: updatedKYC, error: updateError } = await supabase
          .from('kyc_records')
          .update({ 
            docs,
            status: 'pending',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', id)
          .select()
          .single();

        if (updateError) {
          throw updateError;
        }

        // Update user status to pending_kyc
        await supabase
          .from('users')
          .update({ 
            status: 'pending_kyc',
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        res.json({
          success: true,
          message: 'KYC documents updated successfully',
          data: updatedKYC
        });
      } else {
        // Create new KYC record
        const { data: newKYC, error: createError } = await supabase
          .from('kyc_records')
          .insert({
            user_id: id,
            status: 'pending',
            docs
          })
          .select()
          .single();

        if (createError) {
          throw createError;
        }

        // Update user status to pending_kyc
        await supabase
          .from('users')
          .update({ 
            status: 'pending_kyc',
            kyc_id: newKYC.id,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        res.status(201).json({
          success: true,
          message: 'KYC documents submitted successfully',
          data: newKYC
        });
      }

    } catch (error) {
      console.error('KYC submission error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to submit KYC documents'
      });
    }
  }
);

// Get KYC status
router.get('/:id/kyc',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Users can only view their own KYC or admins can view any
      if (req.user?.id !== id && req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const { data: kycRecord, error } = await supabase
        .from('kyc_records')
        .select('*')
        .eq('user_id', id)
        .single();

      if (error || !kycRecord) {
        return res.status(404).json({
          success: false,
          error: 'KYC record not found'
        });
      }

      res.json({
        success: true,
        data: kycRecord
      });

    } catch (error) {
      console.error('Get KYC error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get KYC status'
      });
    }
  }
);

// Update freelancer profile (skills, portfolio, etc.)
router.put('/:id/freelancer',
  authenticateToken,
  requireRole([UserRole.FREELANCER, UserRole.ADMIN]),
  body('tagline').optional().trim().isLength({ max: 200 }),
  body('skills').optional().isArray(),
  body('portfolio_public').optional().isObject(),
  auditLog('freelancer_profile_update'),
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { id } = req.params;
      
      // Users can only update their own profile
      if (req.user?.id !== id && req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const { tagline, skills, portfolio_public } = req.body;
      const updateData: any = {};

      if (tagline !== undefined) updateData.tagline = tagline;
      if (skills !== undefined) updateData.skills = skills;
      if (portfolio_public !== undefined) updateData.portfolio_public = portfolio_public;

      const { data: updatedProfile, error } = await supabase
        .from('freelancers')
        .update(updateData)
        .eq('user_id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: 'Freelancer profile updated successfully',
        data: updatedProfile
      });

    } catch (error) {
      console.error('Update freelancer profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update freelancer profile'
      });
    }
  }
);

// Update client profile
router.put('/:id/client',
  authenticateToken,
  requireRole([UserRole.CLIENT, UserRole.ADMIN]),
  auditLog('client_profile_update'),
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Users can only update their own profile
      if (req.user?.id !== id && req.user?.role !== UserRole.ADMIN) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Client profiles are mostly read-only, updated automatically
      res.json({
        success: true,
        message: 'Client profile updated successfully'
      });

    } catch (error) {
      console.error('Update client profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update client profile'
      });
    }
  }
);

// Get user wallet
router.get('/:id/wallet',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      
      // Users can only view their own wallet
      if (req.user?.id !== id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const { data: wallet, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', id)
        .single();

      if (error || !wallet) {
        return res.status(404).json({
          success: false,
          error: 'Wallet not found'
        });
      }

      res.json({
        success: true,
        data: wallet
      });

    } catch (error) {
      console.error('Get wallet error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get wallet'
      });
    }
  }
);

// Get user transactions
router.get('/:id/transactions',
  authenticateToken,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { page = 1, limit = 20 } = req.query;
      
      // Users can only view their own transactions
      if (req.user?.id !== id) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Get orders for this user
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select('id')
        .or(`client_id.eq.${id},freelancer_id.eq.${id}`);

      if (ordersError) {
        throw ordersError;
      }

      const orderIds = orders.map(order => order.id);
      
      if (orderIds.length === 0) {
        return res.json({
          success: true,
          data: [],
          pagination: {
            page: Number(page),
            limit: Number(limit),
            total: 0,
            totalPages: 0
          }
        });
      }

      // Get transactions for these orders
      const offset = (Number(page) - 1) * Number(limit);
      
      const { data: transactions, error: transactionsError, count } = await supabase
        .from('transactions')
        .select('*', { count: 'exact' })
        .in('order_id', orderIds)
        .order('created_at', { ascending: false })
        .range(offset, offset + Number(limit) - 1);

      if (transactionsError) {
        throw transactionsError;
      }

      const totalPages = Math.ceil((count || 0) / Number(limit));

      res.json({
        success: true,
        data: transactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: count || 0,
          totalPages
        }
      });

    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get transactions'
      });
    }
  }
);

export default router;
