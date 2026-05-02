import { useRef } from 'react';
import { Printer, Download, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Payment, Shareholder, Director } from '@/types';
import { formatBdtBangla } from '@/types';

interface Props {
  payment: Payment | null;
  shareholder: Shareholder | null;
  directors: Director[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional running balances at the time of viewing */
  totalPaid?: number;
  totalShare?: number;
}

const numberToWordsBn = (n: number): string => {
  // Simple compact representation in Bangla style
  if (n >= 10000000) return `${(n / 10000000).toFixed(2).replace(/\.00$/, '')} কোটি টাকা`;
  if (n >= 100000) return `${(n / 100000).toFixed(2).replace(/\.00$/, '')} লক্ষ টাকা`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')} হাজার টাকা`;
  return `${n.toLocaleString('bn-BD')} টাকা`;
};

export default function PaymentReceipt({ payment, shareholder, directors, open, onOpenChange, totalPaid, totalShare }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!payment || !shareholder) return null;

  const balancePaid = totalPaid ?? shareholder.total_paid;
  const balanceShare = totalShare ?? shareholder.total_share;
  const due = Math.max(0, balanceShare - balancePaid);

  const handlePrint = () => {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const w = window.open('', '_blank', 'width=900,height=1000');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><title>Receipt ${payment.receipt_no || payment.id.slice(0, 8)}</title>
      <meta charset="utf-8" />
      <style>
        body{font-family: 'Inter', system-ui, sans-serif; padding: 24px; color:#0a0a0a; background:#fff;}
        @page { size: A4; margin: 14mm; }
        .receipt{max-width: 760px; margin: 0 auto;}
        h1,h2,h3,p{margin:0;}
        .border-acc{border:2px solid #84cc16;}
        @media print { .no-print{display:none;} }
      </style></head><body>${html}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); }, 250);
  };

  const handleDownload = async () => {
    // Use browser print-to-PDF as the universal solution (works on all platforms, no extra deps)
    handlePrint();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/40 sticky top-0 z-10">
          <p className="text-sm font-semibold">Payment Receipt</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1.5"><Printer className="w-3.5 h-3.5" /> Print</Button>
            <Button size="sm" onClick={handleDownload} className="gap-1.5 gradient-primary text-primary-foreground"><Download className="w-3.5 h-3.5" /> Download PDF</Button>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        <div ref={printRef} className="bg-white text-neutral-900 p-6 sm:p-8">
          <div className="receipt border-2 border-[hsl(84,81%,44%)] rounded-xl p-5 sm:p-7">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4 mb-4">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">UTTARA VILAS</h1>
                <p className="text-sm text-neutral-600">উত্তরা ভিলাস — Real Estate Share Project</p>
                <p className="text-xs text-neutral-500 mt-1">B+G+13 Building • 14 Katha • 91 Shareholders</p>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-md bg-[hsl(84,100%,90%)] text-[hsl(84,80%,25%)] text-xs font-bold uppercase tracking-wider">
                  Official Receipt
                </div>
                <p className="text-xs text-neutral-600 mt-2">No: <span className="font-bold">{payment.receipt_no || `UV-${payment.id.slice(0, 8).toUpperCase()}`}</span></p>
                <p className="text-xs text-neutral-600">Date: <span className="font-bold">{new Date(payment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
              </div>
            </div>

            {/* Shareholder info */}
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <p className="text-[11px] uppercase text-neutral-500 font-semibold">Received From</p>
                <p className="text-base font-bold text-neutral-900">{shareholder.name}</p>
                <p className="text-xs text-neutral-600">📞 {shareholder.phone}</p>
                {shareholder.address && <p className="text-xs text-neutral-600">📍 {shareholder.address}</p>}
              </div>
              <div className="text-right">
                <p className="text-[11px] uppercase text-neutral-500 font-semibold">Shareholder ID</p>
                <p className="text-xs font-mono text-neutral-700 break-all">{shareholder.id.slice(0, 13)}</p>
                <p className="text-[11px] uppercase text-neutral-500 font-semibold mt-2">Number of Shares</p>
                <p className="text-base font-bold text-neutral-900">{shareholder.num_shares}</p>
              </div>
            </div>

            {/* Amount */}
            <div className="bg-[hsl(84,100%,96%)] border border-[hsl(84,81%,44%)]/40 rounded-lg p-4 mb-4">
              <div className="flex items-end justify-between flex-wrap gap-2">
                <div>
                  <p className="text-[11px] uppercase text-neutral-600 font-semibold">Amount Received</p>
                  <p className="text-3xl font-extrabold text-neutral-900">৳{Number(payment.amount).toLocaleString('en-IN')}</p>
                  <p className="text-xs italic text-neutral-700 mt-0.5">In words: {numberToWordsBn(Number(payment.amount))}</p>
                </div>
                <div className="text-right">
                  <p className="text-[11px] uppercase text-neutral-600 font-semibold">Payment Type</p>
                  <p className="text-base font-bold text-[hsl(84,80%,25%)]">{payment.type === 'booking' ? 'BOOKING' : 'REMAINING / INSTALLMENT'}</p>
                </div>
              </div>
            </div>

            {/* Account summary */}
            <table className="w-full text-sm mb-5 border-collapse">
              <tbody>
                <tr className="border-b border-neutral-200">
                  <td className="py-2 text-neutral-600">Total Share Value</td>
                  <td className="py-2 text-right font-semibold">৳{balanceShare.toLocaleString('en-IN')}</td>
                </tr>
                <tr className="border-b border-neutral-200">
                  <td className="py-2 text-neutral-600">Total Paid (incl. this payment)</td>
                  <td className="py-2 text-right font-semibold text-[hsl(142,71%,32%)]">৳{balancePaid.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td className="py-2 text-neutral-600">Outstanding Balance</td>
                  <td className="py-2 text-right font-bold text-[hsl(0,84%,45%)]">৳{due.toLocaleString('en-IN')}</td>
                </tr>
              </tbody>
            </table>

            {payment.notes && (
              <div className="text-xs text-neutral-700 mb-4 p-2 bg-neutral-50 rounded">
                <span className="font-semibold">Notes:</span> {payment.notes}
              </div>
            )}

            {/* Director signatures */}
            <div className="mt-6 pt-4 border-t border-neutral-200">
              <p className="text-[11px] uppercase text-neutral-500 font-semibold mb-3 text-center">Authorized Signatories</p>
              <div className={`grid gap-3 ${directors.length <= 3 ? 'grid-cols-3' : directors.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'}`}>
                {(directors.length === 0 ? Array.from({ length: 5 }).map((_, i) => ({ id: String(i), name: '', role: '', signature_url: '' } as any)) : directors).slice(0, 5).map(d => (
                  <div key={d.id} className="text-center">
                    <div className="h-14 border-b-2 border-neutral-400 flex items-end justify-center pb-1">
                      {d.signature_url ? (
                        <img src={d.signature_url} alt="" className="max-h-12 max-w-full object-contain" />
                      ) : null}
                    </div>
                    <p className="text-[11px] font-semibold text-neutral-800 mt-1 truncate">{d.name || '—'}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{d.role || 'Director'}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-3 border-t border-neutral-200 flex items-center justify-between flex-wrap gap-2 text-[10px] text-neutral-500">
              <p>This is a computer-generated receipt. Verify online via the shareholder portal.</p>
              <p>Generated: {new Date().toLocaleString('en-GB')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
