import { useState, useRef } from 'react';
import { Plus, Upload, Image as ImageIcon, X } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TOTAL_SHARE_AMOUNT, MAX_BOOKING_AMOUNT } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Payments() {
  const { shareholders, payments, addPayment, currentRole } = useApp();
  const isAdmin = currentRole === 'admin' || currentRole === 'director';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShareholder, setSelectedShareholder] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'booking' | 'remaining'>('booking');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [screenshot, setScreenshot] = useState<string>('');
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setScreenshot(url); // In production, upload to storage
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShareholder || !amount || !screenshot) {
      toast.error('Please fill all fields and upload screenshot');
      return;
    }

    const numAmount = Number(amount);
    const sh = shareholders.find(s => s.id === selectedShareholder);
    if (!sh) return;

    if (paymentType === 'booking' && numAmount > MAX_BOOKING_AMOUNT) {
      toast.error(`Booking payment max is ৳${MAX_BOOKING_AMOUNT.toLocaleString()}`);
      return;
    }

    if (sh.totalPaid + numAmount > TOTAL_SHARE_AMOUNT) {
      toast.error(`Total payment cannot exceed ৳${TOTAL_SHARE_AMOUNT.toLocaleString()}`);
      return;
    }

    addPayment({ shareholderId: selectedShareholder, amount: numAmount, date, type: paymentType, screenshotUrl: screenshot });
    setSelectedShareholder('');
    setAmount('');
    setScreenshot('');
    setPreviewUrl('');
    setDialogOpen(false);
    toast.success('Payment added successfully! ✅');
  };

  const sortedPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-foreground">Payments</h1>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Payment</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add Payment</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Shareholder *</Label>
                  <Select value={selectedShareholder} onValueChange={setSelectedShareholder}>
                    <SelectTrigger><SelectValue placeholder="Select shareholder" /></SelectTrigger>
                    <SelectContent>
                      {shareholders.filter(s => s.status !== 'fully_paid').map(s => (
                        <SelectItem key={s.id} value={s.id}>{s.name} (Due: ৳{(TOTAL_SHARE_AMOUNT - s.totalPaid).toLocaleString()})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount (৳) *</Label>
                  <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} min={1} max={TOTAL_SHARE_AMOUNT} required />
                </div>
                <div>
                  <Label>Payment Type *</Label>
                  <Select value={paymentType} onValueChange={v => setPaymentType(v as any)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking (Max ৳{MAX_BOOKING_AMOUNT.toLocaleString()})</SelectItem>
                      <SelectItem value="remaining">Remaining</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Date</Label>
                  <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div>
                  <Label>Payment Screenshot *</Label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {previewUrl ? (
                    <div className="relative mt-2">
                      <img src={previewUrl} alt="Receipt" className="w-full max-h-48 object-contain rounded-lg border border-border" />
                      <button type="button" onClick={() => { setPreviewUrl(''); setScreenshot(''); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="mt-2 w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                    >
                      <Upload className="w-8 h-8" />
                      <span className="text-sm">Upload screenshot</span>
                    </button>
                  )}
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Submit Payment</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Payments</p>
            <p className="text-xl font-bold text-card-foreground">{payments.length}</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Collected</p>
            <p className="text-xl font-bold text-success">৳{payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPayments.map((p, i) => {
              const sh = shareholders.find(s => s.id === p.shareholderId);
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">
                      {sh?.name.charAt(0) || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{sh?.name || 'Unknown'}</p>
                      <p className="text-xs text-muted-foreground">{p.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-card-foreground">৳{p.amount.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">{p.type === 'booking' ? 'Booking' : 'Remaining'}</Badge>
                    {p.screenshotUrl && <ImageIcon className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
