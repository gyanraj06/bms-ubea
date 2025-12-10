-- =============================================
-- Union Awas Happy Holiday GUEST HOUSE - SUPABASE SCHEMA
-- =============================================
-- Run this entire file in Supabase SQL Editor
-- Dashboard > SQL Editor > New Query > Paste and Run

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. ADMIN USERS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Owner', 'Manager', 'Front Desk', 'Accountant')),
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_role ON admin_users(role);

-- =============================================
-- 2. PERMISSIONS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  permission_key VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  href VARCHAR(255) NOT NULL,
  roles TEXT[] DEFAULT '{}', -- Array of role names
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster permission lookups
CREATE INDEX IF NOT EXISTS idx_permissions_key ON permissions(permission_key);

-- =============================================
-- 3. USERS (GUESTS) TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- Nullable for Google SSO users
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'India',
  pincode VARCHAR(10),
  id_proof_type VARCHAR(50), -- Aadhar, Passport, Driving License
  id_proof_number VARCHAR(100),
  google_id VARCHAR(255) UNIQUE, -- For Google SSO
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

-- =============================================
-- 4. ROOMS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_number VARCHAR(20) UNIQUE NOT NULL,
  room_type VARCHAR(100) NOT NULL, -- Deluxe, Suite, Premium, etc.
  floor INTEGER NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2,
  base_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  amenities TEXT[], -- Array of amenities
  size_sqft INTEGER,
  bed_type VARCHAR(50), -- King, Queen, Twin, etc.
  view_type VARCHAR(50), -- Garden, City, Mountain, etc.
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  images TEXT[], -- Array of image URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_rooms_number ON rooms(room_number);
CREATE INDEX IF NOT EXISTS idx_rooms_type ON rooms(room_type);
CREATE INDEX IF NOT EXISTS idx_rooms_available ON rooms(is_available);

-- =============================================
-- 5. BOOKINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE RESTRICT,
  guest_name VARCHAR(255) NOT NULL,
  guest_email VARCHAR(255) NOT NULL,
  guest_phone VARCHAR(20) NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  total_nights INTEGER NOT NULL,
  num_guests INTEGER NOT NULL DEFAULT 1,
  num_adults INTEGER NOT NULL DEFAULT 1,
  num_children INTEGER DEFAULT 0,
  room_charges DECIMAL(10, 2) NOT NULL,
  gst_amount DECIMAL(10, 2) NOT NULL, -- 12% GST
  total_amount DECIMAL(10, 2) NOT NULL,
  advance_paid DECIMAL(10, 2) DEFAULT 0,
  balance_amount DECIMAL(10, 2) NOT NULL,
  special_requests TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'checked-in', 'checked-out', 'cancelled')),
  payment_status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'refunded')),
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancelled_by UUID REFERENCES admin_users(id),
  created_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bookings_number ON bookings(booking_number);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_room ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(check_in, check_out);

-- =============================================
-- 6. PAYMENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id VARCHAR(100) UNIQUE NOT NULL,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL, -- Card, UPI, Cash, Net Banking
  payment_type VARCHAR(50) NOT NULL, -- Advance, Full, Balance
  payment_gateway VARCHAR(50), -- Razorpay, Paytm, etc.
  gateway_transaction_id VARCHAR(255),
  gateway_response JSON,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'refunded')),
  remarks TEXT,
  processed_by UUID REFERENCES admin_users(id),
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_payments_transaction ON payments(transaction_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- =============================================
-- 7. MESSAGES TABLE (Communication)
-- =============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  sender_type VARCHAR(20) NOT NULL CHECK (sender_type IN ('admin', 'guest')),
  recipient_email VARCHAR(255),
  recipient_phone VARCHAR(20),
  channel VARCHAR(20) NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp', 'internal')),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_sent BOOLEAN DEFAULT false,
  sent_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  sent_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_messages_from_user ON messages(from_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_to_user ON messages(to_user_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking ON messages(booking_id);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);

-- =============================================
-- 8. MEDIA TABLE (Property Photos)
-- =============================================
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  file_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(500) NOT NULL, -- Supabase storage path
  file_url TEXT NOT NULL, -- Public URL
  file_size INTEGER, -- Size in bytes
  file_type VARCHAR(50), -- image/jpeg, image/png, etc.
  category VARCHAR(50) NOT NULL CHECK (category IN ('Rooms', 'Facilities', 'Exterior', 'Events', 'Other')),
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  title VARCHAR(255),
  description TEXT,
  alt_text VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  uploaded_by UUID REFERENCES admin_users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_media_category ON media(category);
CREATE INDEX IF NOT EXISTS idx_media_room ON media(room_id);
CREATE INDEX IF NOT EXISTS idx_media_featured ON media(is_featured);

-- =============================================
-- 9. PROPERTY SETTINGS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS property_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_name VARCHAR(255) NOT NULL DEFAULT 'Union Awas Happy Holiday Guest House',
  address TEXT NOT NULL DEFAULT '94, Hanuman Nagar, Narmadapuram Road, near Shani Mandir and SMH Hospital, behind UcoBank, Bhopal',
  phone VARCHAR(20) NOT NULL DEFAULT '+91 9926770259',
  email VARCHAR(255) NOT NULL DEFAULT 'info@happyholidays.com',
  gst_number VARCHAR(50) DEFAULT '',
  check_in_time TIME DEFAULT '14:00',
  check_out_time TIME DEFAULT '11:00',
  google_maps_embed_url TEXT,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Insert default settings
INSERT INTO property_settings (property_name, address, phone, email, gst_number, check_in_time, check_out_time, google_maps_embed_url, description)
VALUES (
  'Union Awas Happy Holiday Guest House',
  '94, Hanuman Nagar, Narmadapuram Road, near Shani Mandir and SMH Hospital, behind UcoBank, Bhopal',
  '+91 9926770259',
  'info@happyholidays.com',
  '22AAAAA0000A1Z5',
  '14:00',
  '11:00',
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3665.4598739812!2d77.42277477535677!3d23.23629397906128!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x397c431e5f426f07%3A0x9c6ea93cdbb8c26c!2sHappy%20Holidays%20Guest%20House!5e0!3m2!1sen!2sin!4v1735718000000!5m2!1sen!2sin',
  'Welcome to Union Awas Happy Holiday Guest House - Your home away from home in Bhopal'
)
ON CONFLICT DO NOTHING;

-- =============================================
-- 10. AUDIT LOG TABLE (Track all changes)
-- =============================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, LOGOUT
  table_name VARCHAR(100) NOT NULL,
  record_id UUID,
  old_data JSON,
  new_data JSON,
  ip_address VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at);

-- =============================================
-- TRIGGERS
-- =============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_permissions_updated_at BEFORE UPDATE ON permissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_media_updated_at BEFORE UPDATE ON media FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate booking number
CREATE OR REPLACE FUNCTION generate_booking_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.booking_number IS NULL OR NEW.booking_number = '' THEN
    NEW.booking_number := 'BK' || TO_CHAR(NOW(), 'YYYYMMDD') || LPAD(NEXTVAL('booking_number_seq')::TEXT, 5, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE SEQUENCE IF NOT EXISTS booking_number_seq START 1;
CREATE TRIGGER generate_booking_number_trigger BEFORE INSERT ON bookings FOR EACH ROW EXECUTE FUNCTION generate_booking_number();

-- Auto-calculate GST and totals for bookings
CREATE OR REPLACE FUNCTION calculate_booking_amounts()
RETURNS TRIGGER AS $$
BEGIN
  NEW.total_nights := NEW.check_out - NEW.check_in;
  NEW.gst_amount := ROUND(NEW.room_charges * 0.12, 2);
  NEW.total_amount := NEW.room_charges + NEW.gst_amount;
  NEW.balance_amount := NEW.total_amount - COALESCE(NEW.advance_paid, 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER calculate_booking_amounts_trigger BEFORE INSERT OR UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION calculate_booking_amounts();

-- =============================================
-- INSERT DEFAULT DATA
-- =============================================

-- Insert default admin users (passwords need to be hashed - we'll do this via API)
-- Password format: Role@123 (e.g., Owner@123, Manager@123)
-- These will be inserted via the API with proper bcrypt hashing

-- Insert default permissions
INSERT INTO permissions (permission_key, name, description, href, roles) VALUES
  ('dashboard', 'Dashboard', 'View dashboard overview and statistics', '/admin/dashboard', ARRAY['Owner', 'Manager', 'Front Desk', 'Accountant']),
  ('bookings', 'Bookings', 'Create, edit, and manage bookings', '/admin/dashboard/bookings', ARRAY['Owner', 'Manager', 'Front Desk']),
  ('payments', 'Payments & Finance', 'Access revenue and financial data', '/admin/dashboard/payments', ARRAY['Owner', 'Manager', 'Accountant']),
  ('communication', 'Communication', 'Send messages and notifications to guests', '/admin/dashboard/communication', ARRAY['Owner', 'Manager', 'Front Desk', 'Accountant']),
  ('media', 'Property Media', 'Upload and manage property photos', '/admin/dashboard/media', ARRAY['Owner', 'Manager']),
  ('reports', 'Reports & Analytics', 'View reports and analytics', '/admin/dashboard/reports', ARRAY['Owner', 'Manager', 'Accountant']),
  ('settings', 'Settings', 'Configure property settings and manage users', '/admin/dashboard/settings', ARRAY['Owner'])
ON CONFLICT (permission_key) DO NOTHING;

-- Insert sample rooms
INSERT INTO rooms (room_number, room_type, floor, max_guests, base_price, description, amenities, size_sqft, bed_type, view_type) VALUES
  ('101', 'Deluxe Room', 1, 2, 2500.00, 'Comfortable deluxe room with modern amenities', ARRAY['WiFi', 'AC', 'TV', 'Mini Fridge'], 300, 'Queen', 'Garden'),
  ('102', 'Deluxe Room', 1, 2, 2500.00, 'Comfortable deluxe room with modern amenities', ARRAY['WiFi', 'AC', 'TV', 'Mini Fridge'], 300, 'Queen', 'Garden'),
  ('201', 'Premium Suite', 2, 3, 4500.00, 'Spacious suite with separate living area', ARRAY['WiFi', 'AC', 'TV', 'Mini Fridge', 'Sofa', 'Work Desk'], 500, 'King', 'City'),
  ('202', 'Premium Suite', 2, 3, 4500.00, 'Spacious suite with separate living area', ARRAY['WiFi', 'AC', 'TV', 'Mini Fridge', 'Sofa', 'Work Desk'], 500, 'King', 'City'),
  ('301', 'Luxury Suite', 3, 4, 6500.00, 'Premium luxury suite with balcony', ARRAY['WiFi', 'AC', 'TV', 'Mini Fridge', 'Sofa', 'Work Desk', 'Balcony', 'Bathtub'], 700, 'King', 'Mountain')
ON CONFLICT (room_number) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for admin_users (only accessible by service role)
CREATE POLICY "Service role can do everything on admin_users" ON admin_users FOR ALL USING (auth.role() = 'service_role');

-- Policies for permissions (readable by authenticated users)
CREATE POLICY "Authenticated users can read permissions" ON permissions FOR SELECT USING (auth.role() = 'authenticated' OR auth.role() = 'anon');
CREATE POLICY "Service role can manage permissions" ON permissions FOR ALL USING (auth.role() = 'service_role');

-- Policies for users (users can read/update their own data)
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (auth.uid()::text = id::text OR auth.role() = 'service_role');
CREATE POLICY "Users can update their own data" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Service role can manage users" ON users FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Anyone can create user account" ON users FOR INSERT WITH CHECK (true);

-- Policies for rooms (public read, admin manage)
CREATE POLICY "Anyone can read available rooms" ON rooms FOR SELECT USING (is_active = true OR auth.role() = 'service_role');
CREATE POLICY "Service role can manage rooms" ON rooms FOR ALL USING (auth.role() = 'service_role');

-- Policies for bookings
CREATE POLICY "Users can read their own bookings" ON bookings FOR SELECT USING (user_id::text = auth.uid()::text OR auth.role() = 'service_role');
CREATE POLICY "Service role can manage bookings" ON bookings FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Policies for payments
CREATE POLICY "Users can read their own payments" ON payments FOR SELECT USING (user_id::text = auth.uid()::text OR auth.role() = 'service_role');
CREATE POLICY "Service role can manage payments" ON payments FOR ALL USING (auth.role() = 'service_role');

-- Policies for messages
CREATE POLICY "Users can read their own messages" ON messages FOR SELECT USING (from_user_id::text = auth.uid()::text OR to_user_id::text = auth.uid()::text OR auth.role() = 'service_role');
CREATE POLICY "Service role can manage messages" ON messages FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (from_user_id::text = auth.uid()::text OR auth.role() = 'service_role');

-- Policies for media (public read, admin manage)
CREATE POLICY "Anyone can read media" ON media FOR SELECT USING (true);
CREATE POLICY "Service role can manage media" ON media FOR ALL USING (auth.role() = 'service_role');

-- Policies for audit_logs (service role only)
CREATE POLICY "Service role can manage audit logs" ON audit_logs FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- STORAGE BUCKETS (Run in Storage section)
-- =============================================
-- Go to Storage > Create a new bucket
-- 1. Bucket name: property-media (Public bucket)
-- 2. Bucket name: documents (Private bucket - for ID proofs, invoices)

-- =============================================
-- STORAGE POLICIES (Run after creating buckets)
-- =============================================
-- For property-media bucket:
-- CREATE POLICY "Public can view property media" ON storage.objects FOR SELECT USING (bucket_id = 'property-media');
-- CREATE POLICY "Service role can manage property media" ON storage.objects FOR ALL USING (bucket_id = 'property-media' AND auth.role() = 'service_role');

-- For documents bucket:
-- CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.role() = 'service_role'));
-- CREATE POLICY "Service role can manage documents" ON storage.objects FOR ALL USING (bucket_id = 'documents' AND auth.role() = 'service_role');

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
-- Already created inline with table definitions above

-- =============================================
-- COMPLETION MESSAGE
-- =============================================
-- Schema setup complete! Now:
-- 1. Go to Storage and create buckets: property-media (public), documents (private)
-- 2. Run the storage policies mentioned above
-- 3. Test admin user creation will be done via API with password hashing

-- =============================================
-- 11. GALLERY IMAGES TABLE (Added 2025-12-10)
-- =============================================
CREATE TABLE IF NOT EXISTS gallery_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by UUID REFERENCES admin_users(id)
);

-- RLS for Gallery Images
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Service role can manage gallery images" ON gallery_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated admins can insert gallery images" ON gallery_images FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Authenticated admins can delete gallery images" ON gallery_images FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- =============================================
-- GALLERY STORAGE INSTRUCTIONS
-- =============================================
-- 1. Create a new public bucket named 'gallery'
-- 2. Add Policies:
--    - SELECT: (bucket_id = 'gallery') -> Public
--    - INSERT: (bucket_id = 'gallery' AND auth.role() IN ('authenticated', 'service_role')) -> Admin
--    - DELETE: (bucket_id = 'gallery' AND auth.role() IN ('authenticated', 'service_role')) -> Admin
