-- Add portal access token to shareholders for secret-link portal access
ALTER TABLE public.shareholders
  ADD COLUMN IF NOT EXISTS portal_token text;

-- Generate tokens for existing shareholders that don't have one
UPDATE public.shareholders
SET portal_token = encode(gen_random_bytes(16), 'hex')
WHERE portal_token IS NULL OR portal_token = '';

-- Add signature image url column to directors
ALTER TABLE public.directors
  ADD COLUMN IF NOT EXISTS signature_url text DEFAULT '';

-- Add receipt_no column to payments for sequential receipt numbering
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS receipt_no text;

-- Backfill receipt numbers for existing payments (UV-YYYYMMDD-XXXX style based on created_at order)
WITH numbered AS (
  SELECT id,
         'UV-' || to_char(created_at, 'YYYYMM') || '-' ||
         lpad(row_number() OVER (PARTITION BY date_trunc('month', created_at) ORDER BY created_at)::text, 4, '0') AS rno
  FROM public.payments
  WHERE receipt_no IS NULL OR receipt_no = ''
)
UPDATE public.payments p
SET receipt_no = n.rno
FROM numbered n
WHERE p.id = n.id;

-- Make signature bucket public (for receipt rendering)
INSERT INTO storage.buckets (id, name, public)
VALUES ('director-signatures', 'director-signatures', true)
ON CONFLICT (id) DO NOTHING;

-- Permissive policies for the new bucket (matching existing project pattern)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public read director-signatures'
  ) THEN
    CREATE POLICY "Public read director-signatures" ON storage.objects
      FOR SELECT USING (bucket_id = 'director-signatures');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public upload director-signatures'
  ) THEN
    CREATE POLICY "Public upload director-signatures" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'director-signatures');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public update director-signatures'
  ) THEN
    CREATE POLICY "Public update director-signatures" ON storage.objects
      FOR UPDATE USING (bucket_id = 'director-signatures');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname = 'Public delete director-signatures'
  ) THEN
    CREATE POLICY "Public delete director-signatures" ON storage.objects
      FOR DELETE USING (bucket_id = 'director-signatures');
  END IF;
END $$;