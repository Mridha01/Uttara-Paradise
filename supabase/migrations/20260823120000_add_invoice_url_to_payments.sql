-- Store a manually-uploaded invoice/receipt file per payment.
-- Admin generates + uploads this file (e.g. via Payments > Edit Payment); shareholders
-- (admin panel and public portal) can only view/download it, never create or edit it.
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS invoice_url text DEFAULT '';
