-- Add booking_number to payment_logs to support multi-room booking groups
ALTER TABLE payment_logs ADD COLUMN IF NOT EXISTS booking_number TEXT;

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_logs_booking_number ON payment_logs(booking_number);
