-- Create a security definer function to check if the user is an admin
-- This bypasses RLS on the profiles table to avoid recursion
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Admin Upload" ON storage.objects;
DROP POLICY IF EXISTS "Admin Update" ON storage.objects;
DROP POLICY IF EXISTS "Admin Delete" ON storage.objects;
DROP POLICY IF EXISTS "Public Access" ON storage.objects;

-- Re-create Public Access Policy
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'catalog-images' );

-- Re-create Admin policies using the security definer function
CREATE POLICY "Admin Upload" 
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'catalog-images' 
  AND public.is_admin()
);

CREATE POLICY "Admin Update" 
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'catalog-images' 
  AND public.is_admin()
);

CREATE POLICY "Admin Delete" 
ON storage.objects FOR DELETE
USING (
  bucket_id = 'catalog-images' 
  AND public.is_admin()
);
