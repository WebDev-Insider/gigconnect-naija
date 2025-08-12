import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { supabase } from '../config/database';
import { authenticateToken, authRateLimiter, auditLog } from '../middleware/auth';
import { UserRole, UserStatus, CreateUserRequest } from '../types';

const router = Router();

// Input validation schemas
const signupValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  body('full_name').trim().isLength({ min: 2, max: 100 }),
  body('phone').matches(/^\+?[1-9]\d{1,14}$/),
  body('role').isIn(Object.values(UserRole))
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const profileUpdateValidation = [
  body('full_name').optional().trim().isLength({ min: 2, max: 100 }),
  body('phone').optional().matches(/^\+?[1-9]\d{1,14}$/),
  body('metadata').optional().isObject()
];

// User registration
router.post('/signup', 
  authRateLimiter,
  signupValidation,
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password, full_name, phone, role }: CreateUserRequest = req.body;

      // Check if user already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingUser) {
        return res.status(409).json({
          success: false,
          error: 'User with this email already exists'
        });
      }

      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            phone,
            role
          }
        }
      });

      if (authError || !authData.user) {
        return res.status(400).json({
          success: false,
          error: authError?.message || 'Failed to create user account'
        });
      }

      // Create user profile in our database
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          phone,
          role,
          status: UserStatus.PENDING_KYC
        })
        .select()
        .single();

      if (profileError) {
        // Rollback auth user creation if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Create role-specific profiles
      if (role === UserRole.FREELANCER) {
        await supabase
          .from('freelancers')
          .insert({
            user_id: authData.user.id,
            skills: [],
            portfolio_public: {},
            bank_details: {},
            rating_avg: 0.00,
            total_orders: 0,
            completed_orders: 0
          });
      } else if (role === UserRole.CLIENT) {
        await supabase
          .from('clients')
          .insert({
            user_id: authData.user.id,
            total_spent: 0,
            total_orders: 0
          });
      }

      // Create wallet
      await supabase
        .from('wallets')
        .insert({
          user_id: authData.user.id,
          balance_cents: 0,
          reserved_cents: 0
        });

      // Create KYC record
      await supabase
        .from('kyc_records')
        .insert({
          user_id: authData.user.id,
          status: 'pending',
          docs: {}
        });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: userProfile.id,
            email: userProfile.email,
            full_name: userProfile.full_name,
            role: userProfile.role,
            status: userProfile.status
          }
        }
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to register user'
      });
    }
  }
);

// User login
router.post('/login',
  authRateLimiter,
  loginValidation,
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { email, password } = req.body;

      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError || !authData.user) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials'
        });
      }

      // Get user profile
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !userProfile) {
        return res.status(404).json({
          success: false,
          error: 'User profile not found'
        });
      }

      // Check if user is active
      if (userProfile.status !== UserStatus.ACTIVE && userProfile.status !== UserStatus.VERIFIED) {
        return res.status(403).json({
          success: false,
          error: 'Account is not active. Please complete KYC verification.'
        });
      }

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: userProfile.id,
            email: userProfile.email,
            full_name: userProfile.full_name,
            role: userProfile.role,
            status: userProfile.status
          },
          session: {
            access_token: authData.session?.access_token,
            refresh_token: authData.session?.refresh_token,
            expires_at: authData.session?.expires_at
          }
        }
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to authenticate user'
      });
    }
  }
);

// Get current user profile
router.get('/me',
  authenticateToken,
  async (req, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Get additional profile data based on role
      let profileData: any = { ...req.user };

      if (req.user.role === UserRole.FREELANCER) {
        const { data: freelancerProfile } = await supabase
          .from('freelancers')
          .select('*')
          .eq('user_id', req.user.id)
          .single();

        if (freelancerProfile) {
          profileData.freelancer = freelancerProfile;
        }
      } else if (req.user.role === UserRole.CLIENT) {
        const { data: clientProfile } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', req.user.id)
          .single();

        if (clientProfile) {
          profileData.client = clientProfile;
        }
      }

      // Get wallet balance
      const { data: wallet } = await supabase
        .from('wallets')
        .select('balance_cents, reserved_cents')
        .eq('user_id', req.user.id)
        .single();

      if (wallet) {
        profileData.wallet = wallet;
      }

      res.json({
        success: true,
        data: profileData
      });

    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user profile'
      });
    }
  }
);

// Update user profile
router.put('/me',
  authenticateToken,
  profileUpdateValidation,
  auditLog('profile_update'),
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const { full_name, phone, metadata } = req.body;
      const updateData: any = {};

      if (full_name) updateData.full_name = full_name;
      if (phone) updateData.phone = phone;
      if (metadata) updateData.metadata = metadata;

      // Update user profile
      const { data: updatedUser, error: updateError } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', req.user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      });

    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update profile'
      });
    }
  }
);

// Refresh token
router.post('/refresh',
  async (req, res) => {
    try {
      const { refresh_token } = req.body;

      if (!refresh_token) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token required'
        });
      }

      // Refresh session with Supabase
      const { data: authData, error: authError } = await supabase.auth.refreshSession({
        refresh_token
      });

      if (authError || !authData.session) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token'
        });
      }

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          session: {
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_at: authData.session.expires_at
          }
        }
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refresh token'
      });
    }
  }
);

// Logout
router.post('/logout',
  authenticateToken,
  async (req, res) => {
    try {
      if (!req.token) {
        return res.status(400).json({
          success: false,
          error: 'No token provided'
        });
      }

      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Logout error:', error);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });

    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to logout'
      });
    }
  }
);

// Forgot password
router.post('/forgot-password',
  authRateLimiter,
  body('email').isEmail().normalizeEmail(),
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

      const { email } = req.body;

      // Send password reset email via Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.FRONTEND_URL}/reset-password`
      });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: 'Password reset email sent successfully'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to send password reset email'
      });
    }
  }
);

// Reset password
router.post('/reset-password',
  authRateLimiter,
  body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
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

      const { password, token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          error: 'Reset token required'
        });
      }

      // Update password via Supabase
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        throw error;
      }

      res.json({
        success: true,
        message: 'Password reset successfully'
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to reset password'
      });
    }
  }
);

export default router;
