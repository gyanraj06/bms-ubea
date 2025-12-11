-- Add columns for UBEA discount
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS is_ubea_member BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS discount_amount DECIMAL(10, 2) DEFAULT 0;

-- Update the trigger function to remove GST calculation and include discount
CREATE OR REPLACE FUNCTION calculate_booking_amounts()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate nights (Explicitly cast to DATE to ensure integer subtraction, avoiding Interval '5 days' error)
  NEW.total_nights := (NEW.check_out::DATE - NEW.check_in::DATE);
  
  -- GST Logic: Removed as per previous request (Set to 0)
  NEW.gst_amount := 0; 
  
  -- Calculate Total Amount: Room Charges + GST (0) - Discount
  -- Ensure discount doesn't make total negative
  NEW.total_amount := GREATEST(0, NEW.room_charges + NEW.gst_amount - COALESCE(NEW.discount_amount, 0));
  
  -- Calculate Balance: Total - Advance
  NEW.balance_amount := NEW.total_amount - COALESCE(NEW.advance_paid, 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and Recreate Trigger to ensure it uses the updated function
DROP TRIGGER IF EXISTS calculate_booking_amounts_trigger ON bookings;
CREATE TRIGGER calculate_booking_amounts_trigger 
BEFORE INSERT OR UPDATE ON bookings 
FOR EACH ROW EXECUTE FUNCTION calculate_booking_amounts();
