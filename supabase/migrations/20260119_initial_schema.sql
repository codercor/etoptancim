-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  product_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  price_usd DECIMAL(12,2),
  box_quantity INTEGER,
  specs JSONB DEFAULT '{}'::jsonb,
  barcode TEXT,
  image_urls TEXT[] DEFAULT '{}'::text[],
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create admins table
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Categories Policies
DROP POLICY IF EXISTS "Allow public read for categories" ON categories;
CREATE POLICY "Allow public read for categories" ON categories FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write for categories" ON categories;
CREATE POLICY "Allow admin write for categories" ON categories FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Allow admin update for categories" ON categories;
CREATE POLICY "Allow admin update for categories" ON categories FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Allow admin delete for categories" ON categories;
CREATE POLICY "Allow admin delete for categories" ON categories FOR DELETE USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Products Policies
DROP POLICY IF EXISTS "Allow public read for products" ON products;
CREATE POLICY "Allow public read for products" ON products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin write for products" ON products;
CREATE POLICY "Allow admin write for products" ON products FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Allow admin update for products" ON products;
CREATE POLICY "Allow admin update for products" ON products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

DROP POLICY IF EXISTS "Allow admin delete for products" ON products;
CREATE POLICY "Allow admin delete for products" ON products FOR DELETE USING (
  EXISTS (SELECT 1 FROM admins WHERE id = auth.uid())
);

-- Admins Policies
DROP POLICY IF EXISTS "Allow admins to read their own record" ON admins;
CREATE POLICY "Allow admins to read their own record" ON admins FOR SELECT USING (id = auth.uid());
