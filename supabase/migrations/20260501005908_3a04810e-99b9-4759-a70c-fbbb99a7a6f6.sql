-- Add director reference to shareholders
ALTER TABLE public.shareholders 
ADD COLUMN IF NOT EXISTS referred_by_director_id uuid;

CREATE INDEX IF NOT EXISTS idx_shareholders_referred_by ON public.shareholders(referred_by_director_id);

-- Private expenses table (admin-only via client gating; permissive RLS like other tables)
CREATE TABLE IF NOT EXISTS public.private_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  amount numeric NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  notes text DEFAULT '',
  category text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.private_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read private_expenses" ON public.private_expenses FOR SELECT USING (true);
CREATE POLICY "Public insert private_expenses" ON public.private_expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update private_expenses" ON public.private_expenses FOR UPDATE USING (true);
CREATE POLICY "Public delete private_expenses" ON public.private_expenses FOR DELETE USING (true);