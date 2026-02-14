-- Create storage bucket for catalog images
INSERT INTO storage.buckets (id, name) 
VALUES ('catalog-images', 'catalog-images')
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow public read access to all images
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'catalog-images' );

-- Policy: Allow authorized admins to upload images
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
CREATE POLICY "Admin Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'catalog-images' 
  AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Policy: Allow authorized admins to update images
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
CREATE POLICY "Admin Update" 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'catalog-images' 
  AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);

-- Policy: Allow authorized admins to delete images
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'catalog-images' 
  AND EXISTS (SELECT 1 FROM public.admins WHERE id = auth.uid())
);
