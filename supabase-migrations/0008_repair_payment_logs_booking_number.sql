-- ============================================================
-- ONE-TIME DATA REPAIR: Backfill booking_number in payment_logs
-- ============================================================
-- This script extracts the first booking_id from the comma-separated
-- list stored in payment_logs.booking_id, looks up its booking_number
-- from the bookings table, and saves it to payment_logs.booking_number.
-- ============================================================

-- Step 1: Update payment_logs where booking_number is NULL
UPDATE payment_logs
SET booking_number = (
  SELECT b.booking_number
  FROM bookings b
  WHERE b.id = SPLIT_PART(payment_logs.booking_id, ',', 1)::uuid
  LIMIT 1
)
WHERE payment_logs.booking_number IS NULL
  AND payment_logs.booking_id IS NOT NULL;

-- Step 2: Verify (Optional - Run as separate query to check)
-- SELECT id, booking_id, booking_number FROM payment_logs;
