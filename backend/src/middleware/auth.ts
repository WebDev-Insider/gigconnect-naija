import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { supabase } from '../config/database';
import { User, UserRole, JWTPayload, AuthenticatedRequest, RoleRequiredRequest } from '../types';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: User;
      token?: string;
    }
  }
}

// Verify Supabase JWT token
export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        error: 'Access token required'
      });
      return;
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token'
      });
      return;
    }

    // Get user details from our database
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      res.status(401).json({
        success: false,
        error: 'User not found'
      });
      return;
    }

    // Check if user is active
    if (userData.status !== 'active' && userData.status !== 'verified') {
      res.status(403).json({
        success: false,
        error: 'Account is not active'
      });
      return;
    }

    // Attach user to request
    req.user = userData as User;
    req.token = token;

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

// Role-based access control middleware
export const requireRole = (allowedRoles: UserRole | UserRole[]) => {
  return (req: RoleRequiredRequest, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Authentication required'
        });
        return;
      }

      const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
      
      if (!roles.includes(req.user.role)) {
        res.status(403).json({
          success: false,
          error: 'Insufficient permissions'
        });
        return;
      }

      next();
    } catch (error) {
      console.error('Role verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Role verification failed'
      });
    }
  };
};

// Specific role middlewares
export const requireAdmin = requireRole(UserRole.ADMIN);
export const requireModerator = requireRole([UserRole.ADMIN, UserRole.MODERATOR]);
export const requireFreelancer = requireRole([UserRole.ADMIN, UserRole.FREELANCER]);
export const requireClient = requireRole([UserRole.ADMIN, UserRole.CLIENT]);

// Optional authentication middleware (for public endpoints that can show different content for authenticated users)
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (!error && user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

          if (userData && (userData.status === 'active' || userData.status === 'verified')) {
            req.user = userData as User;
            req.token = token;
          }
        }
      } catch (error) {
        // Silently fail for optional auth
        console.debug('Optional auth failed:', error);
      }
    }

    next();
  } catch (error) {
    console.error('Optional auth error:', error);
    next();
  }
};

// Rate limiting middleware
export const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();

    const userRequests = requests.get(ip);
    
    if (!userRequests || now > userRequests.resetTime) {
      requests.set(ip, { count: 1, resetTime: now + windowMs });
      next();
      return;
    }

    if (userRequests.count >= maxRequests) {
      res.status(429).json({
        success: false,
        error: 'Too many requests, please try again later'
      });
      return;
    }

    userRequests.count++;
    next();
  };
};

// Apply rate limiting to auth endpoints
export const authRateLimiter = createRateLimiter(5, 15 * 60 * 1000); // 5 requests per 15 minutes
export const generalRateLimiter = createRateLimiter(100, 15 * 60 * 1000); // 100 requests per 15 minutes

// Logging middleware for audit trail
export const auditLog = (action: string) => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user) {
        // Log the action asynchronously (don't block the request)
        setImmediate(async () => {
          try {
            await supabase
              .from('audit_logs')
              .insert({
                actor_id: req.user!.id,
                action,
                target_type: req.route?.path || 'unknown',
                target_id: req.params?.id || 'unknown',
                details: {
                  method: req.method,
                  path: req.path,
                  query: req.query,
                  body: req.body,
                  ip_address: req.ip,
                  user_agent: req.get('User-Agent')
                },
                ip_address: req.ip,
                user_agent: req.get('User-Agent')
              });
          } catch (error) {
            console.error('Failed to log audit event:', error);
          }
        });
      }
    } catch (error) {
      console.error('Audit logging error:', error);
    }

    next();
  };
};

// Error handling middleware
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Unhandled error:', error);

  // Default error response
  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message
  });
};

// Not found middleware
export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
};
