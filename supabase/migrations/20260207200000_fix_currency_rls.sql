-- Fix RLS policies for exchange_rates table
-- Server-side updates (cron jobs, admin refresh) need service role access

-- Drop existing admin-only policies
DROP POLICY IF EXISTS "Admins can insert exchange rates" ON public.exchange_rates;
DROP POLICY IF EXISTS "Admins can update exchange rates" ON public.exchange_rates;

-- Create new policies that allow both service role and authenticated admins

-- Policy: Service role can insert (for automated updates)
DROP POLICY IF EXISTS "Service role can insert exchange rates" ON public.exchange_rates;
CREATE POLICY "Service role can insert exchange rates" ON public.exchange_rates
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Policy: Service role can update (for automated updates)
DROP POLICY IF EXISTS "Service role can update exchange rates" ON public.exchange_rates;
CREATE POLICY "Service role can update exchange rates" ON public.exchange_rates
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
