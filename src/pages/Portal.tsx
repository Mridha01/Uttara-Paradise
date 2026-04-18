import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Building2, Phone, MapPin, Calendar, CreditCard, Image as ImageIcon, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Shareholder, Payment, Installment, formatBdtBangla, INSTALLMENT_AMOUNT, INSTALLMENT_MONTHS } from '@/types';

const MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

export default function Portal() {
  const { id } = useParams<{ id: string }>();
  const [shareholder, setShareholder] = useState<Shareholder | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [selectedInstallment, setSelectedInstallment] = useState<Installment | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const [shRes, payRes, instRes, setRes] = await Promise.all([
        supabase.from('shareholders').select('*').eq('id', id).maybeSingle(),
        supabase.from('payments').select('*').eq('shareholder_id', id).order('date', { ascending: false }),
        supabase.from('installments').select('*').eq('shareholder_id', id).order('year', { ascending: false }).order('month', { ascending: false }),
        (supabase.from as any)('project_settings').select('*'),
      ]);
      if (!shRes.data) { setNotFound(true); setLoading(false); return; }
      setShareholder(shRes.data as unknown as Shareholder);
      setPayments((payRes.data || []) as unknown as Payment[]);
      setInstallments((instRes.data || []) as unknown as Installment[]);
      if (setRes?.data) {
        const m: Record<string, string> = {};
        (setRes.data as any[]).forEach(r => { m[r.key] = r.value; });
        setSettings(m);
      }
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">লোড হচ্ছে...</div>;
  }

  if (notFound || !shareholder) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-3 px-4 text-center">
        <XCircle className="w-12 h-12 text-destructive" />
        <p className="text-lg font-semibold text-foreground">শেয়ারহোল্ডার পাওয়া যায়নি</p>
        <p className="text-sm text-muted-foreground">আপনার লিংকটি সঠিক কিনা যাচাই করুন।</p>
      </div>
    );
  }

  const due = shareholder.total_share - shareholder.total_paid;
  const progress = (shareholder.total_paid / shareholder.total_share) * 100;
  const totalInstAmount = installments.reduce((s, i) => s + Number(i.amount), 0);
  const totalMonths = Number(settings.installment_months) || INSTALLMENT_MONTHS;
  const monthlyAmount = Number(settings.installment_amount) || INSTALLMENT_AMOUNT;
  const installTarget = totalMonths * monthlyAmount;
  const installPct = Math.min(100, (totalInstAmount / installTarget) * 100);

  // Build installment matrix (paid/unpaid) for the target months starting from booking month
  const bookingDate = new Date(shareholder.booking_date);
  const startY = bookingDate.getFullYear();
  const startM = bookingDate.getMonth() + 1;
  const now = new Date();
  const installRows: { month: number; year: number; paid: Installment | null; isPast: boolean }[] = [];
  for (let i = 0; i < totalMonths; i++) {
    const m = ((startM - 1 + i) % 12) + 1;
    const y = startY + Math.floor((startM - 1 + i) / 12);
    const paid = installments.find(x => x.month === m && x.year === y) || null;
    const isPast = y < now.getFullYear() || (y === now.getFullYear() && m <= now.getMonth() + 1);
    installRows.push({ month: m, year: y, paid, isPast });
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-base font-bold text-foreground">Uttara Vilas</h1>
            <p className="text-xs text-muted-foreground">শেয়ারহোল্ডার পোর্টাল</p>
          </div>
          <Badge variant="outline" className="text-xs">Read-only</Badge>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-4">
        {/* Profile */}
        <Card className="shadow-card">
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              {shareholder.profile_image_url ? (
                <img src={shareholder.profile_image_url} alt={shareholder.name} className="w-20 h-20 rounded-full object-cover flex-shrink-0 border-2 border-primary/20" />
              ) : (
                <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl flex-shrink-0">{shareholder.name.charAt(0)}</div>
              )}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-card-foreground">{shareholder.name}</h2>
                <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{shareholder.phone}</span>
                  {shareholder.address && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{shareholder.address}</span>}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md">
                    <Calendar className="w-3 h-3" /> যোগদান: {bookingDate.toLocaleDateString('bn-BD')}
                  </span>
                  {shareholder.num_shares > 1 && <Badge className="bg-primary/20 text-primary">{shareholder.num_shares}টি শেয়ার</Badge>}
                  <Badge className={shareholder.status === 'fully_paid' ? 'bg-success text-success-foreground' : shareholder.status === 'partial' ? 'bg-warning text-warning-foreground' : 'bg-muted'}>
                    {shareholder.status === 'fully_paid' ? 'সম্পূর্ণ পরিশোধিত' : shareholder.status === 'partial' ? 'আংশিক' : 'বুকিং'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Share Summary */}
        <div className="grid grid-cols-3 gap-2">
          <Card className="shadow-card"><CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">মোট শেয়ার</p>
            <p className="text-sm font-bold text-card-foreground">{formatBdtBangla(shareholder.total_share)}</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">পরিশোধিত</p>
            <p className="text-sm font-bold text-success">{formatBdtBangla(shareholder.total_paid)}</p>
          </CardContent></Card>
          <Card className="shadow-card"><CardContent className="p-3 text-center">
            <p className="text-[10px] text-muted-foreground">বাকি</p>
            <p className="text-sm font-bold text-destructive">{formatBdtBangla(due)}</p>
          </CardContent></Card>
        </div>

        <Card className="shadow-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-xs"><span className="text-muted-foreground">শেয়ার পেমেন্ট প্রগ্রেস</span><span className="font-medium text-foreground">{Math.round(progress)}%</span></div>
            <Progress value={progress} className="h-2" />
          </CardContent>
        </Card>

        {/* Payments */}
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">💰 পেমেন্ট ইতিহাস ({payments.length})</CardTitle></CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">এখনো কোনো পেমেন্ট নেই</p>
            ) : (
              <div className="space-y-2">
                {payments.map(p => (
                  <button key={p.id} onClick={() => setSelectedPayment(p)} className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-card-foreground">৳{Number(p.amount).toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{p.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{p.type === 'booking' ? 'বুকিং' : 'বাকি পেমেন্ট'}</Badge>
                      {p.screenshot_url && <ImageIcon className="w-4 h-4 text-primary" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Installment Summary */}
        <Card className="shadow-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
              <span>📅 ইনস্টলমেন্ট ({installments.length} / {totalMonths})</span>
              <span className="text-sm font-normal text-success">৳{totalInstAmount.toLocaleString()} / ৳{installTarget.toLocaleString()}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={installPct} className="h-2" />
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-success/10"><p className="text-[10px] text-muted-foreground">পরিশোধিত</p><p className="text-sm font-bold text-success">{installments.length}</p></div>
              <div className="p-2 rounded-lg bg-warning/10"><p className="text-[10px] text-muted-foreground">বাকি</p><p className="text-sm font-bold text-warning">{Math.max(0, totalMonths - installments.length)}</p></div>
              <div className="p-2 rounded-lg bg-primary/10"><p className="text-[10px] text-muted-foreground">প্রগ্রেস</p><p className="text-sm font-bold text-primary">{Math.round(installPct)}%</p></div>
            </div>

            {/* Month-by-month grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-80 overflow-y-auto pr-1">
              {installRows.map((r, idx) => (
                <button
                  key={idx}
                  disabled={!r.paid}
                  onClick={() => r.paid && setSelectedInstallment(r.paid)}
                  className={`p-2 rounded-lg border text-left transition-all ${
                    r.paid
                      ? 'bg-success/10 border-success/30 hover:bg-success/20 cursor-pointer'
                      : r.isPast
                        ? 'bg-destructive/5 border-destructive/20'
                        : 'bg-muted/30 border-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-card-foreground">{MONTHS[r.month - 1].slice(0, 3)} {r.year}</p>
                    {r.paid ? <CheckCircle2 className="w-3.5 h-3.5 text-success" /> : r.isPast ? <XCircle className="w-3.5 h-3.5 text-destructive" /> : <Calendar className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                  <p className={`text-[10px] mt-0.5 ${r.paid ? 'text-success' : r.isPast ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {r.paid ? `৳${Number(r.paid.amount).toLocaleString()}` : r.isPast ? 'বাকি' : 'অপেক্ষমান'}
                  </p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-[10px] text-muted-foreground pt-4 pb-8">
          🔒 এটি একটি read-only ভিউ। যেকোনো প্রশ্নের জন্য অ্যাডমিনের সাথে যোগাযোগ করুন।
        </p>
      </div>

      {/* Payment popup */}
      <Dialog open={!!selectedPayment} onOpenChange={(o) => !o && setSelectedPayment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>পেমেন্ট বিবরণ</DialogTitle></DialogHeader>
          {selectedPayment && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">পরিমাণ</p><p className="font-bold text-lg text-card-foreground">৳{Number(selectedPayment.amount).toLocaleString()}</p></div>
                <div><p className="text-muted-foreground text-xs">ধরন</p><Badge variant="outline">{selectedPayment.type === 'booking' ? 'বুকিং' : 'বাকি'}</Badge></div>
                <div><p className="text-muted-foreground text-xs">তারিখ</p><p className="font-medium text-card-foreground">{selectedPayment.date}</p></div>
              </div>
              {selectedPayment.notes && <div><p className="text-xs text-muted-foreground">নোট</p><p className="text-sm">{selectedPayment.notes}</p></div>}
              {selectedPayment.screenshot_url && (
                <div><p className="text-xs text-muted-foreground mb-2">পেমেন্ট স্লিপ</p>
                  <img src={selectedPayment.screenshot_url} alt="slip" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Installment popup */}
      <Dialog open={!!selectedInstallment} onOpenChange={(o) => !o && setSelectedInstallment(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>ইনস্টলমেন্ট বিবরণ</DialogTitle></DialogHeader>
          {selectedInstallment && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs">পরিমাণ</p><p className="font-bold text-lg text-card-foreground">৳{Number(selectedInstallment.amount).toLocaleString()}</p></div>
                <div><p className="text-muted-foreground text-xs">মাস</p><p className="font-medium">{MONTHS[selectedInstallment.month - 1]} {selectedInstallment.year}</p></div>
                <div><p className="text-muted-foreground text-xs">তারিখ</p><p className="font-medium">{selectedInstallment.date}</p></div>
              </div>
              {selectedInstallment.notes && <div><p className="text-xs text-muted-foreground">নোট</p><p className="text-sm">{selectedInstallment.notes}</p></div>}
              {selectedInstallment.screenshot_url && (
                <div><p className="text-xs text-muted-foreground mb-2">স্লিপ</p>
                  <img src={selectedInstallment.screenshot_url} alt="slip" className="w-full rounded-lg border border-border max-h-96 object-contain" />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
