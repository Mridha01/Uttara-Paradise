import { useState } from 'react';
import { Phone, Edit, Save, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface Director {
  id: string;
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  bio: string;
  image: string;
}

const defaultDirectors: Director[] = [
  { id: 'd1', name: 'Director 1', role: 'Managing Director', phone: '01750904130', whatsapp: '01750904130', bio: 'Uttara Vilas প্রকল্পের প্রধান পরিচালক। জমি ক্রয় ও সার্বিক তত্ত্বাবধানে দায়িত্বরত।', image: '' },
  { id: 'd2', name: 'Director 2', role: 'Director', phone: '01515692855', whatsapp: '01515692855', bio: 'আর্থিক ব্যবস্থাপনা ও শেয়ারহোল্ডার সমন্বয়ে দায়িত্বরত।', image: '' },
  { id: 'd3', name: 'Director 3', role: 'Director', phone: '01860954210', whatsapp: '01860954210', bio: 'নির্মাণ পরিকল্পনা ও কারিগরি তত্ত্বাবধানে দায়িত্বরত।', image: '' },
  { id: 'd4', name: 'Director 4', role: 'Director', phone: '01923225638', whatsapp: '01923225638', bio: 'আইনি বিষয় ও রেজিস্ট্রেশন সংক্রান্ত কার্যক্রমে দায়িত্বরত।', image: '' },
  { id: 'd5', name: 'Director 5', role: 'Director', phone: '01623876141', whatsapp: '01623876141', bio: 'মার্কেটিং ও নতুন শেয়ারহোল্ডার সংগ্রহে দায়িত্বরত।', image: '' },
];

export default function Directors() {
  const { isAdmin } = useAuth();
  const [directors, setDirectors] = useState<Director[]>(defaultDirectors);
  const [selected, setSelected] = useState<Director | null>(null);
  const [editing, setEditing] = useState<Director | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, directorId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDirectors(prev => prev.map(d => d.id === directorId ? { ...d, image: url } : d));
    if (editing?.id === directorId) setEditing(prev => prev ? { ...prev, image: url } : null);
    if (selected?.id === directorId) setSelected(prev => prev ? { ...prev, image: url } : null);
  };

  const startEdit = (e: React.MouseEvent, d: Director) => {
    e.stopPropagation();
    setEditing({ ...d });
    setSelected(d);
  };

  const saveEdit = () => {
    if (!editing) return;
    setDirectors(prev => prev.map(d => d.id === editing.id ? editing : d));
    setSelected(editing);
    setEditing(null);
    toast.success('Director updated!');
  };

  const cancelEdit = () => setEditing(null);

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
            onClick={() => { setSelected(d); setEditing(null); }}
          >
            <CardContent className="p-5">
              <div className="flex flex-col items-center text-center gap-3">
                {d.image ? (
                  <img src={d.image} alt={d.name} className="w-28 h-28 rounded-full object-cover flex-shrink-0" />
                ) : (
                  <div className="w-28 h-28 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-3xl flex-shrink-0">
                    {d.name.charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-semibold text-card-foreground text-lg">{d.name}</h3>
                  <p className="text-sm text-muted-foreground">{d.role}</p>
                  <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mt-1">
                    <Phone className="w-3 h-3" /> {d.phone}
                  </div>
                </div>
                {isAdmin && (
                  <button
                    onClick={(e) => startEdit(e, d)}
                    className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selected} onOpenChange={(open) => { if (!open) { setSelected(null); setEditing(null); } }}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Director Details</DialogTitle>
          </DialogHeader>
          {selected && !editing && (
            <div className="space-y-5">
              <div className="flex flex-col items-center gap-3">
                {selected.image ? (
                  <img src={selected.image} alt={selected.name} className="w-40 h-40 rounded-xl object-cover" />
                ) : (
                  <div className="w-40 h-40 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-5xl">
                    {selected.name.charAt(0)}
                  </div>
                )}
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
                  <a href={`https://wa.me/88${selected.whatsapp}`} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    {selected.whatsapp}
                  </a>
                </div>
              </div>
              {isAdmin && (
                <Button onClick={() => setEditing({ ...selected })} variant="outline" className="w-full gap-2">
                  <Edit className="w-4 h-4" /> Edit Director
                </Button>
              )}
            </div>
          )}
          {editing && (
            <div className="space-y-4">
              <div className="flex flex-col items-center gap-3">
                {editing.image ? (
                  <img src={editing.image} alt={editing.name} className="w-32 h-32 rounded-xl object-cover" />
                ) : (
                  <div className="w-32 h-32 rounded-xl gradient-primary flex items-center justify-center text-primary-foreground font-bold text-4xl">
                    {editing.name.charAt(0)}
                  </div>
                )}
                <div>
                  <Label>Profile Image</Label>
                  <Input type="file" accept="image/*" onChange={e => handleImageUpload(e, editing.id)} />
                </div>
              </div>
              <div><Label>Name</Label><Input value={editing.name} onChange={e => setEditing(p => p ? { ...p, name: e.target.value } : null)} /></div>
              <div><Label>Role</Label><Input value={editing.role} onChange={e => setEditing(p => p ? { ...p, role: e.target.value } : null)} /></div>
              <div><Label>Phone</Label><Input value={editing.phone} onChange={e => setEditing(p => p ? { ...p, phone: e.target.value } : null)} /></div>
              <div><Label>WhatsApp</Label><Input value={editing.whatsapp} onChange={e => setEditing(p => p ? { ...p, whatsapp: e.target.value } : null)} /></div>
              <div><Label>Bio / Description</Label><Textarea value={editing.bio} onChange={e => setEditing(p => p ? { ...p, bio: e.target.value } : null)} rows={3} /></div>
              <div className="flex gap-2">
                <Button onClick={saveEdit} className="flex-1 gradient-primary text-primary-foreground gap-2"><Save className="w-4 h-4" /> Save</Button>
                <Button onClick={cancelEdit} variant="outline" className="gap-2"><X className="w-4 h-4" /> Cancel</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
