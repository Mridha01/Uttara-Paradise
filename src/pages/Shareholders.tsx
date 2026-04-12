import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Phone, MapPin } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TOTAL_SHARE_AMOUNT } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';

export default function Shareholders() {
  const { shareholders, addShareholder, currentRole } = useApp();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', address: '', bookingDate: new Date().toISOString().split('T')[0] });

  const isAdmin = currentRole === 'admin' || currentRole === 'director';
  const filtered = shareholders.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;
    addShareholder({ name: form.name, phone: form.phone, address: form.address, profileImage: '', bookingDate: form.bookingDate, totalShare: TOTAL_SHARE_AMOUNT });
    setForm({ name: '', phone: '', address: '', bookingDate: new Date().toISOString().split('T')[0] });
    setDialogOpen(false);
    toast.success('Shareholder added successfully!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-foreground">Shareholders</h1>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Shareholder</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add New Shareholder</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
                <div><Label>Phone *</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} required /></div>
                <div><Label>Address</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
                <div><Label>Booking Date</Label><Input type="date" value={form.bookingDate} onChange={e => setForm(p => ({ ...p, bookingDate: e.target.value }))} /></div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Add Shareholder</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name or phone..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((s, i) => (
          <Link key={s.id} to={`/shareholders/${s.id}`}>
            <Card className="shadow-card hover:shadow-elevated transition-shadow cursor-pointer animate-fade-in" style={{ animationDelay: `${i * 50}ms` }}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                    {s.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-card-foreground truncate">{s.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{s.phone}</div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5"><MapPin className="w-3 h-3" />{s.address || 'N/A'}</div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">Paid: ৳{s.totalPaid.toLocaleString()}</span>
                    <span className={s.status === 'fully_paid' ? 'text-success font-medium' : 'text-warning font-medium'}>
                      {s.status === 'fully_paid' ? '✓ Paid' : `Due: ৳${(TOTAL_SHARE_AMOUNT - s.totalPaid).toLocaleString()}`}
                    </span>
                  </div>
                  <Progress value={(s.totalPaid / TOTAL_SHARE_AMOUNT) * 100} className="h-1.5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
