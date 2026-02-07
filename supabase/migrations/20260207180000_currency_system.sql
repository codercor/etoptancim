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
CREATE INDEX idx_exchange_rates_active 
ON public.exchange_rates(base_currency, target_currency, fetched_at DESC) 
WHERE is_active = true;

-- Enable RLS on exchange_rates
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read exchange rates (public data)
CREATE POLICY "Anyone can read exchange rates" ON public.exchange_rates
  FOR SELECT USING (true);

-- Policy: Only admins can insert/update exchange rates
CREATE POLICY "Admins can insert exchange rates" ON public.exchange_rates
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Admins can update exchange rates" ON public.exchange_rates
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Insert initial seed rate (approximate current USD/TRY rate)
-- This ensures the system works immediately after migration
INSERT INTO public.exchange_rates (base_currency, target_currency, rate, is_active)
VALUES ('USD', 'TRY', 34.50, true);

-- Add comment for documentation
COMMENT ON TABLE public.exchange_rates IS 'Stores daily USD/TRY exchange rates fetched from ExchangeRate-API';
