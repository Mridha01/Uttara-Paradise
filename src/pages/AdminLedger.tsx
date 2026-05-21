import { useState } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { 
  FileSpreadsheet, Lock, Printer, Download, Search, 
  ArrowUpDown, ChevronDown, CheckCircle2, AlertCircle, 
  Clock, Users, Coins, TrendingUp, HelpCircle, UserCheck 
} from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PROJECT, BUILDING_LINE } from '@/config/project';
import { formatBdtBangla } from '@/types';

// Helper for numbers to Bangla text for ledger formatting
const numberToWordsBn = (n: number): string => {
  if (n >= 10000000) return `${(n / 10000000).toFixed(2).replace(/\.00$/, '')} কোটি টাকা`;
  if (n >= 100000) return `${(n / 100000).toFixed(2).replace(/\.00$/, '')} লক্ষ টাকা`;
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')} হাজার টাকা`;
  return `${n.toLocaleString('bn-BD')} টাকা`;
};

// Build printable Landscape A4 HTML
function buildPrintableLedgerHTML(opts: {
  shareholders: any[];
  directors: any[];
  totals: {
    shares: number;
    value: number;
    paid: number;
    due: number;
  };
  summaryStats: {
    totalHolders: number;
    fullyPaidCount: number;
    partialCount: number;
    bookedCount: number;
  };
}) {
  const { shareholders, directors, totals, summaryStats } = opts;

  // Prepare table rows
  const rows = shareholders.map((s, idx) => {
    const due = Math.max(0, s.total_share - s.total_paid);
    const statusText = s.status === 'fully_paid' ? 'Fully Paid' : s.status === 'partial' ? 'Partial' : 'Booked';
    const statusColor = s.status === 'fully_paid' ? '#15803d' : s.status === 'partial' ? '#1d4ed8' : '#b45309';
    
    return `
      <tr>
        <td style="text-align: center; font-weight: 600;">${idx + 1}</td>
        <td>
          <div style="font-weight: 700; color: #111827;">${s.name}</div>
          <div style="font-size: 10px; color: #4b5563; font-family: monospace;">ID: ${s.id.slice(0, 8).toUpperCase()}</div>
        </td>
        <td>📞 ${s.phone}</td>
        <td style="text-align: center; font-weight: 600;">${s.num_shares}</td>
        <td style="text-align: right; font-weight: 600;">৳${s.total_share.toLocaleString('en-IN')}</td>
        <td style="text-align: right; font-weight: 600; color: #15803d;">৳${s.total_paid.toLocaleString('en-IN')}</td>
        <td style="text-align: right; font-weight: 700; color: ${due > 0 ? '#b91c1c' : '#15803d'};">
          ৳${due.toLocaleString('en-IN')}
        </td>
        <td style="text-align: center;">
          <span style="display: inline-block; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 700; background: ${s.status === 'fully_paid' ? '#dcfce7' : s.status === 'partial' ? '#dbeafe' : '#fef3c7'}; color: ${statusColor}; text-transform: uppercase;">
            ${statusText}
          </span>
        </td>
      </tr>
    `;
  }).join('');

  // Prepare signature columns
  const sigCols = directors.map(d => `
    <td style="width: ${100 / Math.max(1, directors.length)}%; text-align: center; vertical-align: bottom; padding: 0 10px;">
      <div style="height: 50px; border-bottom: 1px solid #9ca3af; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2px;">
        ${d.signature_url ? `<img src="${d.signature_url}" alt="" style="max-height: 44px; max-width: 100%; object-fit: contain;" />` : ''}
      </div>
      <p style="font-size: 11px; font-weight: 700; color: #1f2937; margin: 4px 0 0; white-space: nowrap;">${d.name || '—'}</p>
      <p style="font-size: 10px; color: #6b7280; margin: 1px 0 0;">${d.role || 'Director'}</p>
    </td>
  `).join('');

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Shareholder Ledger - ${PROJECT.name}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; background: #fff; color: #0f172a; font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 11px; }
    @page { size: A4 landscape; margin: 10mm 12mm 10mm 12mm; }
    .wrap { width: 100%; padding: 0; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #84cc16; padding-bottom: 12px; margin-bottom: 12px; }
    h1 { font-size: 20px; font-weight: 800; margin: 0; color: #1e293b; letter-spacing: -0.5px; }
    .sub { font-size: 12px; color: #475569; margin: 2px 0 0; }
    .meta { font-size: 9px; color: #64748b; margin: 3px 0 0; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; background: #f0fdf4; color: #166534; font-size: 10px; font-weight: 700; border: 1px solid #bbf7d0; letter-spacing: 0.5px; }
    
    .stats-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 10px; margin-bottom: 16px; }
    .stats-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px; }
    .stats-label { font-size: 8px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }
    .stats-val { font-size: 14px; font-weight: 800; color: #0f172a; margin: 2px 0; }
    .stats-desc { font-size: 9px; color: #64748b; }

    table.ledger { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    table.ledger th { background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 8px; font-weight: 700; color: #334155; text-align: left; font-size: 10px; text-transform: uppercase; }
    table.ledger td { border: 1px solid #cbd5e1; padding: 6px 8px; vertical-align: middle; }
    table.ledger tr:nth-child(even) td { background: #f8fafc; }
    table.ledger tr.total-row td { background: #f1f5f9; font-weight: 800; font-size: 11px; border-top: 2px solid #475569; border-bottom: 2px solid #475569; }
    
    thead { display: table-header-group; }
    tr { page-break-inside: avoid; }
    
    .signatures-section { margin-top: 30px; page-break-inside: avoid; }
    table.signs { width: 100%; border-collapse: collapse; }
    
    .footer { margin-top: 15px; border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; justify-content: space-between; font-size: 9px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="header">
      <div>
        <h1>${PROJECT.name}</h1>
        <p class="sub">${PROJECT.nameBn} — Shareholder Financial Ledger</p>
        <p class="meta">${BUILDING_LINE} • Office: ${PROJECT.address}</p>
      </div>
      <div style="text-align: right;">
        <span class="badge">Official Ledger Sheet</span>
        <p class="meta" style="margin-top: 6px;">Report Date: <strong>${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}</strong></p>
        <p class="meta">System Time: <strong>${new Date().toLocaleTimeString('en-GB')}</strong></p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stats-card">
        <p class="stats-label">Total Shareholders</p>
        <p class="stats-val">${summaryStats.totalHolders} / ${PROJECT.totalShareholders}</p>
        <p class="stats-desc">Slots Available: ${PROJECT.totalShareholders - summaryStats.totalHolders}</p>
      </div>
      <div class="stats-card">
        <p class="stats-label">Total Shares Sold</p>
        <p class="stats-val">${totals.shares} Shares</p>
        <p class="stats-desc">Target Sales: ${PROJECT.totalSharesAvailable} Shares</p>
      </div>
      <div class="stats-card">
        <p class="stats-label">Projected Sales Value</p>
        <p class="stats-val" style="color: #0f172a;">৳${totals.value.toLocaleString('en-IN')}</p>
        <p class="stats-desc">In words: ${numberToWordsBn(totals.value)}</p>
      </div>
      <div class="stats-card" style="background: #f0fdf4; border-color: #bbf7d0;">
        <p class="stats-label" style="color: #1565c0;">Total Collected</p>
        <p class="stats-val" style="color: #166534;">৳${totals.paid.toLocaleString('en-IN')}</p>
        <p class="stats-desc" style="color: #166534; font-weight: 600;">Rate: ${((totals.paid / Math.max(1, totals.value)) * 100).toFixed(1)}%</p>
      </div>
      <div class="stats-card" style="background: #fef2f2; border-color: #fecaca;">
        <p class="stats-label" style="color: #991b1b;">Total Outstanding</p>
        <p class="stats-val" style="color: #991b1b;">৳${totals.due.toLocaleString('en-IN')}</p>
        <p class="stats-desc" style="color: #991b1b;">Pending Collection Dues</p>
      </div>
    </div>

    <table class="ledger">
      <thead>
        <tr>
          <th style="width: 4%; text-align: center;">SL</th>
          <th style="width: 20%;">Shareholder Name</th>
          <th style="width: 14%;">Phone No</th>
          <th style="width: 8%; text-align: center;">Shares</th>
          <th style="width: 16%; text-align: right;">Total Price</th>
          <th style="width: 16%; text-align: right;">Total Paid</th>
          <th style="width: 16%; text-align: right;">Outstanding Balance</th>
          <th style="width: 10%; text-align: center;">Status</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr class="total-row">
          <td colspan="3" style="text-align: right; padding-right: 15px;">TOTAL SUMMARY:</td>
          <td style="text-align: center;">${totals.shares}</td>
          <td style="text-align: right;">৳${totals.value.toLocaleString('en-IN')}</td>
          <td style="text-align: right; color: #166534;">৳${totals.paid.toLocaleString('en-IN')}</td>
          <td style="text-align: right; color: #991b1b;">৳${totals.due.toLocaleString('en-IN')}</td>
          <td style="text-align: center;">
            F: ${summaryStats.fullyPaidCount} | P: ${summaryStats.partialCount} | B: ${summaryStats.bookedCount}
          </td>
        </tr>
      </tbody>
    </table>

    <div class="signatures-section">
      <p style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #475569; text-align: center; margin-bottom: 12px; letter-spacing: 1px;">Authorized Ledger Endorsements</p>
      <table class="signs">
        <tr>
          ${sigCols}
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>System Ledger Receipt • Computer Generated Data Audit Sheet</p>
      <p>Uttara Paradise Cloud Database Synchronization Sync: OK</p>
    </div>
  </div>
</body>
</html>`;
}

type SortField = 'name' | 'num_shares' | 'total_share' | 'total_paid' | 'balance';
type SortDirection = 'asc' | 'desc';

export default function AdminLedger() {
  const { shareholders, directors, loading } = useApp();
  const { isAdmin } = useAuth();
  
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'booked' | 'partial' | 'fully_paid'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedDirectorIds, setSelectedDirectorIds] = useState<string[]>([]);

  // Route security guard
  if (!isAdmin) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-muted-foreground animate-pulse">
        <FileSpreadsheet className="w-12 h-12 text-primary mb-3 animate-spin" />
        <p className="text-sm">লোড হচ্ছে...</p>
      </div>
    );
  }

  // Calculate totals
  const totalShareholders = shareholders.length;
  const totalShares = shareholders.reduce((s, h) => s + (h.num_shares || 0), 0);
  const totalValue = shareholders.reduce((s, h) => s + (h.total_share || 0), 0);
  const totalPaid = shareholders.reduce((s, h) => s + (h.total_paid || 0), 0);
  const totalDue = Math.max(0, totalValue - totalPaid);

  const fullyPaidCount = shareholders.filter(s => s.status === 'fully_paid').length;
  const partialCount = shareholders.filter(s => s.status === 'partial').length;
  const bookedCount = shareholders.filter(s => s.status === 'booked').length;

  // Sorting handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Filter & Search Shareholders
  const filtered = shareholders.filter(s => {
    const matchesSearch = 
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search) ||
      s.id.toLowerCase().includes(search.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort shareholders
  const sorted = [...filtered].sort((a, b) => {
    let aVal: any = a[sortField as keyof typeof a];
    let bVal: any = b[sortField as keyof typeof b];

    // Handle custom outstanding balance sort
    if (sortField === 'balance') {
      aVal = Math.max(0, a.total_share - a.total_paid);
      bVal = Math.max(0, b.total_share - b.total_paid);
    }

    if (typeof aVal === 'string') {
      aVal = aVal.toLowerCase();
      bVal = bVal.toLowerCase();
    }

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  // Print/PDF Handler
  const handlePrint = () => {
    const selectedDirectors = directors.filter(d => selectedDirectorIds.includes(d.id));
    const totals = {
      shares: totalShares,
      value: totalValue,
      paid: totalPaid,
      due: totalDue
    };
    const summaryStats = {
      totalHolders: totalShareholders,
      fullyPaidCount,
      partialCount,
      bookedCount
    };

    // Sort active view data for print matching
    const printFriendlyShareholders = [...sorted];

    const html = buildPrintableLedgerHTML({
      shareholders: printFriendlyShareholders,
      directors: selectedDirectors,
      totals,
      summaryStats
    });

    const w = window.open('', '_blank', 'width=1100,height=800');
    if (!w) {
      toast.error('팝업 차단기를 비활성화해주세요! Click allow to open the printable ledger.');
      return;
    }
    
    w.document.write(html);
    w.document.close();
    w.focus();

    // Allow image loading (signatures)
    const imgs = Array.from(w.document.images);
    const ready = Promise.all(
      imgs.map(img => img.complete ? Promise.resolve() : new Promise(res => { img.onload = img.onerror = () => res(null); }))
    );
    
    ready.then(() => {
      setTimeout(() => {
        w.print();
        setDialogOpen(false);
      }, 500);
    });
  };

  const handleOpenPrintDialog = () => {
    if (directors.length > 0 && selectedDirectorIds.length === 0) {
      // Auto pre-select top directors (up to 3)
      setSelectedDirectorIds(directors.slice(0, 3).map(d => d.id));
    }
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-primary" /> Shareholder Financial Ledger
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            প্রজেক্টের সকল শেয়ারহোল্ডারদের ফিন্যান্সিয়াল স্টেটমেন্ট ও ব্যালেন্স শিট
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button 
            onClick={handleOpenPrintDialog} 
            className="gradient-primary text-primary-foreground gap-2 shadow-sm font-medium"
          >
            <Printer className="w-4 h-4" /> Print Ledger / PDF
          </Button>
          <DialogContent className="max-w-2xl bg-card border border-border">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-foreground">
                Print Ledger Configuration
              </DialogTitle>
              <CardDescription>
                লেজার রিপোর্টের নিচে কার স্বাক্ষর প্রিন্ট করতে চান তা সিলেক্ট করুন (সর্বোচ্চ ৫ জন ডিরেক্টর)
              </CardDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Select Signatures</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {directors.map(d => (
                  <label 
                    key={d.id} 
                    className="flex items-center gap-3 bg-muted/40 p-3 rounded-lg border border-border cursor-pointer hover:bg-muted/80 transition-colors"
                  >
                    <input 
                      type="checkbox" 
                      checked={selectedDirectorIds.includes(d.id)} 
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedDirectorIds.length < 5) {
                            setSelectedDirectorIds([...selectedDirectorIds, d.id]);
                          } else {
                            toast.warning('সর্বোচ্চ ৫ টি স্বাক্ষর নির্বাচন করা সম্ভব');
                          }
                        } else {
                          setSelectedDirectorIds(selectedDirectorIds.filter(id => id !== d.id));
                        }
                      }} 
                      className="rounded border-input accent-primary w-4 h-4 cursor-pointer"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{d.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{d.role}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handlePrint} className="gradient-primary text-primary-foreground gap-2">
                <Printer className="w-4 h-4" /> Generate Printable Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-card border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Shareholders</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{totalShareholders} / {PROJECT.totalShareholders}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Avail: {PROJECT.totalShareholders - totalShareholders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Shares Sold</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{totalShares} Shares</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Target: {PROJECT.totalSharesAvailable} Shares</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-border/60 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider">Total Sales Target</p>
              <p className="text-lg font-bold text-foreground mt-0.5">{formatBdtBangla(totalValue)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">৳{totalValue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-emerald-500/20 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-emerald-600 tracking-wider">Total Collected</p>
              <p className="text-lg font-bold text-emerald-700 mt-0.5">{formatBdtBangla(totalPaid)}</p>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">
                Ratio: {((totalPaid / Math.max(1, totalValue)) * 100).toFixed(1)}%
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card border-rose-500/20 bg-rose-500/5">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5 text-rose-500" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-rose-600 tracking-wider">Outstanding Dues</p>
              <p className="text-lg font-bold text-rose-700 mt-0.5">{formatBdtBangla(totalDue)}</p>
              <p className="text-[10px] text-rose-600 mt-0.5">৳{totalDue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls Container */}
      <div className="bg-card border border-border/80 rounded-xl p-4 shadow-sm flex flex-col md:flex-row items-center gap-3 justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-xs shrink-0">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search by name, phone, or ID..." 
            className="pl-9"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex border border-border rounded-lg p-0.5 bg-muted/30 overflow-x-auto w-full md:w-auto shrink-0 justify-between">
          <button 
            onClick={() => setStatusFilter('all')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${statusFilter === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            All ({totalShareholders})
          </button>
          <button 
            onClick={() => setStatusFilter('fully_paid')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${statusFilter === 'fully_paid' ? 'bg-emerald-500/10 text-emerald-700 shadow-sm border border-emerald-500/20' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Fully Paid ({fullyPaidCount})
          </button>
          <button 
            onClick={() => setStatusFilter('partial')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${statusFilter === 'partial' ? 'bg-blue-500/10 text-blue-700 shadow-sm border border-blue-500/20' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Partial ({partialCount})
          </button>
          <button 
            onClick={() => setStatusFilter('booked')} 
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${statusFilter === 'booked' ? 'bg-amber-500/10 text-amber-700 shadow-sm border border-amber-500/20' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Booked ({bookedCount})
          </button>
        </div>

        {/* Quick Summary Counts Badge */}
        <div className="hidden lg:flex items-center gap-1.5">
          <Badge variant="outline" className="text-[10px] bg-background">Shares: {totalShares}</Badge>
          <Badge variant="outline" className="text-[10px] bg-background">Collected: {((totalPaid / Math.max(1, totalValue)) * 100).toFixed(0)}%</Badge>
        </div>
      </div>

      {/* Ledger Table */}
      <Card className="shadow-card border border-border/80">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-sm border-collapse text-left">
            <thead>
              <tr className="border-b border-border bg-muted/20 text-muted-foreground font-medium text-xs">
                <th className="p-4 w-[6%] text-center">SL</th>
                <th className="p-4 w-[24%] cursor-pointer select-none hover:bg-muted/40 transition-colors" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">Shareholder Name <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 w-[16%]">Phone</th>
                <th className="p-4 w-[10%] text-center cursor-pointer select-none hover:bg-muted/40 transition-colors" onClick={() => handleSort('num_shares')}>
                  <div className="flex items-center gap-1 justify-center">Shares <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 w-[15%] text-right cursor-pointer select-none hover:bg-muted/40 transition-colors" onClick={() => handleSort('total_share')}>
                  <div className="flex items-center gap-1 justify-end">Total Price <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 w-[15%] text-right cursor-pointer select-none hover:bg-muted/40 transition-colors" onClick={() => handleSort('total_paid')}>
                  <div className="flex items-center gap-1 justify-end">Total Paid <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 w-[15%] text-right cursor-pointer select-none hover:bg-muted/40 transition-colors" onClick={() => handleSort('balance')}>
                  <div className="flex items-center gap-1 justify-end">Outstanding <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="p-4 w-[10%] text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sorted.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-muted-foreground">
                    <FileSpreadsheet className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
                    কোনো শেয়ারহোল্ডার ডেটা পাওয়া যায়নি
                  </td>
                </tr>
              ) : (
                sorted.map((s, idx) => {
                  const due = Math.max(0, s.total_share - s.total_paid);
                  
                  return (
                    <tr 
                      key={s.id} 
                      className="hover:bg-muted/30 transition-colors align-middle"
                    >
                      <td className="p-4 text-center font-medium text-muted-foreground">{idx + 1}</td>
                      <td className="p-4">
                        <Link 
                          to={`/shareholders/${s.id}`} 
                          className="font-bold text-foreground hover:text-primary transition-colors block"
                        >
                          {s.name}
                        </Link>
                        <span className="text-[10px] text-muted-foreground font-mono block mt-0.5 select-all">
                          ID: {s.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground font-medium text-xs">
                        📞 {s.phone}
                      </td>
                      <td className="p-4 text-center font-bold text-foreground">
                        {s.num_shares}
                      </td>
                      <td className="p-4 text-right font-semibold text-foreground">
                        ৳{s.total_share.toLocaleString()}
                      </td>
                      <td className="p-4 text-right font-semibold text-emerald-600 dark:text-emerald-500">
                        ৳{s.total_paid.toLocaleString()}
                      </td>
                      <td className={`p-4 text-right font-bold ${due > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-500'}`}>
                        ৳{due.toLocaleString()}
                      </td>
                      <td className="p-4 text-center">
                        <Badge 
                          className={`text-[9px] font-bold tracking-wider uppercase px-2 py-0.5 rounded ${
                            s.status === 'fully_paid' 
                              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' 
                              : s.status === 'partial' 
                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20' 
                                : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {s.status === 'fully_paid' ? 'Fully Paid' : s.status === 'partial' ? 'Partial' : 'Booked'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
              
              {/* Aggregation Row */}
              {sorted.length > 0 && (
                <tr className="bg-muted/10 font-bold border-t-2 border-border/80">
                  <td colSpan={3} className="p-4 text-right text-muted-foreground uppercase text-xs tracking-wider">Filtered Totals:</td>
                  <td className="p-4 text-center font-extrabold">
                    {sorted.reduce((s, h) => s + (h.num_shares || 0), 0)}
                  </td>
                  <td className="p-4 text-right text-foreground">
                    ৳{sorted.reduce((s, h) => s + (h.total_share || 0), 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-right text-emerald-600 dark:text-emerald-500">
                    ৳{sorted.reduce((s, h) => s + (h.total_paid || 0), 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-right text-rose-600 dark:text-rose-400">
                    ৳{sorted.reduce((s, h) => s + Math.max(0, h.total_share - h.total_paid), 0).toLocaleString()}
                  </td>
                  <td className="p-4 text-center text-xs text-muted-foreground">
                    Count: {sorted.length}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Helper documentation banner */}
      <div className="flex gap-3 bg-muted/30 p-4 rounded-xl border border-border/50 text-xs text-muted-foreground flex-col sm:flex-row items-start sm:items-center">
        <HelpCircle className="w-4 h-4 text-primary shrink-0" />
        <div>
          <span className="font-semibold text-foreground">ব্যবহার নির্দেশিকা:</span> যেকোনো কলামের ডান পাশে ক্লিক করে আপনি সেই কলাম অনুসারে ঊর্ধ্বমুখী (ascending) বা নিম্নমুখী (descending) সাজাতে পারেন। "Print Ledger" বাটনে ক্লিক করে পুরো লেজারের বিবরণ একটি A4 Landscape PDF ফরম্যাটে প্রিন্ট বা সংরক্ষণ করা যাবে।
        </div>
      </div>
    </div>
  );
}
