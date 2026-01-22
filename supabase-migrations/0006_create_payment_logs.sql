-- =============================================
-- PAYMENT LOGS TABLE
-- Stores payment initiation and transaction details
-- =============================================

CREATE TABLE IF NOT EXISTS payment_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  room_number TEXT,
  transaction_id VARCHAR(50) NOT NULL UNIQUE,
  data JSONB,
  firstname VARCHAR(100),
  phone VARCHAR(20),
  status VARCHAR(50) DEFAULT 'INITIATED',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_payment_logs_booking_id ON payment_logs(booking_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_txn_id ON payment_logs(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_phone ON payment_logs(phone);

-- RLS Policies
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role full access on payment_logs" 
ON payment_logs FOR ALL 
USING (auth.role() = 'service_role');

-- Admins can view logs
CREATE POLICY "Admins can view payment_logs" 
ON payment_logs FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() 
      AND role IN ('Owner', 'Manager', 'Accountant')
  )
);
