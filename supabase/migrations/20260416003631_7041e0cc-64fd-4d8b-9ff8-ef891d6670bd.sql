
-- Shareholders table
CREATE TABLE public.shareholders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address TEXT DEFAULT '',
  profile_image_url TEXT DEFAULT '',
  booking_date DATE NOT NULL DEFAULT CURRENT_DATE,
  num_shares INTEGER NOT NULL DEFAULT 1,
  total_share NUMERIC NOT NULL DEFAULT 550000,
  total_paid NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'booked' CHECK (status IN ('booked', 'partial', 'fully_paid')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shareholder_id UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  type TEXT NOT NULL DEFAULT 'booking' CHECK (type IN ('booking', 'remaining')),
  screenshot_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Expenses table
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'booking', 'shareholder', 'expense', 'installment')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activities table
CREATE TABLE public.activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'expense', 'shareholder', 'installment')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Directors table
CREATE TABLE public.directors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT DEFAULT '',
  role TEXT DEFAULT '',
  bio TEXT DEFAULT '',
  image_url TEXT DEFAULT '',
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Installments table
CREATE TABLE public.installments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shareholder_id UUID NOT NULL REFERENCES public.shareholders(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL DEFAULT 5000,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  year INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  screenshot_url TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(shareholder_id, month, year)
);

-- Enable RLS on all tables
ALTER TABLE public.shareholders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.directors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.installments ENABLE ROW LEVEL SECURITY;

-- Public read access for all tables
CREATE POLICY "Public read shareholders" ON public.shareholders FOR SELECT USING (true);
CREATE POLICY "Public read payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Public read expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Public read notifications" ON public.notifications FOR SELECT USING (true);
CREATE POLICY "Public read activities" ON public.activities FOR SELECT USING (true);
CREATE POLICY "Public read directors" ON public.directors FOR SELECT USING (true);
CREATE POLICY "Public read installments" ON public.installments FOR SELECT USING (true);

-- Public write access (admin check is client-side for now)
CREATE POLICY "Public insert shareholders" ON public.shareholders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update shareholders" ON public.shareholders FOR UPDATE USING (true);
CREATE POLICY "Public delete shareholders" ON public.shareholders FOR DELETE USING (true);

CREATE POLICY "Public insert payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Public delete payments" ON public.payments FOR DELETE USING (true);

CREATE POLICY "Public insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Public delete expenses" ON public.expenses FOR DELETE USING (true);

CREATE POLICY "Public insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update notifications" ON public.notifications FOR UPDATE USING (true);
CREATE POLICY "Public delete notifications" ON public.notifications FOR DELETE USING (true);

CREATE POLICY "Public insert activities" ON public.activities FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update activities" ON public.activities FOR UPDATE USING (true);
CREATE POLICY "Public delete activities" ON public.activities FOR DELETE USING (true);

CREATE POLICY "Public insert directors" ON public.directors FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update directors" ON public.directors FOR UPDATE USING (true);
CREATE POLICY "Public delete directors" ON public.directors FOR DELETE USING (true);

CREATE POLICY "Public insert installments" ON public.installments FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update installments" ON public.installments FOR UPDATE USING (true);
CREATE POLICY "Public delete installments" ON public.installments FOR DELETE USING (true);

-- Storage buckets for images
INSERT INTO storage.buckets (id, name, public) VALUES ('shareholder-images', 'shareholder-images', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('payment-screenshots', 'payment-screenshots', true);

-- Storage policies
CREATE POLICY "Public read shareholder images" ON storage.objects FOR SELECT USING (bucket_id = 'shareholder-images');
CREATE POLICY "Public upload shareholder images" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'shareholder-images');
CREATE POLICY "Public update shareholder images" ON storage.objects FOR UPDATE USING (bucket_id = 'shareholder-images');
CREATE POLICY "Public delete shareholder images" ON storage.objects FOR DELETE USING (bucket_id = 'shareholder-images');

CREATE POLICY "Public read payment screenshots" ON storage.objects FOR SELECT USING (bucket_id = 'payment-screenshots');
CREATE POLICY "Public upload payment screenshots" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'payment-screenshots');
CREATE POLICY "Public update payment screenshots" ON storage.objects FOR UPDATE USING (bucket_id = 'payment-screenshots');
CREATE POLICY "Public delete payment screenshots" ON storage.objects FOR DELETE USING (bucket_id = 'payment-screenshots');

-- Indexes for performance
CREATE INDEX idx_payments_shareholder ON public.payments(shareholder_id);
CREATE INDEX idx_installments_shareholder ON public.installments(shareholder_id);
CREATE INDEX idx_installments_month_year ON public.installments(year, month);

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.shareholders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.payments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.installments;
