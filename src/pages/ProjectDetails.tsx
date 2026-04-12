import { MapPin, Building2, Home, Car, Layers, Shield, DollarSign, Users, Calendar, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const features = [
  '৮ মাত্রার ভূমিকম্প সহনীয় স্ট্রাকচার',
  'কমিউনিটি হল',
  'বাচ্চাদের খেলার জোন',
  'রুফটপ সুইমিং পুল',
  'প্লেয়ার রুম',
  'সিকিউরিটি ও লবি সুবিধা',
];

const locationHighlights = [
  'উত্তরা ১০ নম্বর সেক্টরের সংলগ্ন',
  'বাংলাদেশের একমাত্র Elevated Expressway-এর ঠিক পাশে',
  'সরকারি সচিবদের হাউজিং প্রকল্প "প্রত্যাশা হাউজিং"-এর পাশে',
  'বিভিন্ন নামকরা মেডিকেল কলেজ, ইউনিভার্সিটি ও রিসোর্টের কাছাকাছি',
  'উত্তরা উত্তর মেট্রো স্টেশন মাত্র ১৫–২০ মিনিট দূরত্ব',
];

export default function ProjectDetails() {
  return (
    <div className="space-y-6">
      {/* Hero Banner */}
      <div className="gradient-primary rounded-xl p-6 text-primary-foreground">
        <h1 className="text-2xl lg:text-3xl font-bold">🏗️ Uttara Vilas</h1>
        <p className="text-primary-foreground/80 text-lg mt-1">Your Future, Your Address</p>
        <p className="text-primary-foreground/70 text-sm mt-2">
          ঢাকার উত্তরার অভিজাত এলাকায়, আধুনিক সুযোগ-সুবিধা এবং বিনিয়োগের নিরাপদ সম্ভাবনা নিয়ে আসছে আমাদের স্বপ্নের প্রকল্প
        </p>
      </div>

      {/* Location Highlights */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><MapPin className="w-5 h-5 text-primary" /> লোকেশন হাইলাইটস</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {locationHighlights.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-card-foreground">
                <span className="text-primary mt-0.5">📍</span> {item}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Project Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {[
          { icon: Layers, label: 'জমির পরিমাণ', value: '১৪ কাঠা' },
          { icon: Building2, label: 'বিল্ডিং টাইপ', value: 'B+G+13' },
          { icon: Home, label: 'মোট ইউনিট', value: '৯১টি' },
          { icon: Home, label: 'ফ্ল্যাট সাইজ', value: '১১৫০ sqft' },
          { icon: Car, label: 'গ্যারেজ', value: '৩০টি (~১৩০ sqft)' },
          { icon: Shield, label: 'রাস্তা', value: '৪০ ft + ১০ ft' },
        ].map((item, i) => (
          <Card key={i} className="shadow-card animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
            <CardContent className="p-4 text-center">
              <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="text-lg font-bold text-card-foreground">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Special Features */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🌟 স্পেশাল ফিচারস</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {features.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-card-foreground">
                <span className="text-primary">✔️</span> {f}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Investment Highlights */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><DollarSign className="w-5 h-5 text-primary" /> ইনভেস্টমেন্ট হাইলাইটস</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">জমির মোট মূল্য</p>
              <p className="text-lg font-bold text-card-foreground">৳৪,৫৫,০০,০০০</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">মোট শেয়ার</p>
              <p className="text-lg font-bold text-card-foreground">৯১ জন</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">প্রতি শেয়ারের মূল্য</p>
              <p className="text-lg font-bold text-card-foreground">৳৫,০০,০০০ + ৪৫,০০০</p>
            </div>
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-muted-foreground">বুকিং মানি</p>
              <p className="text-lg font-bold text-card-foreground">৳৫০,০০০</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Income Opportunity */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📈 আয়ের সুযোগ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-card-foreground">
          <div className="p-3 rounded-lg bg-muted">
            <p className="font-semibold">বর্তমান আয় (প্লটে বিদ্যমান):</p>
            <p>~১৫টি রুম + ৪টি দোকান</p>
            <p>মাসিক ভাড়া: ~৳৭০,০০০–৮০,০০০</p>
          </div>
          <div className="p-3 rounded-lg bg-muted">
            <p className="font-semibold">উন্নয়নের পর:</p>
            <p>~৭০টি রুম</p>
            <p>সম্ভাব্য মাসিক আয়: ৳৩ লক্ষ+</p>
            <p>৩ বছরে সম্ভাব্য সঞ্চয়: ৳১ কোটির বেশি</p>
          </div>
        </CardContent>
      </Card>

      {/* Why Uttara Vilas */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">🚀 কেন Uttara Vilas?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-card-foreground">
            <li>✅ হালাল ও নিরাপদ বিনিয়োগ</li>
            <li>✅ ১ বছরের মধ্যে শেয়ার মূল্য দ্বিগুণ হওয়ার সম্ভাবনা</li>
            <li>✅ কম খরচে (৩৫–৪০ লক্ষ টাকায়) নিজের ফ্ল্যাট</li>
            <li>✅ ভবিষ্যতে ১ কোটির বেশি মূল্যমানের সম্পদ</li>
          </ul>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Calendar className="w-5 h-5 text-primary" /> টাইমলাইন</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-card-foreground">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-primary flex-shrink-0" />
              <p>📅 রেজিস্ট্রেশন: আগামী আগস্টের প্রথম সপ্তাহ</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-warning flex-shrink-0" />
              <p>🏗️ কনস্ট্রাকশন শুরু: ডিসেম্বর ২০২৯</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact / Directors */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2"><Phone className="w-5 h-5 text-primary" /> যোগাযোগ</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">বিস্তারিত জানতে বা বুকিং করতে Directors-দের সাথে যোগাযোগ করুন:</p>
          <Link to="/directors">
            <Button className="gradient-primary text-primary-foreground gap-2">
              <Users className="w-4 h-4" /> View Directors
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
