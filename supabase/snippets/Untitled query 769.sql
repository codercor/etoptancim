DROP POLICY IF EXISTS "Admins can insert exchange rates" ON public.exchange_rates;
DROP POLICY IF EXISTS "Admins can update exchange rates" ON public.exchange_rates;

CREATE POLICY "Service role can insert exchange rates" ON public.exchange_rates
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'role' = 'service_role'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Service role can update exchange rates" ON public.exchange_rates
  FOR UPDATE USING (
    auth.jwt() ->> 'role' = 'service_role'
    OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );