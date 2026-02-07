-- Fix RLS policies for products and categories to use the is_admin() function
-- This resolves the issue where admins cannot insert products/categories
-- because the policies were checking the deprecated 'admins' table

-- Drop existing policies for categories
DROP POLICY IF EXISTS "Allow admin write for categories" ON categories;
DROP POLICY IF EXISTS "Allow admin update for categories" ON categories;
DROP POLICY IF EXISTS "Allow admin delete for categories" ON categories;

-- Drop existing policies for products
DROP POLICY IF EXISTS "Allow admin write for products" ON products;
DROP POLICY IF EXISTS "Allow admin update for products" ON products;
DROP POLICY IF EXISTS "Allow admin delete for products" ON products;

-- Re-create category policies using the is_admin() security definer function
CREATE POLICY "Allow admin write for categories" ON categories 
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update for categories" ON categories 
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Allow admin delete for categories" ON categories 
FOR DELETE USING (public.is_admin());

-- Re-create product policies using the is_admin() security definer function
CREATE POLICY "Allow admin write for products" ON products 
FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Allow admin update for products" ON products 
FOR UPDATE USING (public.is_admin());

CREATE POLICY "Allow admin delete for products" ON products 
FOR DELETE USING (public.is_admin());
