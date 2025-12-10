-- =============================================
-- 1. GALLERY IMAGES RLS POLICIES
-- =============================================
-- Enable RLS
ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view images
CREATE POLICY "Public can view gallery images" ON gallery_images FOR SELECT USING (true);

-- Allow admins (service_role) to do everything
CREATE POLICY "Service role can manage gallery images" ON gallery_images FOR ALL USING (auth.role() = 'service_role');

-- Allow authenticated admins to upload (INSERT)
CREATE POLICY "Authenticated admins can insert gallery images" ON gallery_images FOR INSERT WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

-- Allow authenticated admins to delete
CREATE POLICY "Authenticated admins can delete gallery images" ON gallery_images FOR DELETE USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');


-- =============================================
-- 2. STORAGE BUCKET POLICIES (Run these after creating 'gallery' bucket)
-- =============================================

-- Allow Public Read Access to 'gallery' bucket
CREATE POLICY "Public can view gallery bucket" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'gallery');

-- Allow Admins to Insert into 'gallery' bucket
CREATE POLICY "Admins can upload to gallery bucket" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'gallery' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));

-- Allow Admins to Delete from 'gallery' bucket
CREATE POLICY "Admins can delete from gallery bucket" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'gallery' AND (auth.role() = 'authenticated' OR auth.role() = 'service_role'));
