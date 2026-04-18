-- Project content (editable text/list sections of Project Details page)
CREATE TABLE IF NOT EXISTS public.project_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  section TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.project_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read project_content" ON public.project_content FOR SELECT USING (true);
CREATE POLICY "Public insert project_content" ON public.project_content FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update project_content" ON public.project_content FOR UPDATE USING (true);
CREATE POLICY "Public delete project_content" ON public.project_content FOR DELETE USING (true);

INSERT INTO public.project_content (section, content) VALUES
  ('hero', '{"title":"🏗️ Uttara Vilas","tagline":"Your Future, Your Address","description":"ঢাকার উত্তরার অভিজাত এলাকায়, আধুনিক সুযোগ-সুবিধা এবং বিনিয়োগের নিরাপদ সম্ভাবনা নিয়ে আসছে আমাদের স্বপ্নের প্রকল্প"}'::jsonb),
  ('location', '{"items":["উত্তরা ১০ নম্বর সেক্টরের সংলগ্ন","বাংলাদেশের একমাত্র Elevated Expressway-এর ঠিক পাশে","সরকারি সচিবদের হাউজিং প্রকল্প \"প্রত্যাশা হাউজিং\"-এর পাশে","বিভিন্ন নামকরা মেডিকেল কলেজ, ইউনিভার্সিটি ও রিসোর্টের কাছাকাছি","উত্তরা উত্তর মেট্রো স্টেশন মাত্র ১৫–২০ মিনিট দূরত্ব"]}'::jsonb),
  ('overview', '{"items":[{"label":"জমির পরিমাণ","value":"১৪ কাঠা"},{"label":"বিল্ডিং টাইপ","value":"B+G+13"},{"label":"ফ্ল্যাট সাইজ","value":"১১৫০ sqft"},{"label":"গ্যারেজ","value":"৩০টি (~১৩০ sqft)"},{"label":"রাস্তা","value":"৪০ ft + ১০ ft"}]}'::jsonb),
  ('features', '{"items":["৮ মাত্রার ভূমিকম্প সহনীয় স্ট্রাকচার","কমিউনিটি হল","বাচ্চাদের খেলার জোন","রুফটপ সুইমিং পুল","প্লেয়ার রুম","সিকিউরিটি ও লবি সুবিধা"]}'::jsonb),
  ('income', '{"current_title":"বর্তমান আয় (প্লটে বিদ্যমান):","current_text":"~১৫টি রুম + ৪টি দোকান\nমাসিক ভাড়া: ~৳৭০,০০০–৮০,০০০","future_title":"উন্নয়নের পর:","future_text":"~৭০টি রুম\nসম্ভাব্য মাসিক আয়: ৳৩ লক্ষ+\n৩ বছরে সম্ভাব্য সঞ্চয়: ৳১ কোটির বেশি"}'::jsonb),
  ('why', '{"items":["✅ হালাল ও নিরাপদ বিনিয়োগ","✅ ১ বছরের মধ্যে শেয়ার মূল্য দ্বিগুণ হওয়ার সম্ভাবনা","✅ কম খরচে (৩৫–৪০ লক্ষ টাকায়) নিজের ফ্ল্যাট","✅ ভবিষ্যতে ১ কোটির বেশি মূল্যমানের সম্পদ"]}'::jsonb),
  ('timeline', '{"items":[{"emoji":"📅","text":"রেজিস্ট্রেশন: আগামী আগস্টের প্রথম সপ্তাহ","color":"primary"},{"emoji":"🏗️","text":"কনস্ট্রাকশন শুরু: ডিসেম্বর ২০২৯","color":"warning"}]}'::jsonb)
ON CONFLICT (section) DO NOTHING;

-- Rental Income module
CREATE TABLE IF NOT EXISTS public.rental_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  rooms INTEGER NOT NULL DEFAULT 20,
  rent_per_room NUMERIC NOT NULL DEFAULT 2500,
  shops INTEGER NOT NULL DEFAULT 0,
  rent_per_shop NUMERIC NOT NULL DEFAULT 0,
  target_months INTEGER NOT NULL DEFAULT 24,
  notes TEXT DEFAULT '',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.rental_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rental_config" ON public.rental_config FOR SELECT USING (true);
CREATE POLICY "Public insert rental_config" ON public.rental_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update rental_config" ON public.rental_config FOR UPDATE USING (true);
CREATE POLICY "Public delete rental_config" ON public.rental_config FOR DELETE USING (true);

INSERT INTO public.rental_config (rooms, rent_per_room, shops, rent_per_shop, target_months, notes)
SELECT 20, 2500, 0, 0, 24, 'Current land rental income'
WHERE NOT EXISTS (SELECT 1 FROM public.rental_config);

CREATE TABLE IF NOT EXISTS public.rental_collections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  amount NUMERIC NOT NULL,
  rooms INTEGER NOT NULL DEFAULT 0,
  shops INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  screenshot_url TEXT DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(month, year)
);
ALTER TABLE public.rental_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read rental_collections" ON public.rental_collections FOR SELECT USING (true);
CREATE POLICY "Public insert rental_collections" ON public.rental_collections FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update rental_collections" ON public.rental_collections FOR UPDATE USING (true);
CREATE POLICY "Public delete rental_collections" ON public.rental_collections FOR DELETE USING (true);