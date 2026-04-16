import { useState } from 'react';
import { Plus, Check, X as XIcon, Trash2 } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { INSTALLMENT_AMOUNT } from '@/types';
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

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Installments() {
  const { shareholders, installments, addInstallment, deleteInstallment, loading } = useApp();
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [form, setForm] = useState({ shareholder_id: '', amount: String(INSTALLMENT_AMOUNT), month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), date: new Date().toISOString().split('T')[0] });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentMonthInstallments = installments.filter(i => i.month === selectedMonth && i.year === selectedYear);
  const paidIds = new Set(currentMonthInstallments.map(i => i.shareholder_id));
  const totalCollected = installments.reduce((s, i) => s + i.amount, 0);
  const monthCollected = currentMonthInstallments.reduce((s, i) => s + i.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.shareholder_id) { toast.error('Select a shareholder'); return; }
    setSubmitting(true);
    try {
      let screenshotUrl = '';
      if (screenshotFile) {
        screenshotUrl = await uploadImage('payment-screenshots', screenshotFile, 'installments');
      }
      await addInstallment({
        shareholder_id: form.shareholder_id,
        amount: Number(form.amount) || INSTALLMENT_AMOUNT,
        month: Number(form.month), year: Number(form.year),
        date: form.date, screenshot_url: screenshotUrl,
      });
      setForm(p => ({ ...p, shareholder_id: '' }));
      setScreenshotFile(null); setDialogOpen(false);
      toast.success('Installment added!');
    } catch (err: any) {
      if (err?.message?.includes('unique')) toast.error('This shareholder already paid for this month');
      else toast.error('Failed to add');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteInstallment(deleteId);
    setDeleteId(null);
    toast.success('Installment deleted!');
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-foreground">📅 Installment Collection</h1>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Installment</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto">
              <DialogHeader><DialogTitle>Add Installment Payment</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Shareholder *</Label>
                  <Select value={form.shareholder_id} onValueChange={v => setForm(p => ({ ...p, shareholder_id: v }))}>
                    <SelectTrigger><SelectValue placeholder="Select shareholder" /></SelectTrigger>
                    <SelectContent>{shareholders.map(s => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}</SelectContent>
                  </Select>
                </div>
                <div><Label>Amount (৳)</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} min={1} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Month</Label>
                    <Select value={form.month} onValueChange={v => setForm(p => ({ ...p, month: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{MONTHS.map((m, i) => (<SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>))}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Year</Label><Input type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} /></div>
                </div>
                <div><Label>Payment Date</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                <div>
                  <Label>Screenshot (optional)</Label>
                  <Input type="file" accept="image/*" onChange={e => setScreenshotFile(e.target.files?.[0] || null)} />
                </div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>{submitting ? 'Adding...' : 'Add Installment'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Installment Collected</p><p className="text-xl font-bold text-success">৳{totalCollected.toLocaleString()}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">{MONTHS[selectedMonth - 1]} {selectedYear}</p><p className="text-xl font-bold text-primary">৳{monthCollected.toLocaleString()}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Paid This Month</p><p className="text-xl font-bold text-card-foreground">{currentMonthInstallments.length} / {shareholders.length}</p></CardContent></Card>
      </div>

      {/* Month Selector */}
      <div className="flex gap-3 items-center">
        <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>{MONTHS.map((m, i) => (<SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>))}</SelectContent>
        </Select>
        <Input type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-24" />
      </div>

      {/* Shareholder Status List */}
      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">Shareholder Status - {MONTHS[selectedMonth - 1]} {selectedYear}</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {shareholders.map(s => {
              const paid = paidIds.has(s.id);
              const inst = currentMonthInstallments.find(i => i.shareholder_id === s.id);
              return (
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-lg ${paid ? 'bg-success/10' : 'bg-destructive/5'}`}>
                  <div className="flex items-center gap-3">
                    {paid ? <Check className="w-5 h-5 text-success" /> : <XIcon className="w-5 h-5 text-destructive" />}
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {paid ? (
                      <>
                        <Badge className="bg-success text-success-foreground">৳{inst?.amount.toLocaleString()}</Badge>
                        {isAdmin && (
                          <button onClick={() => inst && setDeleteId(inst.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </>
                    ) : (
                      <Badge variant="destructive">Unpaid</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Installment?</AlertDialogTitle><AlertDialogDescription>This will remove this installment record.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
