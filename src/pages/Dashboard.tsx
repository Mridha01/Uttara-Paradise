import { Users, CreditCard, CheckCircle2, TrendingUp, UserMinus, Banknote, FileText, UserCheck, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { TARGET_SHAREHOLDERS, TOTAL_SHARE_AMOUNT, TOTAL_LAND_COST } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export default function Dashboard() {
  const { shareholders, expenses, activities, installments, loading } = useApp();

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  const totalShareholders = shareholders.length;
  const totalShares = shareholders.reduce((s, sh) => s + sh.num_shares, 0);
  const bookedMembers = shareholders.filter(s => s.status === 'booked').length;
  const fullyPaid = shareholders.filter(s => s.status === 'fully_paid').length;
  const totalCollected = shareholders.reduce((sum, s) => sum + s.total_paid, 0);
  const totalExpected = shareholders.reduce((sum, s) => sum + s.total_share, 0);
  const remaining = totalExpected - totalCollected;
  const remainingSlots = TARGET_SHAREHOLDERS - totalShares;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInstallments = installments.reduce((s, i) => s + i.amount, 0);
  const landRemaining = TOTAL_LAND_COST - totalCollected;

  const stats = [
    { label: 'Total Shareholders', value: totalShareholders, target: `/ ${TARGET_SHAREHOLDERS}`, icon: Users, color: 'text-primary' },
    { label: 'Total Shares Sold', value: totalShares, target: `/ ${TARGET_SHAREHOLDERS}`, icon: CreditCard, color: 'text-warning' },
    { label: 'Fully Paid', value: fullyPaid, icon: CheckCircle2, color: 'text-success' },
    { label: 'Collected', value: `৳${(totalCollected / 100000).toFixed(1)}L`, icon: TrendingUp, color: 'text-primary' },
    { label: 'Remaining', value: `৳${(remaining / 100000).toFixed(1)}L`, icon: Banknote, color: 'text-destructive' },
    { label: 'Slots Left', value: remainingSlots, icon: UserMinus, color: 'text-muted-foreground' },
  ];

  const chartData = [
    { name: 'Fully Paid', value: fullyPaid, fill: 'hsl(142, 71%, 45%)' },
    { name: 'Partial', value: shareholders.filter(s => s.status === 'partial').length, fill: 'hsl(38, 92%, 50%)' },
    { name: 'Booked Only', value: bookedMembers, fill: 'hsl(210, 100%, 52%)' },
  ];

  return (
    <div className="space-y-6">
      <div className="gradient-primary rounded-xl p-5 text-primary-foreground">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-xl font-bold">🏗️ Uttara Vilas</h2>
            <p className="text-primary-foreground/80 text-sm mt-1">{totalShares} of {TARGET_SHAREHOLDERS} shares sold • ৳{totalCollected.toLocaleString()} collected</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/70">Overall Progress</p>
            <p className="text-2xl font-bold">{Math.round((totalCollected / (totalExpected || 1)) * 100)}%</p>
          </div>
        </div>
        <Progress value={(totalCollected / (totalExpected || 1)) * 100} className="mt-4 h-2 bg-primary-foreground/20" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
        {stats.map((stat, i) => (
          <Card key={i} className="shadow-card animate-fade-in" style={{ animationDelay: `${i * 80}ms` }}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between"><stat.icon className={`w-8 h-8 ${stat.color} opacity-80`} /></div>
              <p className="mt-3 text-2xl font-bold text-card-foreground">{stat.value}{stat.target && <span className="text-sm font-normal text-muted-foreground"> {stat.target}</span>}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Payment Status Overview</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} barSize={48}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} /><YAxis allowDecimals={false} tick={{ fontSize: 12 }} /><Tooltip />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>{chartData.map((entry, index) => (<Cell key={index} fill={entry.fill} />))}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[220px] overflow-y-auto">
              {activities.slice(0, 8).map((a, i) => (
                <div key={a.id} className="flex items-start gap-3 animate-slide-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${a.type === 'payment' ? 'bg-success' : a.type === 'expense' ? 'bg-warning' : a.type === 'installment' ? 'bg-info' : 'bg-primary'}`} />
                  <div className="flex-1 min-w-0"><p className="text-sm text-card-foreground">{a.message}</p><p className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString()}</p></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Installment Summary */}
      <Card className="shadow-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">📅 Total Installment Collected</p>
            <p className="text-xl font-bold text-primary">৳{totalInstallments.toLocaleString()}</p>
          </div>
          <Link to="/installments"><Button variant="outline" size="sm" className="gap-2"><Calendar className="w-4 h-4" /> View Details</Button></Link>
        </CardContent>
      </Card>

      {/* Land Cost Tracking */}
      <Card className="shadow-card">
        <CardHeader className="pb-2"><CardTitle className="text-base">🏞️ জমির মূল্য পরিশোধ</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">মোট মূল্য</p><p className="text-lg font-bold text-card-foreground">৳{(TOTAL_LAND_COST / 100000).toFixed(1)}L</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">সংগৃহীত</p><p className="text-lg font-bold text-success">৳{(totalCollected / 100000).toFixed(1)}L</p></div>
            <div className="p-3 rounded-lg bg-muted"><p className="text-xs text-muted-foreground">বাকি</p><p className="text-lg font-bold text-destructive">৳{(Math.max(0, landRemaining) / 100000).toFixed(1)}L</p></div>
          </div>
          <Progress value={(totalCollected / TOTAL_LAND_COST) * 100} className="h-2" />
          <p className="text-xs text-muted-foreground text-center">{Math.round((totalCollected / TOTAL_LAND_COST) * 100)}% পরিশোধিত</p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-4 flex items-center justify-between">
          <div><p className="text-sm text-muted-foreground">Total Expenses</p><p className="text-xl font-bold text-card-foreground">৳{totalExpenses.toLocaleString()}</p></div>
          <div><p className="text-sm text-muted-foreground">Net Collected</p><p className="text-xl font-bold text-success">৳{(totalCollected - totalExpenses).toLocaleString()}</p></div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-3">
        <Link to="/project"><Button variant="outline" className="gap-2"><FileText className="w-4 h-4" /> Project Details</Button></Link>
        <Link to="/directors"><Button variant="outline" className="gap-2"><UserCheck className="w-4 h-4" /> Directors</Button></Link>
        <Link to="/installments"><Button variant="outline" className="gap-2"><Calendar className="w-4 h-4" /> Installments</Button></Link>
      </div>
    </div>
  );
}
