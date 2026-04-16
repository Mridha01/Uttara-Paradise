import { useState, useRef } from 'react';
import { Plus, Upload, Image as ImageIcon, X, Search, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { MAX_BOOKING_AMOUNT } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Payments() {
  const { shareholders, payments, addPayment, deletePayment, loading } = useApp();
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [detailPayment, setDetailPayment] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedShareholder, setSelectedShareholder] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'booking' | 'remaining'>('booking');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShareholder || !amount || !screenshotFile) {
      toast.error('Please fill all fields and upload screenshot');
      return;
    }
    const numAmount = Number(amount);
    const sh = shareholders.find(s => s.id === selectedShareholder);
    if (!sh) return;
    if (paymentType === 'booking' && numAmount > MAX_BOOKING_AMOUNT) {
      toast.error(`Booking max ৳${MAX_BOOKING_AMOUNT.toLocaleString()}`);
      return;
    }
    if (sh.total_paid + numAmount > sh.total_share) {
      toast.error(`Total cannot exceed ৳${sh.total_share.toLocaleString()}`);
      return;
    }
    setSubmitting(true);
    try {
      const screenshotUrl = await uploadImage('payment-screenshots', screenshotFile, 'payments');
      await addPayment({ shareholder_id: selectedShareholder, amount: numAmount, date, type: paymentType, screenshot_url: screenshotUrl });
      setSelectedShareholder(''); setAmount(''); setScreenshotFile(null); setPreviewUrl('');
      setDialogOpen(false);
      toast.success('Payment added! ✅');
    } catch { toast.error('Failed to add payment'); }
    setSubmitting(false);
  };

  const sortedPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(p => {
      if (!search) return true;
      const sh = shareholders.find(s => s.id === p.shareholder_id);
      const q = search.toLowerCase();
      return sh?.name.toLowerCase().includes(q) || sh?.phone.includes(q) || p.amount.toString().includes(q);
    });

  const handleDelete = async () => {
    if (!deleteId) return;
    await deletePayment(deleteId);
    setDeleteId(null);
    toast.success('Payment deleted!');
  };

  const detail = payments.find(p => p.id === detailPayment);
  const detailSh = detail ? shareholders.find(s => s.id === detail.shareholder_id) : null;

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

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
                        <SelectItem key={s.id} value={s.id}>{s.name} (Due: ৳{(s.total_share - s.total_paid).toLocaleString()})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>Amount (৳) *</Label><Input type="number" value={amount} onChange={e => setAmount(e.target.value)} min={1} required /></div>
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
                <div><Label>Date</Label><Input type="date" value={date} onChange={e => setDate(e.target.value)} /></div>
                <div>
                  <Label>Payment Screenshot *</Label>
                  <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                  {previewUrl ? (
                    <div className="relative mt-2">
                      <img src={previewUrl} alt="Receipt" className="w-full max-h-48 object-contain rounded-lg border border-border" />
                      <button type="button" onClick={() => { setPreviewUrl(''); setScreenshotFile(null); }} className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 w-full border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                      <Upload className="w-8 h-8" /><span className="text-sm">Upload screenshot</span>
                    </button>
                  )}
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Payment'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search by name, phone or amount..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Payments</p><p className="text-xl font-bold text-card-foreground">{payments.length}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total Collected</p><p className="text-xl font-bold text-success">৳{payments.reduce((s, p) => s + p.amount, 0).toLocaleString()}</p></CardContent></Card>
      </div>

      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">Payment History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedPayments.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No payments found</p>}
            {sortedPayments.map((p, i) => {
              const sh = shareholders.find(s => s.id === p.shareholder_id);
              return (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer animate-fade-in transition-colors" style={{ animationDelay: `${i * 40}ms` }} onClick={() => setDetailPayment(p.id)}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold flex-shrink-0">{sh?.name.charAt(0) || '?'}</div>
                    <div><p className="text-sm font-medium text-card-foreground">{sh?.name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{p.date}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-card-foreground">৳{p.amount.toLocaleString()}</p>
                    <Badge variant="outline" className="text-xs">{p.type === 'booking' ? 'Booking' : 'Remaining'}</Badge>
                    {p.screenshot_url && <ImageIcon className="w-4 h-4 text-primary" />}
                    {isAdmin && (
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!detailPayment} onOpenChange={(open) => !open && setDetailPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Payment Details</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">{detailSh?.name.charAt(0) || '?'}</div>
                <div><p className="font-semibold text-card-foreground">{detailSh?.name || 'Unknown'}</p><p className="text-xs text-muted-foreground">{detailSh?.phone}</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Amount</p><p className="font-bold text-lg text-card-foreground">৳{detail.amount.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Type</p><Badge variant="outline">{detail.type === 'booking' ? 'Booking' : 'Remaining'}</Badge></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium text-card-foreground">{detail.date}</p></div>
                <div><p className="text-muted-foreground">Recorded</p><p className="font-medium text-card-foreground">{new Date(detail.created_at).toLocaleDateString()}</p></div>
              </div>
              {detail.screenshot_url && (
                <div><p className="text-sm text-muted-foreground mb-2">Payment Slip</p><img src={detail.screenshot_url} alt="Payment slip" className="w-full rounded-lg border border-border max-h-96 object-contain" /></div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Payment?</AlertDialogTitle><AlertDialogDescription>This will permanently delete this payment and update the shareholder's balance.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
