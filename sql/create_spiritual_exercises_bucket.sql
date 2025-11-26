-- Create Supabase Storage bucket for Spiritual Exercises images
-- Run this in Supabase SQL Editor

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'spiritual-exercises',
  'spiritual-exercises',
  true,
  52428800, -- 50 MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view spiritual exercises images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload spiritual exercises images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update spiritual exercises images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete spiritual exercises images" ON storage.objects;

-- 3. Policy: Public can view images
CREATE POLICY "Public can view spiritual exercises images"
ON storage.objects FOR SELECT
USING (bucket_id = 'spiritual-exercises');

-- 4. Policy: Authenticated users can upload images
CREATE POLICY "Authenticated users can upload spiritual exercises images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'spiritual-exercises');

-- 5. Policy: Authenticated users can update their images
CREATE POLICY "Authenticated users can update spiritual exercises images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'spiritual-exercises')
WITH CHECK (bucket_id = 'spiritual-exercises');

-- 6. Policy: Authenticated users can delete images
CREATE POLICY "Authenticated users can delete spiritual exercises images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'spiritual-exercises');

-- Verify bucket creation
SELECT * FROM storage.buckets WHERE id = 'spiritual-exercises';
