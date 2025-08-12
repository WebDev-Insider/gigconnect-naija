export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  kyc_id?: string;
  created_at: Date;
  updated_at: Date;
  metadata?: Record<string, any>;
}

export interface Freelancer {
  id: string;
  user_id: string;
  tagline?: string;
  skills: string[];
  portfolio_public: Record<string, any>;
  bank_details: Record<string, any>; // Encrypted, admin-only access
  rating_avg: number;
  total_orders: number;
  completed_orders: number;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  user_id: string;
  total_spent: number;
  total_orders: number;
  created_at: Date;
  updated_at: Date;
}

export interface Gig {
  id: string;
  freelancer_id: string;
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  delivery_days: number;
  sample_media: string[];
  is_active: boolean;
  category: string;
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface Order {
  id: string;
  client_id: string;
  gig_id?: string;
  freelancer_id: string;
  amount_cents: number;
  currency: string;
  status: OrderStatus;
  custom_instructions?: string;
  payment_reference?: string;
  escrow_release_tx_id?: string;
  delivery_date?: Date;
  completed_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Transaction {
  id: string;
  order_id: string;
  type: TransactionType;
  amount_cents: number;
  status: TransactionStatus;
  paystack_reference?: string;
  metadata?: Record<string, any>;
  created_at: Date;
}

export interface Wallet {
  user_id: string;
  balance_cents: number;
  reserved_cents: number;
  updated_at: Date;
}

export interface Dispute {
  id: string;
  order_id: string;
  opened_by_user_id: string;
  reason: string;
  status: DisputeStatus;
  resolution?: string;
  admin_notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface KYCRecord {
  id: string;
  user_id: string;
  status: KYCStatus;
  docs: Record<string, any>;
  verified_by_admin_id?: string;
  verified_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Chat {
  _id: string;
  participants: string[];
  last_message_at: Date;
  order_id?: string;
  created_at: Date;
}

export interface Message {
  _id: string;
  chat_id: string;
  sender_id: string;
  type: MessageType;
  content: string;
  attachment_ref?: string;
  created_at: Date;
  delivered_at?: Date;
  read_by: string[];
}

export interface ActivityLog {
  _id: string;
  user_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  created_at: Date;
}

export interface FileMetadata {
  _id: string;
  storage_url: string;
  uploader_id: string;
  file_type: string;
  size: number;
  used_by: string[];
  created_at: Date;
}

export interface AuditEvent {
  _id: string;
  actor_id: string;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: Date;
}

// Enums
export enum UserRole {
  CLIENT = 'client',
  FREELANCER = 'freelancer',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export enum UserStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING_KYC = 'pending_kyc',
  VERIFIED = 'verified'
}

export enum OrderStatus {
  PENDING_PAYMENT = 'pending_payment',
  PAYMENT_PENDING_VERIFICATION = 'payment_pending_verification',
  IN_ESCROW = 'in_escrow',
  IN_PROGRESS = 'in_progress',
  DELIVERED = 'delivered',
  REVISION_REQUESTED = 'revision_requested',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  DISPUTED = 'disputed'
}

export enum TransactionType {
  ESCROW_CREDIT = 'escrow_credit',
  ESCROW_DEBIT = 'escrow_debit',
  ADMIN_PAYOUT = 'admin_payout',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal'
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

export enum DisputeStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  RESOLVED = 'resolved',
  CLOSED = 'closed'
}

export enum KYCStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  PAYMENT_PROOF = 'payment_proof'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchFilters {
  q?: string;
  category?: string;
  min_price?: number;
  max_price?: number;
  tags?: string[];
  status?: string;
  user_id?: string;
}

// Paystack Types
export interface PaystackWebhookData {
  event: string;
  data: {
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
}

// Request/Response Types
export interface CreateUserRequest {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role: UserRole;
}

export interface CreateGigRequest {
  title: string;
  description: string;
  price_cents: number;
  currency: string;
  delivery_days: number;
  category: string;
  tags: string[];
  sample_media?: string[];
}

export interface CreateOrderRequest {
  gig_id?: string;
  freelancer_id: string;
  amount_cents: number;
  currency: string;
  custom_instructions?: string;
}

export interface PaymentProofRequest {
  payment_reference: string;
  proof_file: any;
}

export interface ChatMessageRequest {
  content: string;
  type: MessageType;
  attachment_ref?: string;
}

// JWT Payload
export interface JWTPayload {
  user_id: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Middleware Types
export interface AuthenticatedRequest extends Express.Request {
  user?: User;
  token?: string;
}

export interface RoleRequiredRequest extends AuthenticatedRequest {
  user: User; // User is guaranteed to exist
}
