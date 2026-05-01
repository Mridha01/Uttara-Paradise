import { useState } from 'react';
import { Plus, Edit, Save, X, Trash2, Home, Store } from 'lucide-react';
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
      toast.success('Rental settings updated!');
      setEditConfig(false);
    } catch { toast.error('Failed to save'); }
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
      setAddOpen(false);
      toast.success('Rental income recorded!');
    } catch (err: any) {
      if (err?.message?.includes('unique')) toast.error('This month is already recorded');
      else toast.error('Failed to add');
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteRentalCollection(deleteId);
    setDeleteId(null);
    toast.success('Deleted!');
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-foreground">🏠 Rental Income Module</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Button onClick={openConfig} variant="outline" size="sm" className="gap-2"><Edit className="w-3.5 h-3.5" /> Settings</Button>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Monthly Rent</Button>
              </DialogTrigger>
              <DialogContent className="max-h-[90vh] overflow-y-auto">
                <DialogHeader><DialogTitle>Record Monthly Rental Income</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div><Label>Amount Collected (৳)</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label>Rooms Rented</Label><Input type="number" value={form.rooms} onChange={e => setForm(p => ({ ...p, rooms: e.target.value }))} /></div>
                    <div><Label>Shops Rented</Label><Input type="number" value={form.shops} onChange={e => setForm(p => ({ ...p, shops: e.target.value }))} /></div>
                  </div>
                  <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                  <div><Label>Notes (optional)</Label><Input value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
                  <div><Label>Screenshot (optional)</Label><Input type="file" accept="image/*" onChange={e => setScreenshotFile(e.target.files?.[0] || null)} /></div>
                  <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>{submitting ? 'Saving...' : 'Save'}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      {/* Config edit panel */}
      {isAdmin && editConfig && (
        <Card className="shadow-card border-primary">
          <CardHeader className="pb-2 flex-row items-center justify-between">
            <CardTitle className="text-base">⚙️ Rental Configuration</CardTitle>
            <button onClick={() => setEditConfig(false)} className="p-1 rounded hover:bg-muted"><X className="w-4 h-4" /></button>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><Label>রুমের সংখ্যা</Label><Input type="number" value={configForm.rooms} onChange={e => setConfigForm(p => ({ ...p, rooms: e.target.value }))} /></div>
              <div><Label>প্রতি রুমের ভাড়া (৳)</Label><Input type="number" value={configForm.rent_per_room} onChange={e => setConfigForm(p => ({ ...p, rent_per_room: e.target.value }))} /></div>
              <div><Label>দোকানের সংখ্যা</Label><Input type="number" value={configForm.shops} onChange={e => setConfigForm(p => ({ ...p, shops: e.target.value }))} /></div>
              <div><Label>প্রতি দোকানের ভাড়া (৳)</Label><Input type="number" value={configForm.rent_per_shop} onChange={e => setConfigForm(p => ({ ...p, rent_per_shop: e.target.value }))} /></div>
              <div><Label>লক্ষ্য মাস (২৪ = ২ বছর)</Label><Input type="number" value={configForm.target_months} onChange={e => setConfigForm(p => ({ ...p, target_months: e.target.value }))} /></div>
              <div><Label>নোট</Label><Input value={configForm.notes} onChange={e => setConfigForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveConfig} disabled={savingConfig} className="gradient-primary text-primary-foreground gap-2"><Save className="w-4 h-4" /> {savingConfig ? 'Saving...' : 'Save'}</Button>
              <Button onClick={() => setEditConfig(false)} variant="outline">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary */}
      <Card className="shadow-card border-primary/40">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📊 Summary — {targetMonths} মাসের লক্ষ্য</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground">প্রত্যাশিত মাসিক</p>
              <p className="text-lg font-bold text-primary">{formatBdtBangla(expectedMonthly)}</p>
              <p className="text-xs text-muted-foreground">{rooms} রুম + {shops} দোকান</p>
            </div>
            <div className="p-3 rounded-lg bg-success/10">
              <p className="text-xs text-muted-foreground">সংগৃহীত</p>
              <p className="text-lg font-bold text-success">{formatBdtBangla(totalCollected)}</p>
              <p className="text-xs text-muted-foreground">{monthsCovered} মাস</p>
            </div>
            <div className="p-3 rounded-lg bg-warning/10">
              <p className="text-xs text-muted-foreground">{targetMonths} মাসের লক্ষ্য</p>
              <p className="text-lg font-bold text-warning">{formatBdtBangla(targetTotal)}</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <p className="text-xs text-muted-foreground">এখনো বাকি</p>
              <p className="text-lg font-bold text-destructive">{formatBdtBangla(Math.max(0, targetTotal - totalCollected))}</p>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">প্রগ্রেস</span>
              <span className="text-muted-foreground">{Math.round((totalCollected / (targetTotal || 1)) * 100)}%</span>
            </div>
            <Progress value={(totalCollected / (targetTotal || 1)) * 100} className="h-2" />
          </div>
          {rentalConfig?.notes && <p className="text-xs text-muted-foreground italic">📝 {rentalConfig.notes}</p>}
        </CardContent>
      </Card>

      {/* Projection Chart */}
      <RentalProjectionChart collections={rentalCollections} expectedMonthly={expectedMonthly} targetMonths={targetMonths} />

      {/* Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
          <Home className="w-8 h-8 text-primary" />
          <div><p className="text-xs text-muted-foreground">রুম থেকে মাসিক আয়</p><p className="text-lg font-bold text-card-foreground">{formatBdtBangla(rooms * rentPerRoom)}</p><p className="text-xs text-muted-foreground">{rooms} × ৳{rentPerRoom.toLocaleString()}</p></div>
        </CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 flex items-center gap-3">
          <Store className="w-8 h-8 text-warning" />
          <div><p className="text-xs text-muted-foreground">দোকান থেকে মাসিক আয়</p><p className="text-lg font-bold text-card-foreground">{formatBdtBangla(shops * rentPerShop)}</p><p className="text-xs text-muted-foreground">{shops} × ৳{rentPerShop.toLocaleString()}</p></div>
        </CardContent></Card>
      </div>

      {/* Collection history */}
      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">মাসিক সংগ্রহ ({rentalCollections.length})</CardTitle></CardHeader>
        <CardContent>
          {rentalCollections.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">এখনো কোনো মাসিক ভাড়ার রেকর্ড নেই</p>
          ) : (
            <div className="space-y-2">
              {rentalCollections.map(r => (
                <div key={r.id} className="flex items-center justify-between gap-2 p-2.5 sm:p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground font-bold text-[10px] sm:text-xs flex-shrink-0">{MONTHS[r.month - 1].slice(0, 3)}</div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-card-foreground truncate">{MONTHS[r.month - 1]} {r.year}</p>
                      <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{r.rooms} রুম + {r.shops} দোকান • {r.date}</p>
                      {r.notes && <p className="text-[10px] sm:text-xs text-muted-foreground italic truncate">📝 {r.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <Badge className="bg-success text-success-foreground text-[10px] sm:text-xs px-1.5 sm:px-2">৳{Number(r.amount).toLocaleString()}</Badge>
                    {r.screenshot_url && (
                      <a href={r.screenshot_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline hidden sm:inline">View</a>
                    )}
                    {isAdmin && (
                      <button onClick={() => setDeleteId(r.id)} className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete Rental Record?</AlertDialogTitle><AlertDialogDescription>This will remove this monthly rental record.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
