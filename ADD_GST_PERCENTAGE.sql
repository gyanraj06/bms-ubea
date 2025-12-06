-- =============================================
-- Add GST Percentage Column to Rooms Table
-- =============================================
-- Run this in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste and Run

-- Add gst_percentage column to rooms table
ALTER TABLE rooms
ADD COLUMN IF NOT EXISTS gst_percentage DECIMAL(5, 2) DEFAULT 0;

-- Add comment to the column
COMMENT ON COLUMN rooms.gst_percentage IS 'GST percentage to be applied on room price (0-100)';

-- Optional: Update existing rooms to have a default GST of 12% (Indian standard for hotel rooms)
-- You can skip this if you want existing rooms to have 0% GST
UPDATE rooms
SET gst_percentage = 12
WHERE gst_percentage = 0 OR gst_percentage IS NULL;

-- Add check constraint to ensure GST percentage is between 0 and 100
ALTER TABLE rooms
ADD CONSTRAINT check_gst_percentage
CHECK (gst_percentage >= 0 AND gst_percentage <= 100);
