import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { Download, Users, Award } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { TOTAL_SHARE_AMOUNT, formatBdtBangla } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

export default function DirectorSales() {
  const { directors, shareholders, loading } = useApp();
  const { isAdmin } = useAuth();

  const stats = useMemo(() => {
    const map = new Map<string, { director: typeof directors[0] | null; shareholders: typeof shareholders; totalShares: number; totalValue: number; totalCollected: number }>();
    directors.forEach(d => map.set(d.id, { director: d, shareholders: [], totalShares: 0, totalValue: 0, totalCollected: 0 }));
    map.set('__none__', { director: null, shareholders: [], totalShares: 0, totalValue: 0, totalCollected: 0 });
    shareholders.forEach(s => {
      const key = s.referred_by_director_id || '__none__';
      const entry = map.get(key) || map.get('__none__')!;
      entry.shareholders.push(s);
      entry.totalShares += s.num_shares;
      entry.totalValue += s.total_share;
      entry.totalCollected += s.total_paid;
    });
    return Array.from(map.values()).filter(e => e.shareholders.length > 0 || e.director);
  }, [directors, shareholders]);

  const totalSharesSold = shareholders.reduce((s, sh) => s + sh.num_shares, 0);
  const totalAssigned = shareholders.filter(s => s.referred_by_director_id).reduce((s, sh) => s + sh.num_shares, 0);
  const TARGET_TOTAL = 73;

  const downloadCSV = () => {
    const rows: string[] = ['Director Name,Director Role,Director Phone,Shareholder Name,Shareholder Phone,Number of Shares,Total Value (BDT),Paid (BDT),Due (BDT),Booking Date,Status'];
    stats.forEach(entry => {
      const dName = entry.director?.name || 'Unassigned';
      const dRole = entry.director?.role || '';
      const dPhone = entry.director?.phone || '';
      if (entry.shareholders.length === 0) {
        rows.push(`"${dName}","${dRole}","${dPhone}","","",0,0,0,0,"",""`);
      } else {
        entry.shareholders.forEach(s => {
          const due = s.total_share - s.total_paid;
          rows.push(`"${dName}","${dRole}","${dPhone}","${s.name.replace(/"/g, '""')}","${s.phone}",${s.num_shares},${s.total_share},${s.total_paid},${due},"${s.booking_date}","${s.status}"`);
        });
      }
    });
    rows.push('');
    rows.push(`SUMMARY,,,,,,,,,,`);
    rows.push(`Total Shares Sold,${totalSharesSold} of ${TARGET_TOTAL},,,,,,,,,`);
    rows.push(`Total Value,${formatBdtBangla(totalSharesSold * TOTAL_SHARE_AMOUNT)},,,,,,,,,`);
    const csv = rows.join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `director-sales-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) return <Navigate to="/login" replace />;
  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">📊 Director Sales Tracker</h1>
          <p className="text-sm text-muted-foreground">কোন ডিরেক্টর কতগুলি শেয়ার বিক্রি করেছেন</p>
        </div>
        <Button onClick={downloadCSV} className="gradient-primary text-primary-foreground gap-2">
          <Download className="w-4 h-4" /> Download CSV
        </Button>
      </div>

      {/* Top summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="shadow-card border-primary/40">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">ডিরেক্টরদের মাধ্যমে বিক্রিত</p>
            <p className="text-2xl font-bold text-primary">{totalAssigned} / {TARGET_TOTAL}</p>
            <p className="text-xs text-muted-foreground">শেয়ার (লক্ষ্য: {TARGET_TOTAL})</p>
            <Progress value={(totalAssigned / TARGET_TOTAL) * 100} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">এখনো বাকি</p>
            <p className="text-2xl font-bold text-warning">{Math.max(0, TARGET_TOTAL - totalAssigned)}</p>
            <p className="text-xs text-muted-foreground">শেয়ার বিক্রির বাকি</p>
          </CardContent>
        </Card>
        <Card className="shadow-card">
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">বিক্রিত মূল্য</p>
            <p className="text-2xl font-bold text-success">{formatBdtBangla(totalAssigned * TOTAL_SHARE_AMOUNT)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-director cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((entry) => {
          const d = entry.director;
          const key = d?.id || 'unassigned';
          return (
            <Card key={key} className="shadow-card hover:shadow-elevated transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-3">
                  {d?.image_url ? (
                    <img src={d.image_url} alt={d.name} className="w-12 h-12 rounded-full object-cover border-2 border-primary/20" />
                  ) : (
                    <div className="w-12 h-12 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold">
                      {d?.name.charAt(0) || '?'}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-card-foreground truncate">{d?.name || 'Unassigned'}</p>
                    <p className="text-xs text-muted-foreground font-normal">{d?.role || 'No director assigned'}</p>
                  </div>
                  <Badge className="bg-primary/10 text-primary hover:bg-primary/20 gap-1">
                    <Award className="w-3 h-3" />{entry.totalShares}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Shareholders</p>
                    <p className="text-base font-bold text-card-foreground flex items-center justify-center gap-1"><Users className="w-3 h-3" />{entry.shareholders.length}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Value</p>
                    <p className="text-xs font-bold text-primary">{formatBdtBangla(entry.totalValue)}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-muted/50">
                    <p className="text-[10px] text-muted-foreground">Collected</p>
                    <p className="text-xs font-bold text-success">{formatBdtBangla(entry.totalCollected)}</p>
                  </div>
                </div>
                {entry.shareholders.length > 0 && (
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {entry.shareholders.map(s => (
                      <div key={s.id} className="flex items-center justify-between p-2 rounded-md bg-muted/30 text-xs">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {s.profile_image_url ? (
                            <img src={s.profile_image_url} alt={s.name} className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary flex-shrink-0">{s.name.charAt(0)}</div>
                          )}
                          <span className="truncate text-card-foreground">{s.name}</span>
                        </div>
                        <Badge variant="outline" className="text-[10px] flex-shrink-0">{s.num_shares} share{s.num_shares > 1 ? 's' : ''}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
