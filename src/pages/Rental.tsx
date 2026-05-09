import { useState, useRef } from 'react';
import { Plus, Edit, Save, X, Trash2, Home, Store, TrendingUp, Building2, Wallet, Target, Activity, ShieldCheck, Upload, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { formatBdtBangla } from '@/types';
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
import RentalProjectionChart from '@/components/RentalProjectionChart';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Rental() {
  const { rentalConfig, rentalCollections, updateRentalConfig, addRentalCollection, deleteRentalCollection, loading } = useApp();
  const { isAdmin } = useAuth();
  const [editConfig, setEditConfig] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const fileRef = useRef<HTMLInputElement>(null);

  const rooms = rentalConfig?.rooms ?? 20;
  const rentPerRoom = Number(rentalConfig?.rent_per_room ?? 2500);
  const shops = rentalConfig?.shops ?? 0;
  const rentPerShop = Number(rentalConfig?.rent_per_shop ?? 0);
  const targetMonths = rentalConfig?.target_months ?? 24;
  const expectedMonthly = rooms * rentPerRoom + shops * rentPerShop;
  const targetTotal = expectedMonthly * targetMonths;
  const totalCollected = rentalCollections.reduce((s, r) => s + Number(r.amount), 0);
  const monthsCovered = rentalCollections.length;

  const [configForm, setConfigForm] = useState({
    rooms: String(rooms),
    rent_per_room: String(rentPerRoom),
    shops: String(shops),
    rent_per_shop: String(rentPerShop),
    target_months: String(targetMonths),
    notes: rentalConfig?.notes || '',
  });

  const [form, setForm] = useState({
    month: String(new Date().getMonth() + 1),
    year: String(new Date().getFullYear()),
    amount: String(expectedMonthly),
    rooms: String(rooms),
    shops: String(shops),
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setScreenshotFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const openConfig = () => {
    setConfigForm({
      rooms: String(rooms),
      rent_per_room: String(rentPerRoom),
      shops: String(shops),
      rent_per_shop: String(rentPerShop),
      target_months: String(targetMonths),
      notes: rentalConfig?.notes || '',
    });
    setEditConfig(true);
  };

  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      await updateRentalConfig({
        rooms: Number(configForm.rooms),
        rent_per_room: Number(configForm.rent_per_room),
        shops: Number(configForm.shops),
        rent_per_shop: Number(configForm.rent_per_shop),
        target_months: Number(configForm.target_months),
        notes: configForm.notes,
      });
      toast.success('Rental settings updated successfully!');
      setEditConfig(false);
    } catch { toast.error('Failed to save settings'); }
    setSavingConfig(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let screenshotUrl = '';
      if (screenshotFile) {
        screenshotUrl = await uploadImage('payment-screenshots', screenshotFile, 'rental');
      }
      await addRentalCollection({
        month: Number(form.month),
        year: Number(form.year),
        amount: Number(form.amount),
        rooms: Number(form.rooms),
        shops: Number(form.shops),
        date: form.date,
        notes: form.notes,
        screenshot_url: screenshotUrl,
      });
      setScreenshotFile(null);
      setPreviewUrl('');
      setAddOpen(false);
      toast.success('Rental income recorded successfully!');
    } catch (err: any) {
      if (err?.message?.includes('unique')) toast.error('This month is already recorded');
      else toast.error('Failed to add rental record');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteRentalCollection(deleteId);
    setDeleteId(null);
    toast.success('Rental record deleted!');
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-fuchsia-500 animate-spin-reverse"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-6 lg:p-8 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="w-full lg:w-auto text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-fuchsia-400 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Building2 className="w-3 h-3" /> Property Management
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Rental Income
            </h1>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            {isAdmin && (
              <div className="flex w-full sm:w-auto gap-3">
                <Button onClick={openConfig} className="flex-1 sm:flex-none h-12 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md gap-2 transition-all">
                  <Edit className="w-4 h-4" /> Settings
                </Button>

                <Dialog open={addOpen} onOpenChange={setAddOpen}>
                  <DialogTrigger asChild>
                    <Button className="flex-1 sm:flex-none h-12 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white border-0 shadow-lg shadow-fuchsia-500/25 gap-2 transition-all hover:scale-105 px-6">
                      <Plus className="w-4 h-4" /> Add Income
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto custom-scrollbar border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl">
                    <DialogHeader><DialogTitle className="text-xl">Record Monthly Rental Income</DialogTitle></DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4 mt-2">
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
                      <div className="space-y-1.5">
                        <Label className="text-foreground/80">Amount Collected (৳) *</Label>
                        <Input className="bg-muted/50 text-lg font-bold" type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5"><Label className="text-foreground/80">Rooms Rented</Label><Input className="bg-muted/50" type="number" value={form.rooms} onChange={e => setForm(p => ({ ...p, rooms: e.target.value }))} /></div>
                        <div className="space-y-1.5"><Label className="text-foreground/80">Shops Rented</Label><Input className="bg-muted/50" type="number" value={form.shops} onChange={e => setForm(p => ({ ...p, shops: e.target.value }))} /></div>
                      </div>
                      <div className="space-y-1.5"><Label className="text-foreground/80">Collection Date</Label><Input className="bg-muted/50" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                      <div className="space-y-1.5"><Label className="text-foreground/80">Notes (optional)</Label><Input className="bg-muted/50" placeholder="e.g. advance payment included" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>

                      <div className="space-y-1.5">
                        <Label className="text-foreground/80 flex items-center gap-1">Receipt / Slip (Optional)</Label>
                        <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                        {previewUrl ? (
                          <div className="relative mt-2 rounded-xl overflow-hidden border border-border/50 bg-muted/30 p-1 group">
                            <img src={previewUrl} alt="Receipt" className="w-full max-h-48 object-contain rounded-lg" />
                            <button type="button" onClick={() => { setPreviewUrl(''); setScreenshotFile(null); }} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-rose-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button type="button" onClick={() => fileRef.current?.click()} className="mt-2 w-full border-2 border-dashed border-fuchsia-500/30 bg-fuchsia-500/5 rounded-xl p-8 flex flex-col items-center gap-3 text-muted-foreground hover:border-fuchsia-500 hover:bg-fuchsia-500/10 transition-colors">
                            <div className="p-3 rounded-full bg-fuchsia-500/10 text-fuchsia-500"><Upload className="w-6 h-6" /></div>
                            <span className="text-sm font-medium">Click to upload slip</span>
                          </button>
                        )}
                      </div>

                      <Button type="submit" className="w-full h-11 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-400 hover:to-purple-500 text-white shadow-lg shadow-fuchsia-500/25 mt-4" disabled={submitting}>
                        {submitting ? 'Recording...' : 'Record Income'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Admin Config Edit Panel */}
      {isAdmin && editConfig && (
        <Card className="shadow-2xl border-fuchsia-500/30 bg-card/60 backdrop-blur-xl rounded-2xl animate-in fade-in slide-in-from-top-4">
          <CardHeader className="pb-4 border-b border-border/50 flex flex-row items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2 text-fuchsia-500"><Activity className="w-5 h-5" /> Property Configuration</CardTitle>
            <button onClick={() => setEditConfig(false)} className="p-1.5 rounded-lg hover:bg-muted/80 transition-colors"><X className="w-4 h-4" /></button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-1.5"><Label className="text-foreground/80">Total Rooms</Label><Input type="number" className="bg-background/50" value={configForm.rooms} onChange={e => setConfigForm(p => ({ ...p, rooms: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-foreground/80">Rent Per Room (৳)</Label><Input type="number" className="bg-background/50 font-bold" value={configForm.rent_per_room} onChange={e => setConfigForm(p => ({ ...p, rent_per_room: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-foreground/80">Total Shops</Label><Input type="number" className="bg-background/50" value={configForm.shops} onChange={e => setConfigForm(p => ({ ...p, shops: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-foreground/80">Rent Per Shop (৳)</Label><Input type="number" className="bg-background/50 font-bold" value={configForm.rent_per_shop} onChange={e => setConfigForm(p => ({ ...p, rent_per_shop: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-foreground/80">Target Goal (Months)</Label><Input type="number" className="bg-background/50" value={configForm.target_months} onChange={e => setConfigForm(p => ({ ...p, target_months: e.target.value }))} /></div>
              <div className="space-y-1.5"><Label className="text-foreground/80">Internal Notes</Label><Input className="bg-background/50" value={configForm.notes} onChange={e => setConfigForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSaveConfig} disabled={savingConfig} className="bg-fuchsia-500 hover:bg-fuchsia-600 text-white gap-2 shadow-md">
                <Save className="w-4 h-4" /> {savingConfig ? 'Saving...' : 'Save Configuration'}
              </Button>
              <Button onClick={() => setEditConfig(false)} variant="outline" className="bg-background/50">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-lg p-6 group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-50"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Room Revenue</p>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">{formatBdtBangla(rooms * rentPerRoom)} <span className="text-sm font-medium text-muted-foreground ml-1">/mo</span></p>
              <p className="text-xs font-medium text-muted-foreground mt-1 bg-muted/50 inline-block px-2 py-0.5 rounded-md">{rooms} Rooms × ৳{rentPerRoom.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 group-hover:scale-110 transition-transform shadow-inner">
              <Home className="w-8 h-8" />
            </div>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-lg p-6 group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-50"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Shop Revenue</p>
              <p className="text-3xl font-extrabold text-foreground tracking-tight">{formatBdtBangla(shops * rentPerShop)} <span className="text-sm font-medium text-muted-foreground ml-1">/mo</span></p>
              <p className="text-xs font-medium text-muted-foreground mt-1 bg-muted/50 inline-block px-2 py-0.5 rounded-md">{shops} Shops × ৳{rentPerShop.toLocaleString()}</p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform shadow-inner">
              <Store className="w-8 h-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Target Dashboard */}
      <Card className="shadow-2xl border-fuchsia-500/30 bg-card/60 backdrop-blur-xl overflow-hidden rounded-3xl">
        <div className="h-1.5 bg-gradient-to-r from-fuchsia-400 via-purple-500 to-indigo-500 w-full"></div>
        <CardHeader className="pb-2 pt-6">
          <CardTitle className="text-xl flex items-center gap-2 justify-center sm:justify-start">
            <Target className="w-6 h-6 text-fuchsia-500" />
            <span>Target Tracker — {targetMonths} Months</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 text-center transform transition-transform hover:scale-105">
              <p className="text-[10px] sm:text-xs font-semibold text-primary/80 uppercase tracking-widest mb-1">Expected Monthly</p>
              <p className="text-xl sm:text-2xl font-extrabold text-primary truncate px-1">{formatBdtBangla(expectedMonthly)}</p>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-center transform transition-transform hover:scale-105">
              <p className="text-[10px] sm:text-xs font-semibold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest mb-1">Collected</p>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-500 truncate px-1">{formatBdtBangla(totalCollected)}</p>
              <p className="text-xs font-medium text-emerald-500/70 truncate mt-1">{monthsCovered} Months Logged</p>
            </div>

            <div className="bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-2xl p-4 text-center transform transition-transform hover:scale-105">
              <p className="text-[10px] sm:text-xs font-semibold text-fuchsia-600/80 dark:text-fuchsia-400/80 uppercase tracking-widest mb-1">{targetMonths} Month Goal</p>
              <p className="text-xl sm:text-2xl font-extrabold text-fuchsia-500 truncate px-1">{formatBdtBangla(targetTotal)}</p>
            </div>

            <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 text-center transform transition-transform hover:scale-105">
              <p className="text-[10px] sm:text-xs font-semibold text-rose-600/80 dark:text-rose-400/80 uppercase tracking-widest mb-1">Remaining</p>
              <p className="text-xl sm:text-2xl font-extrabold text-rose-500 truncate px-1">{formatBdtBangla(Math.max(0, targetTotal - totalCollected))}</p>
            </div>
          </div>

          <div className="bg-background/50 rounded-2xl p-5 border border-border/50">
            <div className="flex justify-between items-end mb-3">
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Goal Progress</p>
              </div>
              <span className="text-2xl font-extrabold text-fuchsia-500">{Math.round((totalCollected / (targetTotal || 1)) * 100)}%</span>
            </div>
            <div className="h-4 w-full bg-muted rounded-full overflow-hidden border border-border/50 shadow-inner">
              <div className="h-full bg-gradient-to-r from-fuchsia-400 to-purple-500 transition-all duration-1000 ease-out relative" style={{ width: `${Math.min(100, (totalCollected / (targetTotal || 1)) * 100)}%` }}>
                <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
              </div>
            </div>
          </div>
          {rentalConfig?.notes && (
            <div className="bg-muted/40 p-3 rounded-xl border border-border/50 text-sm text-muted-foreground flex items-start gap-2">
              <span className="text-lg">📝</span> <span className="mt-0.5">{rentalConfig.notes}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projection Chart Component */}
      <div className="rounded-3xl overflow-hidden border border-border bg-card/40 backdrop-blur-md shadow-lg">
        <RentalProjectionChart collections={rentalCollections} expectedMonthly={expectedMonthly} targetMonths={targetMonths} />
      </div>

      {/* Monthly Collection Ledger */}
      <Card className="shadow-lg border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col min-h-[400px]">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4 shrink-0">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-500" /> Income Ledger</div>
            <Badge variant="outline" className="bg-background">{rentalCollections.length} Records</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden flex flex-col h-full">
          {!isAdmin && rentalCollections.some(r => r.screenshot_url) && (
            <div className="shrink-0 flex items-start gap-3 p-4 m-4 mb-2 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20 text-sm text-fuchsia-600 dark:text-fuchsia-400">
              <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed font-medium">গোপনীয়তার জন্য ভাড়ার রশিদ বা স্লিপ সর্বজনীন ভিউতে লুকানো আছে। শুধু এডমিনরা এটি দেখতে পারবেন।</span>
            </div>
          )}
          {rentalCollections.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Wallet className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg">No rental income recorded yet</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar max-h-[600px]">
              {rentalCollections.map((r, i) => (
                <div
                  key={r.id}
                  className="relative overflow-hidden group flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 rounded-2xl border border-border/50 bg-background/50 hover:bg-muted/50 transition-all duration-300 hover:border-fuchsia-500/30 hover:shadow-md animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  {/* Left side: Date & Info */}
                  <div className="flex items-center gap-4 mb-3 md:mb-0">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-sm shadow-sm bg-gradient-to-br from-fuchsia-400 to-purple-600 flex-shrink-0 uppercase tracking-wider">
                      {MONTHS[r.month - 1].slice(0, 3)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-foreground group-hover:text-fuchsia-500 transition-colors">{MONTHS[r.month - 1]} {r.year}</p>
                      <p className="text-xs font-medium text-muted-foreground mt-0.5">{r.rooms} Rooms • {r.shops} Shops • {new Date(r.date).toLocaleDateString('en-GB')}</p>
                      {r.notes && <p className="text-xs text-muted-foreground mt-1.5 italic bg-muted/50 inline-block px-2 py-0.5 rounded-md border border-border/50">📝 {r.notes}</p>}
                    </div>
                  </div>

                  {/* Right side: Amount, Badge, Actions */}
                  <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto mt-2 md:mt-0 pl-16 md:pl-0">
                    <div className="flex items-center gap-3">
                      <p className="text-xl font-extrabold text-emerald-500 tracking-tight">৳{Number(r.amount).toLocaleString()}</p>
                    </div>

                    {/* Admin Tools */}
                    {isAdmin && (
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm rounded-lg p-1 border border-border shadow-sm ml-2">
                        {r.screenshot_url && (
                          <button
                            onClick={() => window.open(r.screenshot_url, '_blank')}
                            className="p-1.5 rounded-md hover:bg-fuchsia-500/10 text-muted-foreground hover:text-fuchsia-500 transition-colors flex items-center gap-1 text-xs font-bold"
                            title="View Receipt"
                          >
                            <ImageIcon className="w-4 h-4" /> View
                          </button>
                        )}
                        <button
                          onClick={() => setDeleteId(r.id)}
                          className="p-1.5 rounded-md hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Delete Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border-rose-500/20 bg-background/95 backdrop-blur-xl rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-rose-500 flex items-center gap-2"><Trash2 className="w-5 h-5" /> Delete Record?</AlertDialogTitle>
            <AlertDialogDescription className="text-foreground/70 text-base">
              This action cannot be undone. This will permanently delete this monthly rental record from the ledger.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="bg-muted/50 hover:bg-muted border-0">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/25 rounded-lg">Yes, Delete Permanently</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
