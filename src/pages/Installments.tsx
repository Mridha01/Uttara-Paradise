import { useState } from 'react';
import { Plus, Check, X as XIcon, Trash2, Eye } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { INSTALLMENT_AMOUNT, INSTALLMENT_MONTHS, formatBdtBangla } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

export default function Installments() {
  const { shareholders, installments, settings, addInstallment, deleteInstallment, loading } = useApp();
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewShareholderId, setViewShareholderId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const monthlyAmount = Number(settings.installment_amount) || INSTALLMENT_AMOUNT;
  const totalMonths = Number(settings.installment_months) || INSTALLMENT_MONTHS;
  const [form, setForm] = useState({ shareholder_id: '', amount: String(monthlyAmount), month: String(new Date().getMonth() + 1), year: String(new Date().getFullYear()), date: new Date().toISOString().split('T')[0] });
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const currentMonthInstallments = installments.filter(i => i.month === selectedMonth && i.year === selectedYear);
  const paidIds = new Set(currentMonthInstallments.map(i => i.shareholder_id));
  const totalCollected = installments.reduce((s, i) => s + i.amount, 0);
  const monthCollected = currentMonthInstallments.reduce((s, i) => s + i.amount, 0);

  const totalShareholdersCount = shareholders.length;
  const expectedMonthly = totalShareholdersCount * monthlyAmount;
  const monthRemaining = expectedMonthly - monthCollected;
  const paidThisMonth = currentMonthInstallments.length;
  const unpaidThisMonth = totalShareholdersCount - paidThisMonth;

  const installmentsByShareholder = (id: string) => installments.filter(i => i.shareholder_id === id).sort((a, b) => b.year - a.year || b.month - a.month);
  const viewedSh = shareholders.find(s => s.id === viewShareholderId);
  const viewedInstallments = viewShareholderId ? installmentsByShareholder(viewShareholderId) : [];

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
        amount: Number(form.amount) || monthlyAmount,
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

      {/* Big Monthly Summary Header */}
      <Card className="shadow-card border-primary/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📊 {MONTHS_BN[selectedMonth - 1]} {selectedYear} — Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-success/10">
              <p className="text-xs text-muted-foreground">✅ দিয়েছে</p>
              <p className="text-2xl font-bold text-success">{paidThisMonth}</p>
              <p className="text-xs text-muted-foreground">জন</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <p className="text-xs text-muted-foreground">❌ বাকি</p>
              <p className="text-2xl font-bold text-destructive">{unpaidThisMonth}</p>
              <p className="text-xs text-muted-foreground">জন</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground">প্রত্যাশিত</p>
              <p className="text-lg font-bold text-primary">{formatBdtBangla(expectedMonthly)}</p>
              <p className="text-xs text-muted-foreground">{totalShareholdersCount} × ৳{monthlyAmount.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10">
              <p className="text-xs text-muted-foreground">এই মাসে বাকি</p>
              <p className="text-lg font-bold text-warning">{formatBdtBangla(Math.max(0, monthRemaining))}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">সংগৃহীত: {formatBdtBangla(monthCollected)}</span>
              <span className="text-muted-foreground">{Math.round((monthCollected / (expectedMonthly || 1)) * 100)}%</span>
            </div>
            <Progress value={(monthCollected / (expectedMonthly || 1)) * 100} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Overall Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Installment Collected (All-time)</p><p className="text-xl font-bold text-success">{formatBdtBangla(totalCollected)}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Per Month Target</p><p className="text-xl font-bold text-primary">{formatBdtBangla(expectedMonthly)}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Plan Duration</p><p className="text-xl font-bold text-card-foreground">{totalMonths} মাস</p></CardContent></Card>
      </div>

      {/* Horizontal Scrolling Shareholder List */}
      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">👥 সকল শেয়ারহোল্ডার ({shareholders.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-2 px-2">
            {shareholders.map(s => {
              const paidCount = installments.filter(i => i.shareholder_id === s.id).length;
              const isPaidThisMonth = paidIds.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setViewShareholderId(s.id)}
                  className="flex-shrink-0 w-24 flex flex-col items-center gap-1.5 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="relative">
                    {s.profile_image_url ? (
                      <img src={s.profile_image_url} alt={s.name} className={`w-16 h-16 rounded-full object-cover border-2 ${isPaidThisMonth ? 'border-success' : 'border-destructive/40'}`} />
                    ) : (
                      <div className={`w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl border-2 ${isPaidThisMonth ? 'border-success' : 'border-destructive/40'}`}>
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <span className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${isPaidThisMonth ? 'bg-success text-success-foreground' : 'bg-destructive text-destructive-foreground'}`}>
                      {isPaidThisMonth ? '✓' : '!'}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-card-foreground line-clamp-1 text-center">{s.name}</p>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0">{paidCount}/{totalMonths}</Badge>
                </button>
              );
            })}
            {shareholders.length === 0 && <p className="text-sm text-muted-foreground py-6">No shareholders yet</p>}
          </div>
        </CardContent>
      </Card>

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
                    {s.profile_image_url ? (
                      <img src={s.profile_image_url} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xs">{s.name.charAt(0)}</div>
                    )}
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

      {/* Per-shareholder installment view */}
      <Dialog open={!!viewShareholderId} onOpenChange={(open) => !open && setViewShareholderId(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Installment History</DialogTitle></DialogHeader>
          {viewedSh && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {viewedSh.profile_image_url ? (
                  <img src={viewedSh.profile_image_url} alt={viewedSh.name} className="w-14 h-14 rounded-full object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-xl">{viewedSh.name.charAt(0)}</div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-card-foreground">{viewedSh.name}</p>
                  <p className="text-xs text-muted-foreground">{viewedSh.phone}</p>
                </div>
                <Badge variant="outline">{viewedInstallments.length}/{totalMonths} months</Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-success/10"><p className="text-xs text-muted-foreground">পরিশোধিত</p><p className="text-lg font-bold text-success">{viewedInstallments.length}</p></div>
                <div className="p-2 rounded-lg bg-destructive/10"><p className="text-xs text-muted-foreground">বাকি</p><p className="text-lg font-bold text-destructive">{Math.max(0, totalMonths - viewedInstallments.length)}</p></div>
                <div className="p-2 rounded-lg bg-primary/10"><p className="text-xs text-muted-foreground">মোট</p><p className="text-sm font-bold text-primary">৳{viewedInstallments.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p></div>
              </div>
              <Progress value={(viewedInstallments.length / totalMonths) * 100} className="h-2" />
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {viewedInstallments.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No installments yet</p>}
                {viewedInstallments.map(inst => (
                  <div key={inst.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">৳{inst.amount.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{MONTHS[inst.month - 1]} {inst.year} • {inst.date}</p>
                    </div>
                    <Badge className="bg-success text-success-foreground">Paid</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Installment?</AlertDialogTitle><AlertDialogDescription>This will remove this installment record.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
