import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Calendar, CreditCard, Image as ImageIcon, Copy, ExternalLink, ShieldCheck } from 'lucide-react';
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
      toast.success('গোপন পোর্টাল লিংক কপি হয়েছে! শুধু এই শেয়ারহোল্ডারকে পাঠান।');
    } catch {
      toast.error('কপি করতে ব্যর্থ');
    }
  };

  const payments = getShareholderPayments(id!);
  const installments = getShareholderInstallments(id!);

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  if (!shareholder) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Shareholder not found</p>
        <Link to="/shareholders" className="text-primary underline text-sm mt-2 inline-block">← Back to list</Link>
      </div>
    );
  }

  const due = shareholder.total_share - shareholder.total_paid;
  const progress = (shareholder.total_paid / shareholder.total_share) * 100;
  const selected = payments.find(p => p.id === selectedPayment);
  const totalInstallments = installments.reduce((s, i) => s + i.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <Link to="/shareholders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Shareholders
        </Link>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <a href={portalUrl} target="_blank" rel="noopener noreferrer">
              <Button size="sm" variant="outline" className="gap-2"><ExternalLink className="w-3.5 h-3.5" /> পোর্টাল প্রিভিউ</Button>
            </a>
            <Button size="sm" onClick={copyPortalLink} className="gap-2 gradient-primary text-primary-foreground">
              <Copy className="w-3.5 h-3.5" /> পোর্টাল লিংক কপি
            </Button>
          </div>
        )}
      </div>

      <Card className="shadow-card overflow-hidden">
        <div className="h-1 gradient-primary" />
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2 mb-3 sm:hidden">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Shareholder</span>
            <Badge variant={shareholder.status === 'fully_paid' ? 'default' : 'secondary'} className={shareholder.status === 'fully_paid' ? 'bg-success text-success-foreground' : ''}>
              {shareholder.status === 'fully_paid' ? 'Fully Paid' : shareholder.status === 'partial' ? 'Partial' : 'Booked'}
            </Badge>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-start gap-3 sm:gap-4">
              {shareholder.profile_image_url ? (
                <img src={shareholder.profile_image_url} alt={shareholder.name} className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover flex-shrink-0 ring-2 ring-primary/30" />
              ) : (
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl flex-shrink-0">{shareholder.name.charAt(0)}</div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-card-foreground break-words">{shareholder.name}</h1>
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 mt-1 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 flex-shrink-0" /><span className="break-all">{shareholder.phone}</span></span>
                  <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="break-words">{shareholder.address || 'N/A'}</span></span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                    <Calendar className="w-3.5 h-3.5" /> {new Date(shareholder.booking_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                  {shareholder.num_shares > 1 && <span className="text-xs sm:text-sm font-medium text-primary bg-primary/10 px-2 py-1 rounded-md">Shares: {shareholder.num_shares}</span>}
                </div>
              </div>
            </div>
            <Badge variant={shareholder.status === 'fully_paid' ? 'default' : 'secondary'} className={cn("hidden sm:inline-flex sm:ml-auto self-start", shareholder.status === 'fully_paid' ? 'bg-success text-success-foreground' : '')}>
              {shareholder.status === 'fully_paid' ? 'Fully Paid' : shareholder.status === 'partial' ? 'Partial' : 'Booked'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-card"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Share</p><p className="text-lg font-bold text-card-foreground">৳{shareholder.total_share.toLocaleString()}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Total Paid</p><p className="text-lg font-bold text-success">৳{shareholder.total_paid.toLocaleString()}</p></CardContent></Card>
        <Card className="shadow-card"><CardContent className="p-4 text-center"><p className="text-xs text-muted-foreground">Due Amount</p><p className="text-lg font-bold text-destructive">৳{due.toLocaleString()}</p></CardContent></Card>
      </div>

      <Progress value={progress} className="h-2" />

      {/* Payment History */}
      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">Payment History ({payments.length})</CardTitle></CardHeader>
        <CardContent>
          {!isAdmin && payments.length > 0 && (
            <div className="flex items-center gap-2 p-3 mb-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <span>গোপনীয়তার জন্য পেমেন্ট স্লিপ সর্বজনীন ভিউতে দেখানো হয় না। নিজের সম্পূর্ণ বিবরণের জন্য আপনার ব্যক্তিগত পোর্টাল লিংক ব্যবহার করুন (অ্যাডমিনের কাছ থেকে নিন)।</span>
            </div>
          )}
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {payments.map(p => (
                <div key={p.id} onClick={() => isAdmin && setSelectedPayment(p.id)} className={`flex items-center justify-between p-3 rounded-lg bg-muted/50 ${isAdmin ? 'hover:bg-muted cursor-pointer' : ''} transition-colors`}>
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <div><p className="text-sm font-medium text-card-foreground">৳{p.amount.toLocaleString()}</p><p className="text-xs text-muted-foreground">{p.date}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{p.type === 'booking' ? 'Booking' : 'Remaining'}</Badge>
                    {isAdmin && p.screenshot_url && <ImageIcon className="w-4 h-4 text-primary" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Installment History */}
      {(() => {
        const totalMonths = Number(settings.installment_months) || INSTALLMENT_MONTHS;
        const monthlyAmount = Number(settings.installment_amount) || INSTALLMENT_AMOUNT;
        const paidCount = installments.length;
        const targetTotal = totalMonths * monthlyAmount;
        const pct = Math.min(100, (totalInstallments / targetTotal) * 100);
        return (
          <Card className="shadow-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
                <span>📅 ইনস্টলমেন্ট ({paidCount} / {totalMonths} মাস)</span>
                <span className="text-sm font-normal text-success">৳{totalInstallments.toLocaleString()} / ৳{targetTotal.toLocaleString()}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={pct} className="h-2" />
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">পরিশোধিত</p><p className="text-sm font-bold text-success">{paidCount} মাস</p></div>
                <div className="p-2 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">বাকি</p><p className="text-sm font-bold text-warning">{Math.max(0, totalMonths - paidCount)} মাস</p></div>
                <div className="p-2 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">প্রগ্রেস</p><p className="text-sm font-bold text-primary">{Math.round(pct)}%</p></div>
              </div>
              {installments.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No installments yet</p>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {installments.map(inst => (
                    <div key={inst.id} className="p-3 rounded-lg bg-muted/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-card-foreground">৳{inst.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">{inst.month}/{inst.year} • {inst.date}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">Installment</Badge>
                      </div>
                      {isAdmin && inst.screenshot_url && (
                        <img src={inst.screenshot_url} alt="Installment slip" className="w-full max-h-64 object-contain rounded-md border border-border" />
                      )}
                      {inst.notes && <p className="text-xs text-muted-foreground">📝 {inst.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })()}

      {/* Payment Detail Popup */}
      <Dialog open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Payment Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground">Amount</p><p className="font-bold text-lg text-card-foreground">৳{selected.amount.toLocaleString()}</p></div>
                <div><p className="text-muted-foreground">Type</p><Badge variant="outline">{selected.type === 'booking' ? 'Booking' : 'Remaining'}</Badge></div>
                <div><p className="text-muted-foreground">Date</p><p className="font-medium text-card-foreground">{selected.date}</p></div>
                <div><p className="text-muted-foreground">Recorded</p><p className="font-medium text-card-foreground">{new Date(selected.created_at).toLocaleDateString()}</p></div>
              </div>
              {selected.notes && (<div><p className="text-sm text-muted-foreground">Notes</p><p className="text-sm text-card-foreground">{selected.notes}</p></div>)}
              {selected.screenshot_url && (<div><p className="text-sm text-muted-foreground mb-2">Payment Slip</p><img src={selected.screenshot_url} alt="Payment slip" className="w-full rounded-lg border border-border max-h-96 object-contain" /></div>)}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
