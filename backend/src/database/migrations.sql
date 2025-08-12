-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
CREATE TYPE user_role AS ENUM ('client', 'freelancer', 'admin', 'moderator');
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_kyc', 'verified');
CREATE TYPE order_status AS ENUM (
  'pending_payment',
  'payment_pending_verification',
  'in_escrow',
  'in_progress',
  'delivered',
  'revision_requested',
  'completed',
  'cancelled',
  'disputed'
);
CREATE TYPE transaction_type AS ENUM (
  'escrow_credit',
  'escrow_debit',
  'admin_payout',
  'refund',
  'withdrawal'
);
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
CREATE TYPE kyc_status AS ENUM ('pending', 'verified', 'rejected');

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  status user_status NOT NULL DEFAULT 'pending_kyc',
  kyc_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Freelancers table
CREATE TABLE freelancers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tagline TEXT,
  skills TEXT[] DEFAULT '{}',
  portfolio_public JSONB DEFAULT '{}'::jsonb,
  bank_details JSONB DEFAULT '{}'::jsonb,
  rating_avg NUMERIC(3,2) DEFAULT 0.00,
  total_orders INTEGER DEFAULT 0,
  completed_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Clients table
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_spent INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Gigs table
CREATE TABLE gigs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  delivery_days INTEGER NOT NULL,
  sample_media TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  gig_id UUID REFERENCES gigs(id) ON DELETE SET NULL,
  freelancer_id UUID NOT NULL REFERENCES freelancers(id) ON DELETE CASCADE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  status order_status NOT NULL DEFAULT 'pending_payment',
  custom_instructions TEXT,
  payment_reference TEXT,
  escrow_release_tx_id TEXT,
  delivery_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  type transaction_type NOT NULL,
  amount_cents INTEGER NOT NULL,
  status transaction_status NOT NULL DEFAULT 'pending',
  paystack_reference TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Wallets table
CREATE TABLE wallets (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_cents INTEGER DEFAULT 0,
  reserved_cents INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disputes table
CREATE TABLE disputes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  opened_by_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status dispute_status NOT NULL DEFAULT 'open',
  resolution TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- KYC Records table
CREATE TABLE kyc_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status kyc_status NOT NULL DEFAULT 'pending',
  docs JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Audit Logs table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_kyc_id ON users(kyc_id);

CREATE INDEX idx_freelancers_user_id ON freelancers(user_id);
CREATE INDEX idx_freelancers_skills ON freelancers USING GIN(skills);

CREATE INDEX idx_clients_user_id ON clients(user_id);

CREATE INDEX idx_gigs_freelancer_id ON gigs(freelancer_id);
CREATE INDEX idx_gigs_category ON gigs(category);
CREATE INDEX idx_gigs_tags ON gigs USING GIN(tags);
CREATE INDEX idx_gigs_price ON gigs(price_cents);
CREATE INDEX idx_gigs_active ON gigs(is_active);
CREATE INDEX idx_gigs_created_at ON gigs(created_at);

CREATE INDEX idx_orders_client_id ON orders(client_id);
CREATE INDEX idx_orders_freelancer_id ON orders(freelancer_id);
CREATE INDEX idx_orders_gig_id ON orders(gig_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_reference ON orders(payment_reference);
CREATE INDEX idx_orders_created_at ON orders(created_at);

CREATE INDEX idx_transactions_order_id ON transactions(order_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_paystack_reference ON transactions(paystack_reference);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

CREATE INDEX idx_disputes_order_id ON disputes(order_id);
CREATE INDEX idx_disputes_status ON disputes(status);
CREATE INDEX idx_disputes_created_at ON disputes(created_at);

CREATE INDEX idx_kyc_records_user_id ON kyc_records(user_id);
CREATE INDEX idx_kyc_records_status ON kyc_records(status);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_target_type ON audit_logs(target_type);
CREATE INDEX idx_audit_logs_target_id ON audit_logs(target_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_freelancers_updated_at BEFORE UPDATE ON freelancers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_gigs_updated_at BEFORE UPDATE ON gigs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kyc_records_updated_at BEFORE UPDATE ON kyc_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelancers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE gigs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users RLS Policies
CREATE POLICY "Users can view their own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can create their own profile" ON users
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

CREATE POLICY "Admins can manage all users" ON users
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Freelancers RLS Policies
CREATE POLICY "Freelancers can view their own profile" ON freelancers
  FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Freelancers can update their own profile" ON freelancers
  FOR UPDATE USING (user_id = auth.uid()::uuid);

CREATE POLICY "Anyone can view public freelancer profiles" ON freelancers
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage all freelancers" ON freelancers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Clients RLS Policies
CREATE POLICY "Clients can view their own profile" ON clients
  FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Clients can update their own profile" ON clients
  FOR UPDATE USING (user_id = auth.uid()::uuid);

CREATE POLICY "Admins can manage all clients" ON clients
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Gigs RLS Policies
CREATE POLICY "Anyone can view active gigs" ON gigs
  FOR SELECT USING (is_active = true);

CREATE POLICY "Freelancers can manage their own gigs" ON gigs
  FOR ALL USING (
    freelancer_id IN (
      SELECT id FROM freelancers WHERE user_id = auth.uid()::uuid
    )
  )
  WITH CHECK (
    freelancer_id IN (
      SELECT id FROM freelancers WHERE user_id = auth.uid()::uuid
    )
  );

CREATE POLICY "Admins can manage all gigs" ON gigs
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Orders RLS Policies
CREATE POLICY "Users can view orders they're involved in" ON orders
  FOR SELECT USING (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()::uuid) OR
    freelancer_id IN (SELECT id FROM freelancers WHERE user_id = auth.uid()::uuid)
  );

CREATE POLICY "Clients can create orders" ON orders
  FOR INSERT WITH CHECK (
    client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()::uuid)
  );

CREATE POLICY "Admins can manage all orders" ON orders
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Transactions RLS Policies
CREATE POLICY "Users can view transactions for their orders" ON transactions
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE 
        client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()::uuid) OR
        freelancer_id IN (SELECT id FROM freelancers WHERE user_id = auth.uid()::uuid)
    )
  );

CREATE POLICY "Admins can manage all transactions" ON transactions
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Wallets RLS Policies
CREATE POLICY "Users can view their own wallet" ON wallets
  FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Admins can view all wallets" ON wallets
  FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Disputes RLS Policies
CREATE POLICY "Users can view disputes they're involved in" ON disputes
  FOR SELECT USING (
    order_id IN (
      SELECT id FROM orders WHERE 
        client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()::uuid) OR
        freelancer_id IN (SELECT id FROM freelancers WHERE user_id = auth.uid()::uuid)
    ) OR
    opened_by_user_id = auth.uid()::uuid
  );

CREATE POLICY "Users can create disputes for their orders" ON disputes
  FOR INSERT WITH CHECK (
    order_id IN (
      SELECT id FROM orders WHERE 
        client_id IN (SELECT id FROM clients WHERE user_id = auth.uid()::uuid) OR
        freelancer_id IN (SELECT id FROM freelancers WHERE user_id = auth.uid()::uuid)
    )
  );

CREATE POLICY "Admins can manage all disputes" ON disputes
  FOR ALL USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin')
  WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- KYC Records RLS Policies
CREATE POLICY "Users can view their own KYC record" ON kyc_records
  FOR SELECT USING (user_id = auth.uid()::uuid);

CREATE POLICY "Users can create their own KYC record" ON kyc_records
  FOR INSERT WITH CHECK (user_id = auth.uid()::uuid);

CREATE POLICY "Admins can manage all KYC records" ON kyc_records
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users WHERE id = auth.uid()::uuid AND role = 'admin'
    )
  );

-- Audit Logs RLS Policies
CREATE POLICY "Admins can view all audit logs" ON audit_logs
  FOR SELECT USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'admin');

-- Insert initial admin user (password should be changed after first login)
INSERT INTO users (email, full_name, phone, role, status) VALUES
('admin@gigconnect.ng', 'System Administrator', '+2341234567890', 'admin', 'verified');

-- Insert corresponding admin records
INSERT INTO freelancers (user_id, tagline, skills) VALUES
((SELECT id FROM users WHERE email = 'admin@gigconnect.ng'), 'System Admin', ARRAY['administration']);

INSERT INTO clients (user_id) VALUES
((SELECT id FROM users WHERE email = 'admin@gigconnect.ng'));

INSERT INTO wallets (user_id) VALUES
((SELECT id FROM users WHERE email = 'admin@gigconnect.ng'));
