import { useState } from 'react';
import { Plus, Calendar, TrendingDown, Wallet, Receipt, BriefcaseBusiness } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function Expenses() {
  const { expenses, addExpense, loading } = useApp();
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const sorted = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.amount) return;
    setSubmitting(true);
    try {
      await addExpense({ title: form.title, amount: Number(form.amount), date: form.date, notes: form.notes });
      setForm({ title: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
      setDialogOpen(false);
      toast.success('Expense recorded successfully!');
    } catch {
      toast.error('Failed to add expense');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-rose-500 animate-spin-reverse"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-6 lg:p-8 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div className="w-full lg:w-auto text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-rose-400 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
              <TrendingDown className="w-3 h-3" /> Financial Outflow
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
              Project Expenses
            </h1>
          </div>

          <div className="w-full lg:w-auto flex flex-col sm:flex-row items-center gap-3">
            {isAdmin && (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full sm:w-auto h-12 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white border-0 shadow-lg shadow-rose-500/25 gap-2 transition-all hover:scale-105 px-6">
                    <Plus className="w-4 h-4" /> Record Expense
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[450px] border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl">
                  <DialogHeader><DialogTitle className="text-xl">Add New Expense</DialogTitle></DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-2">
                    <div className="space-y-1.5">
                      <Label className="text-foreground/80">Expense Title *</Label>
                      <Input className="bg-muted/50" placeholder="e.g. Construction Materials" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-foreground/80">Amount (৳) *</Label>
                        <Input className="bg-muted/50 text-lg font-bold text-rose-500" type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} min={1} required />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-foreground/80">Date</Label>
                        <Input className="bg-muted/50" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-foreground/80">Description / Notes</Label>
                      <Textarea className="bg-muted/50 resize-none" placeholder="Add any relevant details..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} rows={3} />
                    </div>
                    <Button type="submit" className="w-full h-11 bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white shadow-lg shadow-rose-500/25 mt-4" disabled={submitting}>
                      {submitting ? 'Recording...' : 'Save Expense'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Massive KPI Card */}
      <div className="relative overflow-hidden rounded-3xl border border-rose-500/30 bg-card/60 backdrop-blur-xl shadow-2xl p-8 group transition-transform duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-500/10 via-background to-orange-500/5"></div>
        <div className="relative z-10 flex flex-col items-center justify-center text-center">
          <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-500 mb-4 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="w-8 h-8" />
          </div>
          <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Project Expenses</p>
          <p className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500 tracking-tight drop-shadow-sm">
            ৳{totalExpenses.toLocaleString()}
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-background/50 border border-border/50 text-xs font-semibold text-muted-foreground shadow-inner">
            <BriefcaseBusiness className="w-4 h-4 text-rose-400" />
            Across {expenses.length} Records
          </div>
        </div>
      </div>

      {/* Premium Expense Ledger */}
      <Card className="shadow-xl border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col min-h-[500px]">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4 shrink-0">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2"><Receipt className="w-5 h-5 text-rose-500" /> Expense History</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden flex flex-col h-full">
          {sorted.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Receipt className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg">No expenses recorded yet</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 custom-scrollbar">
              {sorted.map((e, i) => (
                <div
                  key={e.id}
                  className="relative overflow-hidden group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl border border-border/50 bg-background/50 hover:bg-muted/50 transition-all duration-300 hover:border-rose-500/30 hover:shadow-md animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500/50 group-hover:bg-rose-500 transition-colors"></div>

                  {/* Left side: Info */}
                  <div className="flex items-start sm:items-center gap-4 mb-3 sm:mb-0 pl-2">
                    <div className="hidden sm:flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-muted border border-border/50 shadow-inner flex-shrink-0">
                      <Calendar className="w-4 h-4 text-muted-foreground mb-0.5" />
                      <span className="text-xs font-bold text-foreground">{new Date(e.date).getDate()}</span>
                      <span className="text-[10px] font-semibold text-muted-foreground uppercase">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                    </div>
                    <div>
                      <p className="text-base sm:text-lg font-bold text-foreground group-hover:text-rose-500 transition-colors">{e.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs font-medium text-muted-foreground sm:hidden">
                          {new Date(e.date).toLocaleDateString('en-GB')}
                        </p>
                        {e.notes && (
                          <span className="text-xs text-muted-foreground bg-muted/50 inline-block px-2 py-0.5 rounded-md border border-border/50 line-clamp-1 max-w-[200px] sm:max-w-md">
                            📝 {e.notes}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Amount */}
                  <div className="flex items-center justify-end">
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 text-sm sm:text-base px-3 py-1 font-bold">
                      ৳{e.amount.toLocaleString()}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
