-- =============================================
-- GALLERY IMAGES TABLE
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

-- RLS Policies
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view gallery images" ON gallery_images FOR SELECT USING (true);
CREATE POLICY "Service role can manage gallery images" ON gallery_images FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated admins can insert gallery images" ON gallery_images FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
CREATE POLICY "Authenticated admins can delete gallery images" ON gallery_images FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');


-- Storage Bucket Policies (Run in SQL Editor if bucket 'gallery' exists)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('gallery', 'gallery', true);
-- CREATE POLICY "Public can view gallery bucket" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
-- CREATE POLICY "Admins can upload to gallery bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'gallery' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
-- CREATE POLICY "Admins can delete from gallery bucket" ON storage.objects FOR DELETE USING (bucket_id = 'gallery' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
