import { useState } from 'react';
import { Phone } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Director {
  id: string;
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  bio: string;
}

const directors: Director[] = [
  { id: 'd1', name: 'Director 1', role: 'Managing Director', phone: '01750904130', whatsapp: '01750904130', bio: 'Uttara Vilas প্রকল্পের প্রধান পরিচালক। জমি ক্রয় ও সার্বিক তত্ত্বাবধানে দায়িত্বরত।' },
  { id: 'd2', name: 'Director 2', role: 'Director', phone: '01515692855', whatsapp: '01515692855', bio: 'আর্থিক ব্যবস্থাপনা ও শেয়ারহোল্ডার সমন্বয়ে দায়িত্বরত।' },
  { id: 'd3', name: 'Director 3', role: 'Director', phone: '01860954210', whatsapp: '01860954210', bio: 'নির্মাণ পরিকল্পনা ও কারিগরি তত্ত্বাবধানে দায়িত্বরত।' },
  { id: 'd4', name: 'Director 4', role: 'Director', phone: '01923225638', whatsapp: '01923225638', bio: 'আইনি বিষয় ও রেজিস্ট্রেশন সংক্রান্ত কার্যক্রমে দায়িত্বরত।' },
  { id: 'd5', name: 'Director 5', role: 'Director', phone: '01623876141', whatsapp: '01623876141', bio: 'মার্কেটিং ও নতুন শেয়ারহোল্ডার সংগ্রহে দায়িত্বরত।' },
];

export default function Directors() {
  const [selected, setSelected] = useState<Director | null>(null);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-foreground">Directors</h1>
      <p className="text-sm text-muted-foreground">Uttara Vilas প্রকল্পের পরিচালনা পর্ষদ</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {directors.map((d, i) => (
          <Card
            key={d.id}
            className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer animate-fade-in"
            style={{ animationDelay: `${i * 60}ms` }}
            onClick={() => setSelected(d)}
          >
            <CardContent className="p-5">
              <div className="flex flex-col items-center text-center gap-3">
                <div className="w-24 h-24 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl flex-shrink-0">
                  {d.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-card-foreground text-lg">{d.name}</h3>
                  <p className="text-sm text-muted-foreground">{d.role}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                    <Phone className="w-3 h-3" /> {d.phone}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Director Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-5xl flex-shrink-0">
                  {selected.name.charAt(0)}
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-card-foreground">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.role}</p>
                </div>
              </div>
              <p className="text-sm text-card-foreground text-center">{selected.bio}</p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 justify-center">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-card-foreground">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="text-primary font-medium">WhatsApp:</span>
                  <a
                    href={`https://wa.me/88${selected.whatsapp}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    {selected.whatsapp}
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
