import request from 'supertest';
import app from '../index';

describe('Authentication Routes', () => {
  describe('POST /api/v1/auth/signup', () => {
    it('should create a new user account', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123',
        full_name: 'Test User',
        phone: '+2341234567890',
        role: 'client',
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.role).toBe(userData.role);
    });

    it('should reject invalid email format', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'TestPassword123',
        full_name: 'Test User',
        phone: '+2341234567890',
        role: 'client',
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should reject weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        full_name: 'Test User',
        phone: '+2341234567890',
        role: 'client',
      };

      const response = await request(app)
        .post('/api/v1/auth/signup')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate valid user credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'TestPassword123',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.session).toBeDefined();
    });

    it('should reject invalid credentials', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'WrongPassword123',
      };

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send(credentials)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should require authentication', async () => {
      const response = await request(app).get('/api/v1/auth/me').expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('POST /api/v1/auth/logout', () => {
    it('should require authentication', async () => {
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Access token required');
    });
  });

  describe('POST /api/v1/auth/forgot-password', () => {
    it('should accept valid email format', async () => {
      const emailData = {
        email: 'test@example.com',
      };

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send(emailData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        'Password reset email sent successfully'
      );
    });

    it('should reject invalid email format', async () => {
      const emailData = {
        email: 'invalid-email',
      };

      const response = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send(emailData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Validation failed');
    });
  });
});
