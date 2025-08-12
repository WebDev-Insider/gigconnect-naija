// Test setup file
import dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Mock console methods to reduce noise in tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console output during tests unless explicitly needed
  if (process.env.SHOW_CONSOLE !== 'true') {
    console.log = jest.fn();
    console.error = jest.fn();
    console.warn = jest.fn();
  }
});

afterAll(() => {
  // Restore console methods
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Helper to create mock user data
  createMockUser: (overrides = {}) => ({
    id: 'test-user-id',
    email: 'test@example.com',
    full_name: 'Test User',
    phone: '+2341234567890',
    role: 'client',
    status: 'active',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  }),

  // Helper to create mock order data
  createMockOrder: (overrides = {}) => ({
    id: 'test-order-id',
    client_id: 'test-client-id',
    freelancer_id: 'test-freelancer-id',
    amount_cents: 5000,
    currency: 'NGN',
    status: 'pending_payment',
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  }),

  // Helper to create mock gig data
  createMockGig: (overrides = {}) => ({
    id: 'test-gig-id',
    freelancer_id: 'test-freelancer-id',
    title: 'Test Gig',
    description: 'Test gig description',
    price_cents: 5000,
    currency: 'NGN',
    delivery_days: 3,
    category: 'writing',
    tags: ['content', 'blog'],
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides
  })
};

// Type declarations for global test utilities
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockUser: (overrides?: any) => any;
        createMockOrder: (overrides?: any) => any;
        createMockGig: (overrides?: any) => any;
      };
    }
  }
}
