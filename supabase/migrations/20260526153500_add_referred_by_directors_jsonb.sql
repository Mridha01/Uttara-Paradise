-- Add referred_by_directors JSONB column to shareholders table to support multi-director share referrals
ALTER TABLE public.shareholders
ADD COLUMN IF NOT EXISTS referred_by_directors jsonb DEFAULT '{}'::jsonb;
