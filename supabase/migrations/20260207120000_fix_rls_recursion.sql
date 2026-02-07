-- Create a secure function to check if the current user is an admin
-- SECURITY DEFINER means this function runs with the privileges of the creator (postgres/superuser)
-- allowing it to bypass RLS on the profiles table itself.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop the old recursive policies on profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Create new non-recursive policies using the secure function
CREATE POLICY "Admins can view all profiles_v2" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles_v2" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- Also update other admin policies to use the helper function for consistency/performance
-- Orders
DROP POLICY IF EXISTS "Admins can view all orders" ON public.orders;
CREATE POLICY "Admins can view all orders_v2" ON public.orders
  FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can update orders" ON public.orders;
CREATE POLICY "Admins can update orders_v2" ON public.orders
  FOR UPDATE USING (public.is_admin());

-- Order Items
DROP POLICY IF EXISTS "Admins can view all order items" ON public.order_items;
CREATE POLICY "Admins can view all order items_v2" ON public.order_items
  FOR SELECT USING (public.is_admin());
