
-- Project settings (key/value)
CREATE TABLE IF NOT EXISTS public.project_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read project_settings" ON public.project_settings FOR SELECT USING (true);
CREATE POLICY "Public insert project_settings" ON public.project_settings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update project_settings" ON public.project_settings FOR UPDATE USING (true);
CREATE POLICY "Public delete project_settings" ON public.project_settings FOR DELETE USING (true);

INSERT INTO public.project_settings (key, value) VALUES
  ('land_price_total', '45500000'),
  ('target_shareholders', '91'),
  ('share_price', '550000'),
  ('booking_max', '50000'),
  ('installment_amount', '5000'),
  ('installment_months', '24')
ON CONFLICT (key) DO NOTHING;

-- Director roles (manageable list)
CREATE TABLE IF NOT EXISTS public.director_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.director_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read director_roles" ON public.director_roles FOR SELECT USING (true);
CREATE POLICY "Public insert director_roles" ON public.director_roles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update director_roles" ON public.director_roles FOR UPDATE USING (true);
CREATE POLICY "Public delete director_roles" ON public.director_roles FOR DELETE USING (true);

INSERT INTO public.director_roles (name, display_order) VALUES
  ('Chairman', 1),
  ('Managing Director', 2),
  ('Director', 3),
  ('Advisor', 4)
ON CONFLICT (name) DO NOTHING;
