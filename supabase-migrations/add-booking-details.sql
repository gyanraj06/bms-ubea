-- Migration: Add Enhanced Booking Details
-- Date: 2025-01-18
-- Description: Adds fields for Employee ID, document uploads, guest details, and additional requirements

-- Add new columns to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS bank_id_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS govt_id_image_url TEXT,
ADD COLUMN IF NOT EXISTS bank_id_image_url TEXT,
ADD COLUMN IF NOT EXISTS booking_for VARCHAR(20) DEFAULT 'self' CHECK (booking_for IN ('self', 'relative')),
ADD COLUMN IF NOT EXISTS guest_details JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS needs_cot BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS needs_extra_bed BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS num_cots INTEGER DEFAULT 0 CHECK (num_cots >= 0),
ADD COLUMN IF NOT EXISTS num_extra_beds INTEGER DEFAULT 0 CHECK (num_extra_beds >= 0);

-- Add comments for documentation
COMMENT ON COLUMN bookings.bank_id_number IS 'Bank account ID/number for payment verification';
COMMENT ON COLUMN bookings.govt_id_image_url IS 'Supabase Storage URL for government ID document image';
COMMENT ON COLUMN bookings.bank_id_image_url IS 'Supabase Storage URL for Employee ID document image';
COMMENT ON COLUMN bookings.booking_for IS 'Whether booking is for self or a relative';
COMMENT ON COLUMN bookings.guest_details IS 'JSONB array of guest details: [{name: string, age: number}]';
COMMENT ON COLUMN bookings.needs_cot IS 'Whether guest requires a cot/baby bed';
COMMENT ON COLUMN bookings.needs_extra_bed IS 'Whether guest requires an extra bed';
COMMENT ON COLUMN bookings.num_cots IS 'Number of cots requested';
COMMENT ON COLUMN bookings.num_extra_beds IS 'Number of extra beds requested';

-- Create index on booking_for for filtering
CREATE INDEX IF NOT EXISTS idx_bookings_booking_for ON bookings(booking_for);

-- Create index on guest_details for JSONB queries
CREATE INDEX IF NOT EXISTS idx_bookings_guest_details ON bookings USING gin(guest_details);

-- Example query to verify guest details structure:
-- SELECT id, booking_number, guest_details
-- FROM bookings
-- WHERE guest_details IS NOT NULL
-- AND jsonb_array_length(guest_details) > 0;

-- Example query to get bookings with additional requirements:
-- SELECT id, booking_number, num_guests, needs_cot, num_cots, needs_extra_bed, num_extra_beds
-- FROM bookings
-- WHERE needs_cot = true OR needs_extra_bed = true;
