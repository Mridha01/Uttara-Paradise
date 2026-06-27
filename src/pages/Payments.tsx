import { useState, useRef } from 'react';
import { Plus, Upload, Image as ImageIcon, X, Search, Trash2, FileText, CreditCard, CheckCircle2, ShieldCheck, ExternalLink, Activity, Phone, Edit, Zap } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { MAX_BOOKING_AMOUNT, Payment, maskPhone } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/storage';
import PaymentReceipt from '@/components/PaymentReceipt';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function Payments() {
  const { shareholders, payments, addPayment, updatePayment, deletePayment, directors, loading } = useApp();
  const { isAdmin } = useAuth();

  // ── Receipt state ──────────────────────────────────────────────────────────
  const [receiptPayment, setReceiptPayment] = useState<Payment | null>(null);

  // ── Add payment state ──────────────────────────────────────────────────────
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedShareholder, setSelectedShareholder] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<'booking' | 'remaining'>('booking');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // ── Edit payment state ─────────────────────────────────────────────────────
  const [editPayment, setEditPayment] = useState<Payment | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editType, setEditType] = useState<'booking' | 'remaining'>('booking');
  const [editNotes, setEditNotes] = useState('');
  const [editScreenshotFile, setEditScreenshotFile] = useState<File | null>(null);
  const [editPreviewUrl, setEditPreviewUrl] = useState('');
  const [editSubmitting, setEditSubmitting] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  // ── Detail & delete state ──────────────────────────────────────────────────
  const [detailPayment, setDetailPayment] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleEditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditScreenshotFile(file);
    setEditPreviewUrl(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShareholder || !amount) {
      toast.error('Please select a shareholder and enter an amount');
      return;
    }
    const numAmount = Number(amount);
    const sh = shareholders.find(s => s.id === selectedShareholder);
    if (!sh) return;
    const bookingMax = MAX_BOOKING_AMOUNT * (sh.num_shares || 1);
    if (paymentType === 'booking' && numAmount > bookingMax) {
      toast.error(`Booking max ৳${bookingMax.toLocaleString()} (${sh.num_shares} share × ৳${MAX_BOOKING_AMOUNT.toLocaleString()})`);
      return;
    }
    if (sh.total_paid + numAmount > sh.total_share) {
      toast.error(`Total cannot exceed ৳${sh.total_share.toLocaleString()}`);
      return;
    }
    setSubmitting(true);
    try {
      let screenshotUrl = '';
      if (screenshotFile) {
        screenshotUrl = await uploadImage('payment-screenshots', screenshotFile, 'payments');
      }
      const newPayment = await addPayment({
        shareholder_id: selectedShareholder, amount: numAmount, date,
        type: paymentType, screenshot_url: screenshotUrl,
      });
      setSelectedShareholder(''); setAmount(''); setScreenshotFile(null); setPreviewUrl('');
      setDialogOpen(false);
      toast.success('Payment added! Generating Receipt...');
      if (newPayment) setReceiptPayment(newPayment);
    } catch { toast.error('Failed to add payment'); }
    setSubmitting(false);
  };

  const openEdit = (e: React.MouseEvent, p: Payment) => {
    e.stopPropagation();
    setEditPayment(p);
    setEditAmount(String(p.amount));
    setEditDate(p.date);
    setEditType(p.type);
    setEditNotes(p.notes || '');
    setEditPreviewUrl(p.screenshot_url || '');
    setEditScreenshotFile(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editPayment) return;
    const numAmount = Number(editAmount);
    if (!numAmount || numAmount <= 0) { toast.error('Enter a valid amount'); return; }

    // Guard: old amount - new amount diff must not push total_paid below 0 or above total_share
    const sh = shareholders.find(s => s.id === editPayment.shareholder_id);
    if (sh) {
      const diff = numAmount - editPayment.amount;
      const projected = sh.total_paid + diff;
      if (projected < 0) { toast.error('Amount too low — would make total paid negative'); return; }
      if (projected > sh.total_share) { toast.error(`Cannot exceed total share value ৳${sh.total_share.toLocaleString()}`); return; }
    }

    setEditSubmitting(true);
    try {
      let screenshotUrl = editPayment.screenshot_url;
      if (editScreenshotFile) {
        screenshotUrl = await uploadImage('payment-screenshots', editScreenshotFile, 'payments');
      }
      await updatePayment(editPayment.id, {
        amount: numAmount,
        date: editDate,
        type: editType,
        notes: editNotes,
        screenshot_url: screenshotUrl,
      });
      setEditPayment(null);
      toast.success('Payment updated successfully!');
    } catch { toast.error('Failed to update payment'); }
    setEditSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deletePayment(deleteId);
    setDeleteId(null);
    toast.success('Payment deleted successfully!');
  };

  // ── Derived data ───────────────────────────────────────────────────────────
  const sortedPayments = [...payments]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .filter(p => {
      if (!search) return true;
      const sh = shareholders.find(s => s.id === p.shareholder_id);
      const q = search.toLowerCase();
      return sh?.name.toLowerCase().includes(q) || sh?.phone.includes(q) || p.amount.toString().includes(q);
    });

  const detail = payments.find(p => p.id === detailPayment);
  const detailSh = detail ? shareholders.find(s => s.id === detail.shareholder_id) : null;
  const totalCollected = payments.reduce((s, p) => s + p.amount, 0);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-cyan-500 animate-spin-reverse"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-6 lg:p-8 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="w-full lg:w-auto text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
              <CreditCard className="w-3 h-3" /> Financial Ledger
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Payments
            </h1>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <Input
                className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:bg-white/20 transition-colors backdrop-blur-md rounded-xl h-11"
                placeholder="Search by name, phone or amount..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="hidden sm:flex w-full sm:w-auto h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white border-0 shadow-lg shadow-emerald-500/25 gap-2 transition-all hover:scale-105">
                    <Plus className="w-4 h-4" /> Add Payment
                  </Button>
                </DialogTrigger>
                <AddPaymentDialogContent
                  shareholders={shareholders}
                  amount={amount} setAmount={setAmount}
                  selectedShareholder={selectedShareholder} setSelectedShareholder={setSelectedShareholder}
                  paymentType={paymentType} setPaymentType={setPaymentType}
                  date={date} setDate={setDate}
                  screenshotFile={screenshotFile}
                  previewUrl={previewUrl}
                  fileRef={fileRef}
                  handleFileChange={handleFileChange}
                  setPreviewUrl={setPreviewUrl} setScreenshotFile={setScreenshotFile}
                  submitting={submitting}
                  handleSubmit={handleSubmit}
                />
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-lg p-6 group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5 opacity-50"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Transactions</p>
              <p className="text-4xl font-extrabold text-foreground tracking-tight">{payments.length}</p>
            </div>
            <div className="p-4 rounded-full bg-muted/50 border border-border/50 text-muted-foreground group-hover:text-primary transition-colors">
              <Activity className="w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md shadow-lg p-6 group hover:-translate-y-1 transition-transform duration-300">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-2">Total Collected</p>
              <p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">৳{totalCollected.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-hover:scale-110 transition-transform">
              <CreditCard className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment History List */}
      <Card className="shadow-lg border border-border bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col min-h-[500px]">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4 shrink-0">
          <CardTitle className="text-xl flex items-center gap-2">History Log</CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden flex flex-col h-full">
          {!isAdmin && sortedPayments.length > 0 && (
            <div className="shrink-0 flex items-start gap-3 p-4 m-4 mb-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-sm text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">গোপনীয়তার জন্য পেমেন্ট স্লিপ এবং রসিদ সর্বজনীন ভিউতে লুকানো আছে।</span>
            </div>
          )}
          {sortedPayments.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground">
              <CreditCard className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg">No payments recorded yet</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
              {sortedPayments.map((p, i) => {
                const sh = shareholders.find(s => s.id === p.shareholder_id);
                const isBooking = p.type === 'booking';
                return (
                  <div
                    key={p.id}
                    onClick={() => setDetailPayment(p.id)}
                    className="relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between p-4 rounded-2xl border border-border/50 bg-background/50 hover:bg-muted/50 cursor-pointer transition-all duration-300 hover:border-primary/30 hover:shadow-md animate-fade-in"
                    style={{ animationDelay: `${i * 30}ms` }}
                  >
                    <div className="flex items-center gap-4 mb-3 md:mb-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm bg-gradient-to-br ${isBooking ? 'from-cyan-400 to-blue-600' : 'from-indigo-400 to-purple-600'} flex-shrink-0`}>
                        {sh?.name.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{sh?.name || 'Unknown'}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {/* Masked phone — only show to admin in detail dialog */}
                          {maskPhone(sh?.phone || '')}
                          <span className="ml-2">{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0 pl-16 md:pl-0">
                      <div className="flex items-center gap-3">
                        <p className="text-xl font-extrabold text-foreground tracking-tight">৳{p.amount.toLocaleString()}</p>
                        <Badge variant="outline" className={`hidden sm:inline-flex font-semibold ${isBooking ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20'}`}>
                          {isBooking ? 'Booking' : 'Remaining'}
                        </Badge>
                        {p.receipt_no && <span className="hidden md:inline text-[10px] text-muted-foreground font-mono">{p.receipt_no}</span>}
                      </div>

                      {isAdmin && (
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg p-1 border border-border shadow-sm ml-2">
                          {p.screenshot_url && (
                            <div className="p-1.5 rounded-md text-primary" title="Has Slip">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                          )}
                          {/* ── Edit button ── */}
                          <button
                            onClick={(e) => openEdit(e, p)}
                            className="p-1.5 rounded-md hover:bg-amber-500/10 text-muted-foreground hover:text-amber-500 transition-colors"
                            title="Edit Payment"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setReceiptPayment(p); }}
                            className="p-1.5 rounded-md hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 transition-colors"
                            title="Generate PDF Receipt"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteId(p.id); }}
                            className="p-1.5 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Detail Dialog ─────────────────────────────────────────────────────── */}
      <Dialog open={!!detailPayment} onOpenChange={(open) => !open && setDetailPayment(null)}>
        <DialogContent className="sm:max-w-md border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl">Transaction Details</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-5 mt-2">
              <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-sm bg-gradient-to-br ${detail.type === 'booking' ? 'from-cyan-400 to-blue-600' : 'from-indigo-400 to-purple-600'} flex-shrink-0`}>
                  {detailSh?.name.charAt(0) || '?'}
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">{detailSh?.name || 'Unknown'}</p>
                  <p className="text-xs font-medium text-muted-foreground flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3" />
                    {/* Admin sees full phone in detail, public sees masked */}
                    {isAdmin ? detailSh?.phone : maskPhone(detailSh?.phone || '')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div><p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Amount</p><p className="font-extrabold text-2xl text-emerald-500 tracking-tight">৳{detail.amount.toLocaleString()}</p></div>
                <div><p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Type</p><Badge variant="outline" className="bg-background font-semibold">{detail.type === 'booking' ? 'Booking Fund' : 'Installment'}</Badge></div>
                <div><p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Payment Date</p><p className="font-semibold text-foreground">{new Date(detail.date).toLocaleDateString('en-GB')}</p></div>
                <div><p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Receipt No</p><p className="font-semibold text-foreground font-mono text-sm">{detail.receipt_no || '—'}</p></div>
              </div>

              {isAdmin && detail.screenshot_url && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">Payment Slip</p>
                    <a href={detail.screenshot_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Open original</a>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/30 p-1">
                    <img src={detail.screenshot_url} alt="Payment slip" className="w-full rounded-lg max-h-96 object-contain" />
                  </div>
                </div>
              )}
              {!isAdmin && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">গোপনীয়তার জন্য পেমেন্ট স্লিপ সর্বজনীন ভিউতে দেখানো হয় না।</span>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Payment Dialog ───────────────────────────────────────────────── */}
      <Dialog open={!!editPayment} onOpenChange={(open) => !open && setEditPayment(null)}>
        <DialogContent className="sm:max-w-[480px] max-h-[90vh] overflow-y-auto border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center gap-2">
              <Edit className="w-5 h-5 text-amber-500" /> Edit Payment
            </DialogTitle>
          </DialogHeader>
          {editPayment && (() => {
            const sh = shareholders.find(s => s.id === editPayment.shareholder_id);
            return (
              <form onSubmit={handleEditSubmit} className="space-y-4 mt-2">
                {/* Shareholder info (read-only) */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-border/50">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {sh?.name.charAt(0) || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{sh?.name || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">Receipt: {editPayment.receipt_no || '—'}</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground/80">Amount (৳) *</Label>
                  <Input
                    className="bg-muted/50 text-lg font-bold"
                    type="number"
                    value={editAmount}
                    onChange={e => setEditAmount(e.target.value)}
                    min={1}
                    required
                    placeholder="0.00"
                  />
                  {sh && (
                    <div className="flex items-center justify-between mt-1 bg-muted/40 px-3 py-1.5 rounded-lg text-xs text-muted-foreground">
                      <span>Current total paid: <strong>৳{sh.total_paid.toLocaleString()}</strong></span>
                      <span>Share total: <strong>৳{sh.total_share.toLocaleString()}</strong></span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-foreground/80">Payment Type</Label>
                    <Select value={editType} onValueChange={v => setEditType(v as any)}>
                      <SelectTrigger className="bg-muted/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="booking">Booking Fund</SelectItem>
                        <SelectItem value="remaining">Remaining Installment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-foreground/80">Date</Label>
                    <Input className="bg-muted/50" type="date" value={editDate} onChange={e => setEditDate(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground/80">Notes</Label>
                  <Input className="bg-muted/50" value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="Optional notes..." />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-foreground/80">Replace Payment Slip (optional)</Label>
                  <input ref={editFileRef} type="file" accept="image/*" onChange={handleEditFileChange} className="hidden" />
                  {editPreviewUrl ? (
                    <div className="relative mt-2 rounded-xl overflow-hidden border border-border/50 bg-muted/30 p-1 group">
                      <img src={editPreviewUrl} alt="Slip" className="w-full max-h-40 object-contain rounded-lg" />
                      <button
                        type="button"
                        onClick={() => { setEditPreviewUrl(''); setEditScreenshotFile(null); }}
                        className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => editFileRef.current?.click()}
                      className="w-full border-2 border-dashed border-amber-500/30 bg-amber-500/5 rounded-xl p-5 flex flex-col items-center gap-2 text-muted-foreground hover:border-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      <Upload className="w-5 h-5 text-amber-500" />
                      <span className="text-xs font-medium">Upload new slip (leave empty to keep existing)</span>
                    </button>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg mt-4"
                  disabled={editSubmitting}
                >
                  {editSubmitting ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            );
          })()}
        </DialogContent>
      </Dialog>

      {/* ── Delete Alert ──────────────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-rose-500/20 bg-background/95 backdrop-blur-xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Delete Transaction?</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70 text-base">
              This action cannot be undone. This will permanently delete this payment and recalculate the shareholder's remaining balance.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-muted/50 hover:bg-muted border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25 rounded-lg">Yes, Delete Permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ── PDF Receipt Generator ─────────────────────────────────────────────── */}
      <PaymentReceipt
        payment={receiptPayment}
        shareholder={receiptPayment ? shareholders.find(s => s.id === receiptPayment.shareholder_id) || null : null}
        directors={directors}
        open={!!receiptPayment}
        onOpenChange={(o) => !o && setReceiptPayment(null)}
      />

      {/* ── Mobile Quick-Pay FAB ──────────────────────────────────────────────── */}
      {isAdmin && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <button
              className="sm:hidden fixed bottom-6 right-5 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-transform"
              aria-label="Quick Add Payment"
            >
              <Zap className="w-5 h-5" />
              <span className="text-sm">Quick Pay</span>
            </button>
          </DialogTrigger>
          <AddPaymentDialogContent
            shareholders={shareholders}
            amount={amount} setAmount={setAmount}
            selectedShareholder={selectedShareholder} setSelectedShareholder={setSelectedShareholder}
            paymentType={paymentType} setPaymentType={setPaymentType}
            date={date} setDate={setDate}
            screenshotFile={screenshotFile}
            previewUrl={previewUrl}
            fileRef={fileRef}
            handleFileChange={handleFileChange}
            setPreviewUrl={setPreviewUrl} setScreenshotFile={setScreenshotFile}
            submitting={submitting}
            handleSubmit={handleSubmit}
          />
        </Dialog>
      )}
    </div>
  );
}

// ── Shared Add Payment form (used by desktop dialog + mobile FAB) ─────────────
interface AddPaymentProps {
  shareholders: ReturnType<typeof useApp>['shareholders'];
  amount: string; setAmount: (v: string) => void;
  selectedShareholder: string; setSelectedShareholder: (v: string) => void;
  paymentType: 'booking' | 'remaining'; setPaymentType: (v: 'booking' | 'remaining') => void;
  date: string; setDate: (v: string) => void;
  screenshotFile: File | null;
  previewUrl: string;
  fileRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  setPreviewUrl: (v: string) => void;
  setScreenshotFile: (v: File | null) => void;
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => void;
}

function AddPaymentDialogContent({
  shareholders, amount, setAmount, selectedShareholder, setSelectedShareholder,
  paymentType, setPaymentType, date, setDate, screenshotFile, previewUrl,
  fileRef, handleFileChange, setPreviewUrl, setScreenshotFile, submitting, handleSubmit,
}: AddPaymentProps) {
  return (
    <DialogContent className="w-[calc(100vw-16px)] sm:max-w-[500px] max-h-[92vh] overflow-y-auto custom-scrollbar border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl p-4 sm:p-6">
      <DialogHeader>
        <DialogTitle className="text-xl flex items-center gap-2">
          <Zap className="w-5 h-5 text-emerald-500" /> Record Payment
        </DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4 mt-2">
        <div className="space-y-1.5">
          <Label className="text-foreground/80">Select Shareholder *</Label>
          <Select value={selectedShareholder} onValueChange={setSelectedShareholder}>
            <SelectTrigger className="bg-muted/50 h-12"><SelectValue placeholder="Choose shareholder" /></SelectTrigger>
            <SelectContent className="max-h-60">
              {shareholders.filter(s => s.status !== 'fully_paid').map(s => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} <span className="text-muted-foreground text-xs ml-1">(Due: ৳{(s.total_share - s.total_paid).toLocaleString()})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-foreground/80">Amount (৳) *</Label>
          <Input
            className="bg-muted/50 text-xl font-bold h-12"
            type="number" inputMode="numeric"
            value={amount} onChange={e => setAmount(e.target.value)}
            min={1} required placeholder="0"
          />
          {selectedShareholder && paymentType === 'booking' && (() => {
            const sh = shareholders.find(s => s.id === selectedShareholder);
            if (!sh) return null;
            const max = MAX_BOOKING_AMOUNT * (sh.num_shares || 1);
            return (
              <div className="flex items-center justify-between mt-1.5 bg-primary/5 p-2 rounded-lg border border-primary/10">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Max: <span className="font-bold text-primary">৳{max.toLocaleString()}</span>
                </p>
                <button type="button" onClick={() => setAmount(String(max))} className="text-xs font-bold text-primary hover:underline bg-primary/10 px-2 py-0.5 rounded-md">Use max</button>
              </div>
            );
          })()}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-foreground/80">Type *</Label>
            <Select value={paymentType} onValueChange={v => setPaymentType(v as any)}>
              <SelectTrigger className="bg-muted/50 h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="booking">Booking Fund</SelectItem>
                <SelectItem value="remaining">Remaining</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-foreground/80">Date</Label>
            <Input className="bg-muted/50 h-10" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
        </div>

        {/* Screenshot — optional for quick mobile use */}
        <div className="space-y-1.5">
          <Label className="text-foreground/80 flex items-center gap-1">
            Payment Slip <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">(Optional)</span>
          </Label>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
          {previewUrl ? (
            <div className="relative mt-2 rounded-xl overflow-hidden border border-border/50 bg-muted/30 p-1 group">
              <img src={previewUrl} alt="Receipt" className="w-full max-h-40 object-contain rounded-lg" />
              <button type="button" onClick={() => { setPreviewUrl(''); setScreenshotFile(null); }} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-rose-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileRef.current?.click()} className="w-full border-2 border-dashed border-primary/30 bg-primary/5 rounded-xl p-5 flex flex-col items-center gap-2 text-muted-foreground hover:border-primary hover:bg-primary/10 transition-colors">
              <div className="p-2 rounded-full bg-primary/10 text-primary"><Upload className="w-5 h-5" /></div>
              <span className="text-xs font-medium">Tap to upload slip / take photo</span>
              <span className="text-[10px] text-muted-foreground">Can skip — add later if needed</span>
            </button>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-12 text-base bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25 mt-2"
          disabled={submitting}
        >
          {submitting ? 'Recording...' : '✅ Record & Get Receipt'}
        </Button>
      </form>
    </DialogContent>
  );
}
