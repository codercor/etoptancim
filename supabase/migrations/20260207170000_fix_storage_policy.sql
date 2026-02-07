-- Drop existing policies
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Re-create Public Access Policy
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'catalog-images' );

-- Re-create Admin policies using profiles.role
CREATE POLICY "Admin Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'catalog-images' 
  AND (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
);

CREATE POLICY "Admin Update" 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'catalog-images' 
  AND (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
);

CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'catalog-images' 
  AND (auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin'))
);
