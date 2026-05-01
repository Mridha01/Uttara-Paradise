import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Trash2, Lock, Download } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function AdminExpenses() {
  const { privateExpenses, addPrivateExpense, deletePrivateExpense, loading } = useApp();
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0], category: '', notes: '' });

  if (!isAdmin) return <Navigate to="/login" replace />;

  const total = privateExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const sorted = [...privateExpenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    setSubmitting(true);
    try {
      await addPrivateExpense({ title: form.title, amount: Number(form.amount), date: form.date, category: form.category, notes: form.notes });
      setForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0], category: '', notes: '' });
      setDialogOpen(false);
      toast.success('Private expense added!');
    } catch { toast.error('Failed to add'); }
    setSubmitting(false);
  };

  const downloadCSV = () => {
    const rows: string[] = ['Date,Title,Category,Amount (BDT),Notes'];
    sorted.forEach(e => rows.push(`"${e.date}","${(e.title || '').replace(/"/g, '""')}","${(e.category || '').replace(/"/g, '""')}",${e.amount},"${(e.notes || '').replace(/"/g, '""')}"`));
    rows.push('');
    rows.push(`SUMMARY,,,${total},`);
    const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `private-expenses-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Lock className="w-5 h-5 text-warning" /> Private Expenses
          </h1>
          <p className="text-sm text-muted-foreground">শুধু ডিরেক্টর/অ্যাডমিনদের জন্য — অন্য শেয়ারহোল্ডার দেখতে পাবেন না</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={downloadCSV} variant="outline" size="sm" className="gap-2"><Download className="w-3.5 h-3.5" /> CSV</Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Private Expense</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Private Expense</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
                <div><Label>Amount (৳) *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} min={1} required /></div>
                <div><Label>Category</Label><Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} placeholder="চা, যাতায়াত, মিটিং..." /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} /></div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground" disabled={submitting}>{submitting ? 'Adding...' : 'Add'}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-card border-warning/30">
        <CardContent className="p-5 text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-2"><Lock className="w-3.5 h-3.5" /> Total Private Expenses</p>
          <p className="text-3xl font-bold text-warning">৳{total.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground mt-1">{privateExpenses.length} টি এন্ট্রি</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">Expense History</CardTitle></CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">এখনো কোনো private expense নেই</p>
          ) : (
            <div className="space-y-2">
              {sorted.map(e => (
                <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-card-foreground">{e.title}</p>
                      {e.category && <Badge variant="outline" className="text-[10px]">{e.category}</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{e.date}{e.notes ? ` • ${e.notes}` : ''}</p>
                  </div>
                  <p className="text-sm font-semibold text-warning whitespace-nowrap">৳{Number(e.amount).toLocaleString()}</p>
                  <button onClick={() => setDeleteId(e.id)} className="p-1.5 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Delete this expense?</AlertDialogTitle><AlertDialogDescription>This cannot be undone.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={async () => { if (deleteId) { await deletePrivateExpense(deleteId); setDeleteId(null); toast.success('Deleted'); } }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
