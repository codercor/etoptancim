-- Multi-Currency System Migration
-- Creates exchange_rates table for daily USD/TRY rate storage

-- Create exchange_rates table
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  base_currency TEXT NOT NULL DEFAULT 'USD',
  target_currency TEXT NOT NULL DEFAULT 'TRY',
  rate NUMERIC(10, 4) NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for quick lookups of active rates
CREATE INDEX IF NOT EXISTS idx_exchange_rates_active 
ON public.exchange_rates(base_currency, target_currency, fetched_at DESC) 
WHERE is_active = true;

-- Enable RLS on exchange_rates
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read exchange rates (public data)
DROP POLICY IF EXISTS "Anyone can read exchange rates" ON public.exchange_rates;
CREATE POLICY "Anyone can read exchange rates" ON public.exchange_rates
  FOR SELECT USING (true);

-- Policy: Only admins can insert/update exchange rates
DROP POLICY IF EXISTS "Admins can insert exchange rates" ON public.exchange_rates;
CREATE POLICY "Admins can insert exchange rates" ON public.exchange_rates
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update exchange rates" ON public.exchange_rates;
CREATE POLICY "Admins can update exchange rates" ON public.exchange_rates
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert initial seed rate (approximate current USD/TRY rate)
-- This ensures the system works immediately after migration
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.exchange_rates WHERE base_currency = 'USD' AND target_currency = 'TRY') THEN
    INSERT INTO public.exchange_rates (base_currency, target_currency, rate, is_active)
    VALUES ('USD', 'TRY', 34.50, true);
  END IF;
END $$;

COMMENT ON TABLE public.exchange_rates IS 'Stores daily USD/TRY exchange rates fetched from Currency API';
