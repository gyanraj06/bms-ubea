-- =============================================
-- ROOM BLOCKS TABLE
-- =============================================
-- This table allows blocking specific rooms for specific date ranges
-- Use cases: Personal bookings, maintenance, renovations, etc.

CREATE TABLE IF NOT EXISTS room_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason VARCHAR(100) NOT NULL CHECK (reason IN ('Personal Booking', 'Maintenance', 'Renovation', 'Other')),
  notes TEXT,
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure end_date is after start_date
  CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_room_blocks_room ON room_blocks(room_id);
CREATE INDEX IF NOT EXISTS idx_room_blocks_dates ON room_blocks(start_date, end_date);

-- RLS Policies
ALTER TABLE room_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage room blocks" 
  ON room_blocks FOR ALL 
  USING (auth.role() = 'service_role');

CREATE POLICY "Authenticated admins can manage room blocks" 
  ON room_blocks FOR ALL 
  USING (auth.role() = 'authenticated');

-- Trigger for updated_at
CREATE TRIGGER update_room_blocks_updated_at 
  BEFORE UPDATE ON room_blocks 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- COMPLETION
-- =============================================
-- After running this migration:
-- 1. Update the check-availability API to exclude blocked rooms
-- 2. Create admin UI to manage room blocks
-- 3. Test blocking specific date ranges
