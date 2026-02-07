-- Reset database for testing setup wizard
-- Run this in Supabase SQL Editor to test the setup flow

-- Delete all admin profiles
DELETE FROM public.profiles WHERE role = 'admin';

-- Also delete from admins table if it still exists
DELETE FROM public.admins;

-- Optionally: Delete test users from auth.users
-- (Uncomment if you want to completely remove auth users)
-- DELETE FROM auth.users WHERE email LIKE '%@example.com';

-- Verify admin count (should be 0)
SELECT COUNT(*) as admin_count FROM public.profiles WHERE role = 'admin';
