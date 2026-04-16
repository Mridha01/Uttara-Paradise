import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Phone, MapPin, Calendar, CreditCard, Image as ImageIcon } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { TOTAL_SHARE_AMOUNT, INSTALLMENT_AMOUNT } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function ShareholderDetail() {
  const { id } = useParams<{ id: string }>();
  const { getShareholder, getShareholderPayments, getShareholderInstallments, loading } = useApp();
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const shareholder = getShareholder(id!);
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
      <Link to="/shareholders" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Shareholders
      </Link>

      <Card className="shadow-card">
        <CardContent className="p-5">
          <div className="flex items-center gap-4">
            {shareholder.profile_image_url ? (
              <img src={shareholder.profile_image_url} alt={shareholder.name} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
            ) : (
              <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl flex-shrink-0">{shareholder.name.charAt(0)}</div>
            )}
            <div className="flex-1">
              <h1 className="text-xl font-bold text-card-foreground">{shareholder.name}</h1>
              <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{shareholder.phone}</span>
                <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{shareholder.address || 'N/A'}</span>
                <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{shareholder.booking_date}</span>
              </div>
              {shareholder.num_shares > 1 && <span className="text-sm font-medium text-primary">Shares: {shareholder.num_shares}</span>}
            </div>
            <Badge variant={shareholder.status === 'fully_paid' ? 'default' : 'secondary'} className={shareholder.status === 'fully_paid' ? 'bg-success' : ''}>
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
          {payments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No payments yet</p>
          ) : (
            <div className="space-y-3">
              {payments.map(p => (
                <div key={p.id} onClick={() => setSelectedPayment(p.id)} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-4 h-4 text-muted-foreground" />
                    <div><p className="text-sm font-medium text-card-foreground">৳{p.amount.toLocaleString()}</p><p className="text-xs text-muted-foreground">{p.date}</p></div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{p.type === 'booking' ? 'Booking' : 'Remaining'}</Badge>
                    {p.screenshot_url && <ImageIcon className="w-4 h-4 text-primary" />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Installment History */}
      <Card className="shadow-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">📅 Installment Collection (৳{totalInstallments.toLocaleString()})</CardTitle>
        </CardHeader>
        <CardContent>
          {installments.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No installments yet</p>
          ) : (
            <div className="space-y-3">
              {installments.map(inst => (
                <div key={inst.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-card-foreground">৳{inst.amount.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">{inst.month}/{inst.year} • {inst.date}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">Installment</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

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
