import { useState, useRef } from 'react';
import { Plus, Check, X as XIcon, Trash2, Calendar, TrendingUp, Users, CheckCircle2, XCircle, ShieldCheck, Upload, Image as ImageIcon, ExternalLink } from 'lucide-react';
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
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

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
      setScreenshotFile(null); setPreviewUrl(''); setDialogOpen(false);
      toast.success('Installment added successfully!');
    } catch (err: any) {
      if (err?.message?.includes('unique')) toast.error('This shareholder already paid for this month');
      else toast.error('Failed to add installment');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteInstallment(deleteId);
    setDeleteId(null);
    toast.success('Installment deleted successfully!');
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-cyan-500 animate-spin-reverse"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-6 lg:p-8 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="w-full lg:w-auto text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Calendar className="w-3 h-3" /> Monthly Tracking
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Installment Planner
            </h1>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            {/* Filter Controls embedded in header */}
            <div className="flex items-center gap-2 bg-white/10 border border-white/20 p-1.5 rounded-xl backdrop-blur-md">
              <Select value={String(selectedMonth)} onValueChange={v => setSelectedMonth(Number(v))}>
                <SelectTrigger className="w-32 bg-transparent border-0 text-white focus:ring-0 shadow-none h-9 font-medium"><SelectValue /></SelectTrigger>
                <SelectContent className="bg-background/95 backdrop-blur-xl border-border/50">
                  {MONTHS.map((m, i) => (<SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>))}
                </SelectContent>
              </Select>
              <div className="w-px h-6 bg-white/20 mx-1"></div>
              <Input type="number" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} className="w-20 bg-transparent border-0 text-white focus:ring-0 shadow-none h-9 font-medium text-center p-0" />
            </div>

            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto h-12 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white border-0 shadow-lg shadow-cyan-500/25 gap-2 transition-all hover:scale-105 px-6">
                    <Plus className="w-4 h-4" /> Record Installment
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl">
                  <DialogHeader><DialogTitle className="text-xl">Add Monthly Installment</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                      <Label className="text-foreground/80">Select Shareholder *</Label>
                      <Select value={form.shareholder_id} onValueChange={v => setForm(p => ({ ...p, shareholder_id: v }))}>
                        <SelectTrigger className="bg-muted/50"><SelectValue placeholder="Search shareholder" /></SelectTrigger>
                        <SelectContent className="max-h-60">
                          {shareholders.map(s => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-foreground/80">Amount (৳)</Label>
                      <Input className="bg-muted/50 text-lg font-bold" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} min={1} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-foreground/80">Target Month</Label>
                        <Select value={form.month} onValueChange={v => setForm(p => ({ ...p, month: v }))}>
                          <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {MONTHS.map((m, i) => (<SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5"><Label className="text-foreground/80">Year</Label><Input className="bg-muted/50" type="number" value={form.year} onChange={e => setForm(p => ({ ...p, year: e.target.value }))} /></div>
                    </div>
                    <div className="space-y-1.5"><Label className="text-foreground/80">Payment Date</Label><Input className="bg-muted/50" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>

                    <div className="space-y-1.5">
                      <Label className="text-foreground/80 flex items-center gap-1">Payment Slip (Optional)</Label>
                      <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                      {previewUrl ? (
                        <div className="relative mt-2 rounded-xl overflow-hidden border border-border/50 bg-muted/30 p-1 group">
                          <img src={previewUrl} alt="Receipt" className="w-full max-h-48 object-contain rounded-lg" />
                          <button type="button" onClick={() => { setPreviewUrl(''); setScreenshotFile(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600">
                            <XIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 w-full border-2 border-dashed border-cyan-500/30 bg-cyan-500/5 rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground hover:border-cyan-500 hover:bg-cyan-500/10 transition-colors">
                          <div className="p-3 rounded-full bg-cyan-500/10 text-cyan-500"><Upload className="w-6 h-6" /></div>
                          <span className="text-sm font-medium">Click to upload slip</span>
                        </button>
                      )}
                    </div>

                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white shadow-lg shadow-cyan-500/25 mt-4" disabled={submitting}>
                      {submitting ? 'Recording...' : 'Record Installment'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 text-center md:text-left">All-Time Collected</p>
            <p className="text-3xl font-extrabold text-emerald-500 tracking-tight text-center md:text-left">{formatBdtBangla(totalCollected)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 text-center md:text-left">Monthly Target</p>
            <p className="text-3xl font-extrabold text-cyan-500 tracking-tight text-center md:text-left">{formatBdtBangla(expectedMonthly)}</p>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
          <CardContent className="p-6 relative z-10">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1 text-center md:text-left">Plan Duration</p>
            <p className="text-3xl font-extrabold text-indigo-500 tracking-tight text-center md:text-left">{totalMonths} Months</p>
          </CardContent>
        </Card>
      </div>

      {/* Big Monthly Summary Dashboard */}
      <Card className="shadow-2xl border-cyan-500/30 bg-card/60 backdrop-blur-xl overflow-hidden rounded-3xl">
        <div className="h-1.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 w-full"></div>
        <CardHeader className="pb-2 pt-6">
          <CardTitle className="text-xl flex items-center gap-2 justify-center sm:justify-start">
            <TrendingUp className="w-6 h-6 text-cyan-500" />
            <span>{MONTHS_BN[selectedMonth - 1]} {selectedYear} Collection Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center transform transition-transform hover:scale-105">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-emerald-500/20 text-emerald-500 mb-2">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest">Paid Members</p>
              <p className="text-3xl font-extrabold text-emerald-500">{paidThisMonth} <span className="text-sm font-medium text-emerald-500/70">জন</span></p>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center transform transition-transform hover:scale-105">
              <div className="inline-flex items-center justify-center p-2 rounded-full bg-rose-500/20 text-rose-500 mb-2">
                <XCircle className="w-6 h-6" />
              </div>
              <p className="text-xs font-semibold text-rose-600/80 dark:text-rose-400/80 uppercase tracking-widest">Unpaid Due</p>
              <p className="text-3xl font-extrabold text-rose-500">{unpaidThisMonth} <span className="text-sm font-medium text-rose-500/70">জন</span></p>
            </div>

            <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4 text-center transform transition-transform hover:scale-105">
              <p className="text-xs font-semibold text-cyan-600/80 dark:text-cyan-400/80 uppercase tracking-widest mt-2 mb-1">Expected</p>
              <p className="text-xl sm:text-2xl font-extrabold text-cyan-500 truncate px-2">{formatBdtBangla(expectedMonthly)}</p>
              <p className="text-xs font-medium text-cyan-500/70 truncate mt-1">({totalShareholdersCount}×৳{monthlyAmount.toLocaleString()})</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-center transform transition-transform hover:scale-105">
              <p className="text-xs font-semibold text-amber-600/80 dark:text-amber-400/80 uppercase tracking-widest mt-2 mb-1">Remaining to Collect</p>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-500 truncate px-2">{formatBdtBangla(Math.max(0, monthRemaining))}</p>
            </div>
          </div>

          <div className="bg-background/50 rounded-2xl p-5 border border-border/50">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Month Progress</p>
                <p className="text-lg font-bold text-foreground">Collected: {formatBdtBangla(monthCollected)}</p>
              </div>
              <span className="text-2xl font-extrabold text-cyan-500">{Math.round((monthCollected / (expectedMonthly || 1)) * 100)}%</span>
            </div>
            <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50 shadow-inner">
              <div className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-1000 ease-out relative" style={{ width: `${(monthCollected / (expectedMonthly || 1)) * 100}%` }}>
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Horizontal Scrolling Avatar List */}
      <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-3 py-4">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-500" /> Shareholder Quick Status
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
            {shareholders.map(s => {
              const paidCount = installments.filter(i => i.shareholder_id === s.id).length;
              const isPaidThisMonth = paidIds.has(s.id);
              return (
                <button
                  key={s.id}
                  onClick={() => setViewShareholderId(s.id)}
                  className="flex-shrink-0 w-20 sm:w-24 flex flex-col items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition-all duration-300 group"
                >
                  <div className="relative">
                    {s.profile_image_url ? (
                      <img src={s.profile_image_url} alt={s.name} className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover shadow-md ring-4 transition-all group-hover:scale-105 ${isPaidThisMonth ? 'ring-emerald-500/40' : 'ring-rose-500/40'}`} />
                    ) : (
                      <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md ring-4 transition-all group-hover:scale-105 ${isPaidThisMonth ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 ring-emerald-500/40' : 'bg-gradient-to-br from-slate-400 to-slate-600 ring-rose-500/40'}`}>
                        {s.name.charAt(0)}
                      </div>
                    )}
                    <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-background flex items-center justify-center shadow-lg ${isPaidThisMonth ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                      {isPaidThisMonth ? <Check className="w-3.5 h-3.5 text-white" /> : <XIcon className="w-3 h-3 text-white" />}
                    </div>
                  </div>
                  <p className="text-xs font-semibold text-foreground line-clamp-1 text-center group-hover:text-primary transition-colors">{s.name}</p>
                  <Badge variant="outline" className={`text-[9px] sm:text-[10px] px-1.5 py-0 font-bold ${paidCount === totalMonths ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}`}>
                    {paidCount}/{totalMonths}
                  </Badge>
                </button>
              );
            })}
            {shareholders.length === 0 && <p className="text-sm text-muted-foreground w-full text-center py-6">No shareholders yet</p>}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Ledger List */}
      <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
          <CardTitle className="text-lg">Ledger — {MONTHS[selectedMonth - 1]}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border/50 max-h-[600px] overflow-y-auto custom-scrollbar">
            {shareholders.map((s, i) => {
              const paid = paidIds.has(s.id);
              const inst = currentMonthInstallments.find(item => item.shareholder_id === s.id);
              return (
                <div key={s.id} className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 transition-colors hover:bg-muted/30 ${paid ? 'bg-emerald-500/5' : 'bg-rose-500/5'}`}>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      {s.profile_image_url ? (
                        <img src={s.profile_image_url} alt={s.name} className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover shadow-sm" />
                      ) : (
                        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                          {s.name.charAt(0)}
                        </div>
                      )}
                      <div className={`absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full flex items-center justify-center shadow-md border-2 border-background ${paid ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                        {paid ? <Check className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-bold text-foreground">{s.name}</p>
                      <p className="text-xs font-medium text-muted-foreground">{s.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 pl-14 sm:pl-0">
                    {paid ? (
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 text-xs sm:text-sm px-3 py-1 font-bold">
                          ৳{inst?.amount.toLocaleString()}
                        </Badge>
                        {isAdmin && (
                          <button onClick={() => inst && setDeleteId(inst.id)} className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors bg-background border border-border/50 shadow-sm" title="Delete record">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-xs sm:text-sm px-3 py-1 font-bold">
                        Unpaid Due
                      </Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Per-shareholder installment view Dialog */}
      <Dialog open={!!viewShareholderId} onOpenChange={(open) => !open && setViewShareholderId(null)}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-hidden flex flex-col border-border/50 bg-background/95 backdrop-blur-xl rounded-3xl p-0">
          <DialogHeader className="p-6 pb-0 shrink-0">
            <DialogTitle className="text-xl">Shareholder History</DialogTitle>
          </DialogHeader>

          {viewedSh && (
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-4 space-y-6">
              {/* Profile Mini Header */}
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                {viewedSh.profile_image_url ? (
                  <img src={viewedSh.profile_image_url} alt={viewedSh.name} className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-2 ring-border" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm ring-2 ring-border">
                    {viewedSh.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-lg text-foreground truncate">{viewedSh.name}</p>
                  <p className="text-xs font-medium text-muted-foreground mb-1.5">{viewedSh.phone}</p>
                  <Badge variant="outline" className="bg-background">{viewedInstallments.length}/{totalMonths} Months Paid</Badge>
                </div>
              </div>

              {/* Stats Mini Grid */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase">Paid</p>
                  <p className="text-xl font-extrabold text-emerald-500">{viewedInstallments.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                  <p className="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70 uppercase">Due</p>
                  <p className="text-xl font-extrabold text-rose-500">{Math.max(0, totalMonths - viewedInstallments.length)}</p>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                  <p className="text-[10px] font-bold text-cyan-600/70 dark:text-cyan-400/70 uppercase">Total</p>
                  <p className="text-sm font-extrabold text-cyan-500 mt-1 truncate">৳{viewedInstallments.reduce((s, i) => s + i.amount, 0).toLocaleString()}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden border border-border/50">
                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-1000" style={{ width: `${(viewedInstallments.length / totalMonths) * 100}%` }}></div>
              </div>

              {/* Privacy Notice for non-admins */}
              {!isAdmin && viewedInstallments.length > 0 && (
                <div className="flex items-start gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">গোপনীয়তার জন্য পেমেন্ট স্লিপ সর্বজনীন ভিউতে দেখানো হয় না।</span>
                </div>
              )}

              {/* List */}
              <div className="space-y-3">
                {viewedInstallments.length === 0 && (
                  <div className="text-center py-8 bg-muted/20 rounded-2xl border border-dashed border-border/50">
                    <p className="text-muted-foreground font-medium">No installments recorded</p>
                  </div>
                )}
                {viewedInstallments.map((inst, i) => (
                  <div key={inst.id} className="p-4 rounded-2xl bg-background border border-border/50 shadow-sm hover:border-primary/30 transition-colors animate-fade-in" style={{ animationDelay: `${i * 30}ms` }}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="text-lg font-extrabold text-foreground">৳{inst.amount.toLocaleString()}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">{MONTHS[inst.month - 1]} {inst.year} • Paid on {new Date(inst.date).toLocaleDateString('en-GB')}</p>
                      </div>
                      <Badge variant="outline" className="bg-muted/50 self-start sm:self-auto font-semibold">Installment</Badge>
                    </div>

                    {/* Admin Only Image View */}
                    {isAdmin && inst.screenshot_url && (
                      <div className="mt-3 rounded-xl overflow-hidden border border-border/50 bg-muted/30 p-1 relative group cursor-pointer" onClick={() => window.open(inst.screenshot_url, '_blank')}>
                        <img src={inst.screenshot_url} alt="Installment slip" className="w-full max-h-48 object-cover rounded-lg group-hover:opacity-90 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-background/80 backdrop-blur-sm p-2 rounded-lg text-primary flex items-center gap-2 text-xs font-bold">
                            <ExternalLink className="w-4 h-4" /> View Full Slip
                          </div>
                        </div>
                      </div>
                    )}

                    {inst.notes && <div className="mt-3 text-xs text-muted-foreground bg-muted/50 p-2.5 rounded-lg border border-border/50">📝 {inst.notes}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Admin Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-rose-500/20 bg-background/95 backdrop-blur-xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Delete Installment?</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70 text-base">
              This action cannot be undone. This will permanently delete this installment record from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-muted/50 hover:bg-muted border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25 rounded-lg">Yes, Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
