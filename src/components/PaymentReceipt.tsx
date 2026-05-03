import { useRef } from 'react';
import { Printer, Download, X } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Payment, Shareholder, Director } from '@/types';
import { PROJECT, BUILDING_LINE } from '@/config/project';

interface Props {
  payment: Payment | null;
  shareholder: Shareholder | null;
  directors: Director[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalPaid?: number;
  totalShare?: number;
}

const numberToWordsBn = (n: number): string => {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2).replace(/\.00$/, '')} কোটি টাকা`;
  if (n >= 100000) return `${(n / 100000).toFixed(2).replace(/\.00$/, '')} লক্ষ টাকা`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')} হাজার টাকা`;
  return `${n.toLocaleString('bn-BD')} টাকা`;
};

/** Build a fully self-contained printable HTML doc that mirrors the on-screen receipt design. */
function buildPrintableHTML(opts: {
  payment: Payment;
  shareholder: Shareholder;
  directors: Director[];
  balancePaid: number;
  balanceShare: number;
  due: number;
}) {
  const { payment, shareholder, directors, balancePaid, balanceShare, due } = opts;
  const dirs = directors.length === 0
    ? Array.from({ length: 5 }).map((_, i) => ({ id: String(i), name: '', role: '', signature_url: '' } as any))
    : directors.slice(0, 5);

  const sigCols = dirs.map(d => `
    <td style="width:${100 / dirs.length}%; text-align:center; vertical-align:bottom; padding:0 6px;">
      <div style="height:56px; border-bottom:2px solid #9ca3af; display:flex; align-items:flex-end; justify-content:center; padding-bottom:4px;">
        ${d.signature_url ? `<img src="${d.signature_url}" alt="" style="max-height:48px; max-width:100%; object-fit:contain;" />` : ''}
      </div>
      <p style="font-size:11px; font-weight:600; color:#1f2937; margin:6px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${d.name || '—'}</p>
      <p style="font-size:10px; color:#6b7280; margin:1px 0 0;">${d.role || 'Director'}</p>
    </td>`).join('');

  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<title>Receipt ${payment.receipt_no || payment.id.slice(0, 8)}</title>
<style>
  * { box-sizing: border-box; }
  html, body { margin:0; padding:0; background:#fff; color:#0a0a0a; font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; }
  @page { size: A4; margin: 12mm; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 16px; }
  .receipt { border: 2px solid #84cc16; border-radius: 12px; padding: 24px; }
  .row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap:8px; }
  .border-bottom { border-bottom: 1px solid #e5e7eb; padding-bottom: 14px; margin-bottom: 14px; }
  h1 { font-size: 24px; font-weight: 800; margin:0; letter-spacing:-0.5px; color:#111827; }
  .sub { font-size: 13px; color:#4b5563; margin: 2px 0 0; }
  .micro { font-size: 11px; color:#6b7280; margin: 4px 0 0; }
  .badge { display:inline-block; padding:4px 10px; border-radius:6px; background:#ecfccb; color:#3f6212; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:1px; }
  .label { font-size:10px; text-transform:uppercase; color:#6b7280; font-weight:600; letter-spacing:0.5px; }
  .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px; }
  .name { font-size:16px; font-weight:700; color:#111827; margin: 2px 0; }
  .meta { font-size:11px; color:#4b5563; margin:1px 0; }
  .amount-box { background:#f7fee7; border:1px solid rgba(132,204,22,0.4); border-radius:10px; padding:16px; margin-bottom:14px; }
  .amount { font-size:30px; font-weight:800; color:#111827; margin:0; }
  .words { font-style:italic; font-size:12px; color:#374151; margin:2px 0 0; }
  .ptype { font-size:14px; font-weight:700; color:#3f6212; margin:0; }
  table.summary { width:100%; border-collapse: collapse; font-size:13px; margin-bottom: 18px; }
  table.summary td { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
  table.summary tr:last-child td { border-bottom: none; }
  table.summary td:last-child { text-align:right; font-weight:600; }
  .green { color:#15803d; }
  .red { color:#b91c1c; font-weight:700; }
  .signs { width:100%; border-collapse:collapse; margin-top:8px; }
  .footer { margin-top:24px; padding-top:12px; border-top:1px solid #e5e7eb; display:flex; justify-content:space-between; flex-wrap:wrap; gap:6px; font-size:10px; color:#6b7280; }
  .notes { font-size:11px; color:#374151; padding:8px 10px; background:#f9fafb; border-radius:6px; margin-bottom:14px; }
  .center { text-align:center; }
</style>
</head>
<body>
  <div class="wrap">
    <div class="receipt">
      <div class="row border-bottom">
        <div>
          <h1>${PROJECT.name}</h1>
          <p class="sub">${PROJECT.nameBn} — ${PROJECT.tagline}</p>
          <p class="micro">${BUILDING_LINE}</p>
        </div>
        <div style="text-align:right;">
          <span class="badge">Official Receipt</span>
          <p class="micro">No: <strong>${payment.receipt_no || `UV-${payment.id.slice(0, 8).toUpperCase()}`}</strong></p>
          <p class="micro">Date: <strong>${new Date(payment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>
        </div>
      </div>

      <div class="grid2">
        <div>
          <p class="label">Received From</p>
          <p class="name">${shareholder.name}</p>
          <p class="meta">📞 ${shareholder.phone}</p>
          ${shareholder.address ? `<p class="meta">📍 ${shareholder.address}</p>` : ''}
        </div>
        <div style="text-align:right;">
          <p class="label">Shareholder ID</p>
          <p class="meta" style="font-family:monospace;">${shareholder.id.slice(0, 13)}</p>
          <p class="label" style="margin-top:8px;">Number of Shares</p>
          <p class="name">${shareholder.num_shares}</p>
        </div>
      </div>

      <div class="amount-box">
        <div class="row">
          <div>
            <p class="label">Amount Received</p>
            <p class="amount">৳${Number(payment.amount).toLocaleString('en-IN')}</p>
            <p class="words">In words: ${numberToWordsBn(Number(payment.amount))}</p>
          </div>
          <div style="text-align:right;">
            <p class="label">Payment Type</p>
            <p class="ptype">${payment.type === 'booking' ? 'BOOKING' : 'REMAINING / INSTALLMENT'}</p>
          </div>
        </div>
      </div>

      <table class="summary">
        <tr><td>Total Share Value</td><td>৳${balanceShare.toLocaleString('en-IN')}</td></tr>
        <tr><td>Total Paid (incl. this payment)</td><td class="green">৳${balancePaid.toLocaleString('en-IN')}</td></tr>
        <tr><td>Outstanding Balance</td><td class="red">৳${due.toLocaleString('en-IN')}</td></tr>
      </table>

      ${payment.notes ? `<div class="notes"><strong>Notes:</strong> ${payment.notes}</div>` : ''}

      <div style="margin-top:24px; padding-top:14px; border-top:1px solid #e5e7eb;">
        <p class="label center" style="margin-bottom:14px;">Authorized Signatories</p>
        <table class="signs"><tr>${sigCols}</tr></table>
      </div>

      <div class="footer">
        <p>${PROJECT.receiptFooter}</p>
        <p>Generated: ${new Date().toLocaleString('en-GB')}</p>
      </div>
    </div>
  </div>
</body></html>`;
}

export default function PaymentReceipt({ payment, shareholder, directors, open, onOpenChange, totalPaid, totalShare }: Props) {
  const printRef = useRef<HTMLDivElement>(null);

  if (!payment || !shareholder) return null;

  const balancePaid = totalPaid ?? shareholder.total_paid;
  const balanceShare = totalShare ?? shareholder.total_share;
  const due = Math.max(0, balanceShare - balancePaid);

  const openPrintable = (autoPrint: boolean) => {
    const html = buildPrintableHTML({ payment, shareholder, directors, balancePaid, balanceShare, due });
    const w = window.open('', '_blank', 'width=900,height=1000');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    if (autoPrint) {
      // Allow images (signatures) to load before printing
      const imgs = Array.from(w.document.images);
      const ready = Promise.all(imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = img.onerror = () => res(null); })));
      ready.then(() => setTimeout(() => w.print(), 300));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0">
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/40 sticky top-0 z-10">
          <p className="text-sm font-semibold">Payment Receipt</p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => openPrintable(true)} className="gap-1.5"><Printer className="w-3.5 h-3.5" /> Print</Button>
            <Button size="sm" onClick={() => openPrintable(true)} className="gap-1.5 gradient-primary text-primary-foreground"><Download className="w-3.5 h-3.5" /> Download PDF</Button>
            <Button size="sm" variant="ghost" onClick={() => onOpenChange(false)}><X className="w-4 h-4" /></Button>
          </div>
        </div>

        <div ref={printRef} className="bg-white text-neutral-900 p-6 sm:p-8">
          <div className="receipt border-2 border-[hsl(84,81%,44%)] rounded-xl p-5 sm:p-7">
            <div className="flex items-start justify-between border-b border-neutral-200 pb-4 mb-4 flex-wrap gap-2">
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-neutral-900">{PROJECT.name}</h1>
                <p className="text-sm text-neutral-600">{PROJECT.nameBn} — {PROJECT.tagline}</p>
                <p className="text-xs text-neutral-500 mt-1">{BUILDING_LINE}</p>
              </div>
              <div className="text-right">
                <div className="inline-block px-3 py-1 rounded-md bg-[hsl(84,100%,90%)] text-[hsl(84,80%,25%)] text-xs font-bold uppercase tracking-wider">Official Receipt</div>
                <p className="text-xs text-neutral-600 mt-2">No: <span className="font-bold">{payment.receipt_no || `UV-${payment.id.slice(0, 8).toUpperCase()}`}</span></p>
                <p className="text-xs text-neutral-600">Date: <span className="font-bold">{new Date(payment.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</span></p>
              </div>
            </div>

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

            <table className="w-full text-sm mb-5 border-collapse">
              <tbody>
                <tr className="border-b border-neutral-200"><td className="py-2 text-neutral-600">Total Share Value</td><td className="py-2 text-right font-semibold">৳{balanceShare.toLocaleString('en-IN')}</td></tr>
                <tr className="border-b border-neutral-200"><td className="py-2 text-neutral-600">Total Paid (incl. this payment)</td><td className="py-2 text-right font-semibold text-[hsl(142,71%,32%)]">৳{balancePaid.toLocaleString('en-IN')}</td></tr>
                <tr><td className="py-2 text-neutral-600">Outstanding Balance</td><td className="py-2 text-right font-bold text-[hsl(0,84%,45%)]">৳{due.toLocaleString('en-IN')}</td></tr>
              </tbody>
            </table>

            {payment.notes && <div className="text-xs text-neutral-700 mb-4 p-2 bg-neutral-50 rounded"><span className="font-semibold">Notes:</span> {payment.notes}</div>}

            <div className="mt-6 pt-4 border-t border-neutral-200">
              <p className="text-[11px] uppercase text-neutral-500 font-semibold mb-3 text-center">Authorized Signatories</p>
              <div className={`grid gap-3 ${directors.length <= 3 ? 'grid-cols-3' : directors.length === 4 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-5'}`}>
                {(directors.length === 0 ? Array.from({ length: 5 }).map((_, i) => ({ id: String(i), name: '', role: '', signature_url: '' } as any)) : directors).slice(0, 5).map(d => (
                  <div key={d.id} className="text-center">
                    <div className="h-14 border-b-2 border-neutral-400 flex items-end justify-center pb-1">
                      {d.signature_url ? <img src={d.signature_url} alt="" className="max-h-12 max-w-full object-contain" /> : null}
                    </div>
                    <p className="text-[11px] font-semibold text-neutral-800 mt-1 truncate">{d.name || '—'}</p>
                    <p className="text-[10px] text-neutral-500 truncate">{d.role || 'Director'}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-neutral-200 flex items-center justify-between flex-wrap gap-2 text-[10px] text-neutral-500">
              <p>{PROJECT.receiptFooter}</p>
              <p>Generated: {new Date().toLocaleString('en-GB')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
