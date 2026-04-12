import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

export default function Expenses() {
  const { expenses, addExpense, currentRole } = useApp();
  const isAdmin = currentRole === 'admin' || currentRole === 'director';
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    addExpense({ title: form.title, amount: Number(form.amount), date: form.date, notes: form.notes });
    setForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
    setDialogOpen(false);
    toast.success('Expense added successfully!');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-bold text-foreground">Expenses</h1>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-primary-foreground gap-2"><Plus className="w-4 h-4" /> Add Expense</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add Expense</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required /></div>
                <div><Label>Amount (৳) *</Label><Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} min={1} required /></div>
                <div><Label>Date</Label><Input type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
                <div><Label>Notes</Label><Textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} /></div>
                <Button type="submit" className="w-full gradient-primary text-primary-foreground">Add Expense</Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="shadow-card gradient-accent">
        <CardContent className="p-5 text-center">
          <p className="text-sm text-accent-foreground/80">Total Expenses</p>
          <p className="text-3xl font-bold text-accent-foreground">৳{totalExpenses.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">Expense History</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sorted.map((e, i) => (
              <div key={e.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 animate-fade-in" style={{ animationDelay: `${i * 40}ms` }}>
                <div>
                  <p className="text-sm font-medium text-card-foreground">{e.title}</p>
                  <p className="text-xs text-muted-foreground">{e.date}{e.notes ? ` • ${e.notes}` : ''}</p>
                </div>
                <p className="text-sm font-semibold text-warning">৳{e.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
