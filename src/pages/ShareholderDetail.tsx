import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Calendar, CreditCard, Image as ImageIcon, Copy, ExternalLink, ShieldCheck, CheckCircle2, User } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { INSTALLMENT_MONTHS, INSTALLMENT_AMOUNT } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function ShareholderDetail() {
  const { id } = useParams<{ id: string }>();
  const { getShareholder, getShareholderPayments, getShareholderInstallments, settings, loading } = useApp();
  const { isAdmin } = useAuth();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const shareholder = getShareholder(id!);
  const portalUrl = id && shareholder?.portal_token ? `${window.location.origin}/portal/${id}?token=${shareholder.portal_token}` : '';
  const copyPortalLink = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      toast.success('Portal link copied! Share this privately.');
    } catch {
      toast.error('Failed to copy');
    }
  };

  const payments = getShareholderPayments(id!);
  const installments = getShareholderInstallments(id!);

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-cyan-500 animate-spin-reverse"></div>
      </div>
    </div>
  );

  if (!shareholder) {
    return (
      <div className="text-center py-20 bg-card/30 rounded-3xl border border-border border-dashed">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
        <p className="text-muted-foreground text-xl font-medium">Shareholder not found</p>
        <Link to="/shareholders">
          <Button variant="outline" className="mt-6 gap-2 rounded-full"><ArrowLeft className="w-4 h-4" /> Back to list</Button>
        </Link>
      </div>
    );
  }

  const due = shareholder.total_share - shareholder.total_paid;
  const progress = (shareholder.total_paid / shareholder.total_share) * 100;
  const selected = payments.find(p => p.id === selectedPayment);
  const totalInstallments = installments.reduce((s, i) => s + i.amount, 0);
  const isFullyPaid = shareholder.status === 'fully_paid';

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Link to="/shareholders" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 hover:bg-muted text-sm text-foreground transition-colors font-medium border border-border/50">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>
        {isAdmin && (
          <div className="flex items-center gap-2 bg-primary/10 p-1.5 rounded-full border border-primary/20 backdrop-blur-sm">
            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="ghost" className="gap-2 rounded-full hover:bg-primary/20 text-primary hover:text-primary"><ExternalLink className="w-3.5 h-3.5" /> Portal Preview</Button>
            </a>
            <Button size="sm" onClick={copyPortalLink} className="gap-2 rounded-full bg-primary text-primary-foreground shadow-sm hover:shadow-md transition-shadow">
              <Copy className="w-3.5 h-3.5" /> Copy Link
            </Button>
          </div>
        )}
      </div>

      {/* Premium Profile Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-6 sm:p-10 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className={`absolute -top-24 -right-24 w-96 h-96 rounded-full blur-3xl opacity-40 group-hover:opacity-60 transition-opacity duration-700 ${isFullyPaid ? 'bg-emerald-500' : 'bg-cyan-500'}`}></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          {/* Avatar */}
          <div className="relative">
            {shareholder.profile_image_url ? (
              <img src={shareholder.profile_image_url} alt={shareholder.name} className={`w-24 h-24 sm:w-32 sm:h-32 rounded-3xl object-cover shadow-2xl ring-4 ${isFullyPaid ? 'ring-emerald-500/30' : 'ring-cyan-500/30'}`} />
            ) : (
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center text-white font-bold text-4xl sm:text-5xl shadow-2xl bg-gradient-to-br ${isFullyPaid ? 'from-emerald-400 to-emerald-600' : 'from-cyan-400 to-blue-600'}`}>
                {shareholder.name.charAt(0)}
              </div>
            )}
            {isFullyPaid && (
              <div className="absolute -bottom-3 -right-3 bg-slate-900 rounded-full p-1.5 shadow-lg border border-white/10">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 fill-emerald-500/20" />
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left min-w-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md break-words">
                {shareholder.name}
              </h1>
              <div className={`inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-full border font-bold text-sm backdrop-blur-md shadow-lg ${isFullyPaid ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'}`}>
                {isFullyPaid ? 'Fully Paid Member' : shareholder.status === 'partial' ? 'Partial Payment' : 'Booked Member'}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row flex-wrap items-center md:items-start justify-center md:justify-start gap-4 sm:gap-6 mt-4 text-sm sm:text-base text-slate-300">
              <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><Phone className="w-4 h-4 text-slate-400" /> <span className="break-all">{shareholder.phone}</span></span>
              <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 max-w-full"><MapPin className="w-4 h-4 text-slate-400 flex-shrink-0" /> <span className="truncate">{shareholder.address || 'N/A'}</span></span>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/10 border border-white/20 px-4 py-2 rounded-xl backdrop-blur-md">
                <Calendar className="w-4 h-4 text-cyan-400" /> Joined {new Date(shareholder.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
              {shareholder.num_shares > 1 && (
                <span className="inline-flex items-center gap-2 text-sm font-bold text-white bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 px-4 py-2 rounded-xl backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> {shareholder.num_shares} Shares Owned
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Financial Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-lg p-6 group hover:-translate-y-1 transition-transform duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 to-gray-500/5 opacity-50"></div>
          <div className="relative z-10 text-center">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2">Total Share Cost</p>
            <p className="text-3xl font-extrabold text-foreground tracking-tight">৳{shareholder.total_share.toLocaleString()}</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-md shadow-lg p-6 group hover:-translate-y-1 transition-transform duration-300">
          <div className="relative z-10 text-center">
            <p className="text-sm font-semibold text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-wider mb-2">Amount Paid</p>
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">৳{shareholder.total_paid.toLocaleString()}</p>
          </div>
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/20 bg-rose-500/5 backdrop-blur-md shadow-lg p-6 group hover:-translate-y-1 transition-transform duration-300">
          <div className="relative z-10 text-center">
            <p className="text-sm font-semibold text-rose-600/80 dark:text-rose-400/80 uppercase tracking-wider mb-2">Remaining Due</p>
            <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 tracking-tight">৳{due.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center px-1 text-sm font-bold text-muted-foreground">
          <span>Overall Payment Progress</span>
          <span className={isFullyPaid ? "text-emerald-500" : "text-cyan-500"}>{Math.round(progress)}%</span>
        </div>
        <div className="h-3 w-full bg-muted rounded-full overflow-hidden border border-border/50 shadow-inner">
          <div className={`h-full transition-all duration-1000 ease-out relative ${isFullyPaid ? 'bg-emerald-500' : 'bg-gradient-to-r from-cyan-400 to-blue-500'}`} style={{ width: `${progress}%` }}>
            <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20"></div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Payment History Card */}
        <Card className="shadow-lg border border-border bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col h-[500px]">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4 shrink-0">
            <CardTitle className="text-lg flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary" /> Payment History ({payments.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden flex flex-col h-full">
            {!isAdmin && payments.length > 0 && (
              <div className="shrink-0 flex items-start gap-3 p-4 m-4 mb-2 rounded-xl bg-primary/10 border border-primary/20 text-xs text-primary">
                <ShieldCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">গোপনীয়তার জন্য পেমেন্ট স্লিপ সর্বজনীন ভিউতে দেখানো হয় না। নিজের সম্পূর্ণ বিবরণের জন্য আপনার ব্যক্তিগত পোর্টাল লিংক ব্যবহার করুন (অ্যাডমিনের কাছ থেকে নিন)।</span>
              </div>
            )}
            {payments.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground">
                <CreditCard className="w-12 h-12 mb-3 opacity-20" />
                <p className="font-medium">No payments recorded yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {payments.map(p => (
                  <div key={p.id} onClick={() => isAdmin && setSelectedPayment(p.id)} className={`relative overflow-hidden group flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300 ${isAdmin ? 'hover:bg-muted/50 cursor-pointer hover:border-primary/30 border-border/50 bg-background/50' : 'border-border/50 bg-background/50'}`}>
                    <div className="flex items-center gap-4 mb-2 sm:mb-0">
                      <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <ArrowLeft className="w-4 h-4 rotate-[135deg]" />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground tracking-tight">৳{p.amount.toLocaleString()}</p>
                        <p className="text-xs font-medium text-muted-foreground mt-0.5">{new Date(p.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto mt-2 sm:mt-0 pl-14 sm:pl-0">
                      <Badge variant="outline" className={`font-semibold ${p.type === 'booking' ? 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'}`}>
                        {p.type === 'booking' ? 'Booking Fund' : 'Remaining Installment'}
                      </Badge>
                      {isAdmin && p.screenshot_url && (
                        <div className="p-1.5 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors" title="View Slip">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Installment History Card */}
        {(() => {
          const totalMonths = Number(settings.installment_months) || INSTALLMENT_MONTHS;
          const monthlyAmount = Number(settings.installment_amount) || INSTALLMENT_AMOUNT;
          const paidCount = installments.length;
          const targetTotal = totalMonths * monthlyAmount;
          const pct = Math.min(100, (totalInstallments / targetTotal) * 100);
          return (
            <Card className="shadow-lg border border-border bg-card/40 backdrop-blur-md rounded-2xl overflow-hidden flex flex-col h-[500px]">
              <CardHeader className="bg-muted/20 border-b border-border/50 pb-4 shrink-0">
                <CardTitle className="text-lg flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-2"><Calendar className="w-5 h-5 text-cyan-500" /> Monthly Installments</span>
                  <Badge variant="outline" className="bg-background">{paidCount} of {totalMonths} Months</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 overflow-hidden flex flex-col h-full">
                <div className="shrink-0 p-4 border-b border-border/50 bg-background/30">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-xs uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">Total Paid / Target</p>
                      <p className="text-sm font-bold text-foreground">
                        <span className="text-emerald-500">৳{totalInstallments.toLocaleString()}</span> / ৳{targetTotal.toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-cyan-500">{Math.round(pct)}%</p>
                  </div>
                  <Progress value={pct} className="h-2 rounded-full" />
                </div>

                {installments.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground">
                    <Calendar className="w-12 h-12 mb-3 opacity-20" />
                    <p className="font-medium">No installments recorded yet</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                    {installments.map(inst => (
                      <div key={inst.id} className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-500 border border-cyan-500/20">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-base font-bold text-foreground">৳{inst.amount.toLocaleString()}</p>
                              <p className="text-xs font-medium text-muted-foreground mt-0.5">{inst.month}/{inst.year} • {new Date(inst.date).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-cyan-500/5 text-cyan-600 dark:text-cyan-400 border-cyan-500/20">Installment</Badge>
                        </div>
                        {isAdmin && inst.screenshot_url && (
                          <div className="mt-3 rounded-lg overflow-hidden border border-border/50 bg-muted/20">
                            <img src={inst.screenshot_url} alt="Installment slip" className="w-full max-h-48 object-contain hover:scale-105 transition-transform duration-500 cursor-pointer" onClick={() => window.open(inst.screenshot_url, '_blank')} />
                          </div>
                        )}
                        {inst.notes && <p className="text-xs font-medium text-muted-foreground mt-3 bg-muted/50 p-2 rounded-md border border-border/50">📝 {inst.notes}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })()}
      </div>

      {/* Payment Detail Popup (Admin Only) */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="sm:max-w-md border-border/50 bg-background/95 backdrop-blur-xl rounded-2xl">
          <DialogHeader><DialogTitle className="text-xl">Payment Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-5 mt-2">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                <div><p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Amount</p><p className="font-extrabold text-xl text-emerald-500 tracking-tight">৳{selected.amount.toLocaleString()}</p></div>
                <div><p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Type</p><Badge variant="outline" className="bg-background">{selected.type === 'booking' ? 'Booking' : 'Remaining'}</Badge></div>
                <div><p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Date</p><p className="font-semibold text-foreground">{selected.date}</p></div>
                <div><p className="text-xs uppercase font-semibold text-muted-foreground mb-1">Recorded On</p><p className="font-semibold text-foreground">{new Date(selected.created_at).toLocaleDateString()}</p></div>
              </div>
              {selected.notes && (
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1.5">Admin Notes</p>
                  <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-xl border border-border/50">{selected.notes}</div>
                </div>
              )}
              {selected.screenshot_url && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-semibold text-foreground">Payment Slip</p>
                    <a href={selected.screenshot_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline flex items-center gap-1"><ExternalLink className="w-3 h-3" /> Open original</a>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/30 p-1">
                    <img src={selected.screenshot_url} alt="Payment slip" className="w-full rounded-lg max-h-96 object-contain" />
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
