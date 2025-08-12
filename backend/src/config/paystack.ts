import crypto from 'crypto';
import dotenv from 'dotenv';
import { PaystackWebhookData } from '../types';

dotenv.config();

export const PAYSTACK_CONFIG = {
  SECRET_KEY: process.env.PAYSTACK_SECRET_KEY!,
  PUBLIC_KEY: process.env.PAYSTACK_PUBLIC_KEY!,
  WEBHOOK_SECRET: process.env.PAYSTACK_WEBHOOK_SECRET!,
  BASE_URL: 'https://api.paystack.co',
};

// Verify Paystack webhook signature
export const verifyPaystackWebhook = (
  body: string,
  signature: string
): boolean => {
  try {
    const hash = crypto
      .createHmac('sha512', PAYSTACK_CONFIG.WEBHOOK_SECRET)
      .update(body, 'utf8')
      .digest('hex');

    return hash === signature;
  } catch (error) {
    console.error('Error verifying Paystack webhook:', error);
    return false;
  }
};

// Parse webhook data
export const parseWebhookData = (body: string): PaystackWebhookData | null => {
  try {
    return JSON.parse(body) as PaystackWebhookData;
  } catch (error) {
    console.error('Error parsing webhook data:', error);
    return null;
  }
};

// Generate payment reference
export const generatePaymentReference = (orderId: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `GIG_${orderId}_${timestamp}_${random}`.toUpperCase();
};

// Validate payment amount (convert from kobo to naira)
export const validatePaymentAmount = (
  expectedAmount: number,
  receivedAmount: number
): boolean => {
  // Paystack sends amount in kobo (smallest currency unit)
  // Our system stores amount in cents
  // 1 NGN = 100 kobo = 100 cents
  const expectedKobo = expectedAmount;
  const receivedKobo = receivedAmount;

  return expectedKobo === receivedKobo;
};

// Get Paystack account details for manual transfer
export const getPaystackAccountDetails = () => {
  return {
    bank_name: 'Paystack',
    account_number: process.env.PAYSTACK_ACCOUNT_NUMBER || 'N/A',
    account_name: process.env.PAYSTACK_ACCOUNT_NAME || 'GigConnect Escrow',
    instructions:
      'Please include your order reference in the transfer description',
  };
};

// Payment status mapping
export const PAYMENT_STATUS_MAP = {
  success: 'completed',
  failed: 'failed',
  abandoned: 'cancelled',
  pending: 'pending',
} as const;

export type PaystackPaymentStatus = keyof typeof PAYMENT_STATUS_MAP;
export type MappedPaymentStatus =
  (typeof PAYMENT_STATUS_MAP)[PaystackPaymentStatus];

// Map Paystack status to our system status
export const mapPaymentStatus = (
  paystackStatus: string
): MappedPaymentStatus => {
  return (
    PAYMENT_STATUS_MAP[paystackStatus as PaystackPaymentStatus] || 'pending'
  );
};

// Webhook event types
export const WEBHOOK_EVENTS = {
  CHARGE_SUCCESS: 'charge.success',
  CHARGE_FAILED: 'charge.failed',
  TRANSFER_SUCCESS: 'transfer.success',
  TRANSFER_FAILED: 'transfer.failed',
} as const;

// Validate webhook event
export const isValidWebhookEvent = (event: string): boolean => {
  return Object.values(WEBHOOK_EVENTS).includes(event as any);
};

// Payment verification response
export interface PaymentVerificationResponse {
  success: boolean;
  data?: {
    reference: string;
    amount: number;
    status: string;
    gateway_response: string;
    paid_at: string;
    channel: string;
    currency: string;
    customer: {
      email: string;
      customer_code: string;
      first_name: string;
      last_name: string;
      phone: string;
    };
  };
  message?: string;
}

// Mock Paystack response for testing
export const createMockPaystackResponse = (
  reference: string,
  amount: number,
  status: string = 'success'
): PaymentVerificationResponse => {
  return {
    success: status === 'success',
    data: {
      reference,
      amount,
      status,
      gateway_response: status === 'success' ? 'Successful' : 'Failed',
      paid_at: new Date().toISOString(),
      channel: 'card',
      currency: 'NGN',
      customer: {
        email: 'test@example.com',
        customer_code: 'CUS_test123',
        first_name: 'Test',
        last_name: 'User',
        phone: '+2341234567890',
      },
    },
    message:
      status === 'success' ? 'Verification successful' : 'Verification failed',
  };
};
