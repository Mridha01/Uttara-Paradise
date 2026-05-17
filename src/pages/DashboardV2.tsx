import { Users, CreditCard, CheckCircle2, TrendingUp, UserMinus, Banknote, FileText, UserCheck, Calendar, Home, ArrowUpRight, Activity, Receipt } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { TARGET_SHAREHOLDERS, TOTAL_LAND_COST, formatBdtBangla } from '@/types';
import { PROJECT } from '@/config/project';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function DashboardV2() {
  const { shareholders, expenses, activities, installments, rentalCollections, settings, loading } = useApp();

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-emerald-500 animate-spin-reverse"></div>
      </div>
    </div>
  );

  const target = Number(settings.target_shareholders) || TARGET_SHAREHOLDERS;
  const landCost = Number(settings.land_price_total) || TOTAL_LAND_COST;

  const totalShareholders = shareholders.length;
  const totalShares = shareholders.reduce((s, sh) => s + sh.num_shares, 0);
  const bookedMembers = shareholders.filter(s => s.status === 'booked').length;
  const fullyPaid = shareholders.filter(s => s.status === 'fully_paid').length;
  const totalCollected = shareholders.reduce((sum, s) => sum + s.total_paid, 0);
  const totalExpected = shareholders.reduce((sum, s) => sum + s.total_share, 0);
  const remaining = totalExpected - totalCollected;
  const remainingSlots = target - totalShares;
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInstallments = installments.reduce((s, i) => s + i.amount, 0);
  const landRemaining = landCost - totalCollected;

  const overallProgress = Math.min(100, Math.round((totalCollected / (totalExpected || 1)) * 100));

  const stats = [
    { label: 'Total Shareholders', value: totalShareholders, target: `/ ${target}`, icon: Users, gradient: 'from-blue-500/20 to-cyan-500/20', iconColor: 'text-cyan-500', border: 'border-cyan-500/20' },
    { label: 'Total Shares Sold', value: totalShares, target: `/ ${target}`, icon: CreditCard, gradient: 'from-amber-500/20 to-orange-500/20', iconColor: 'text-orange-500', border: 'border-orange-500/20' },
    { label: 'Fully Paid Members', value: fullyPaid, icon: CheckCircle2, gradient: 'from-emerald-500/20 to-green-500/20', iconColor: 'text-emerald-500', border: 'border-emerald-500/20' },
    { label: 'Total Collected', value: formatBdtBangla(totalCollected), icon: TrendingUp, gradient: 'from-violet-500/20 to-purple-500/20', iconColor: 'text-purple-500', border: 'border-purple-500/20' },
    { label: 'Remaining Due', value: formatBdtBangla(remaining), icon: Banknote, gradient: 'from-rose-500/20 to-red-500/20', iconColor: 'text-rose-500', border: 'border-rose-500/20' },
    { label: 'Slots Available', value: remainingSlots, icon: UserMinus, gradient: 'from-slate-500/20 to-gray-500/20', iconColor: 'text-slate-400', border: 'border-slate-500/20' },
  ];

  const chartData = [
    { name: 'Booked', value: bookedMembers },
    { name: 'Partial', value: shareholders.filter(s => s.status === 'partial').length },
    { name: 'Fully Paid', value: fullyPaid },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* Hero Header Section */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-8 lg:p-10 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/30 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Activity className="w-3 h-3" /> Live Overview
            </div>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight mb-2 drop-shadow-md">
              {PROJECT.name}
            </h1>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest mb-3">A project by Prottasa Holdings</p>
            <p className="text-slate-300 text-lg max-w-xl leading-relaxed">
              Modern Real Estate Share Management System. <span className="text-white font-semibold">{totalShares} of {target}</span> shares secured.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6 min-w-[280px] shadow-xl hover:scale-105 transition-transform duration-300">
            <p className="text-slate-300 text-sm font-medium mb-1">Total Fund Collected</p>
            <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 drop-shadow-sm mb-4">
              {formatBdtBangla(totalCollected)}
            </p>
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-medium text-slate-300">
                <span>Collection Target</span>
                <span>{overallProgress}%</span>
              </div>
              <div className="h-2 w-full bg-slate-700/50 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 relative"
                  style={{ width: `${overallProgress}%` }}
                >
                  <div className="absolute top-0 right-0 bottom-0 left-0 bg-[url('https://www.transparenttextures.com/patterns/diagonal-stripes.png')] opacity-20 animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`group relative overflow-hidden rounded-2xl border ${stat.border} bg-card/40 backdrop-blur-md p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-40 group-hover:opacity-60 transition-opacity`}></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-background/50 backdrop-blur-sm border border-white/5 ${stat.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground tracking-tight mb-1">
                {stat.value}
                {stat.target && <span className="text-base font-normal text-muted-foreground ml-1">{stat.target}</span>}
              </p>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts & Activity Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-lg p-6 group hover:border-primary/30 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold">Payment Journey</h3>
            <div className="text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1 rounded-full">Shareholder Status</div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area type="monotone" dataKey="value" stroke="hsl(142, 71%, 45%)" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-md shadow-lg p-0 flex flex-col h-full max-h-[400px]">
          <div className="p-6 pb-4 border-b border-border/50 bg-background/30 backdrop-blur-sm sticky top-0 z-10">
            <h3 className="text-lg font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-primary" /> Live Updates</h3>
          </div>
          <div className="p-6 pt-2 overflow-y-auto flex-1 space-y-4 custom-scrollbar">
            {activities.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-10">No recent activities</p>
            ) : (
              activities.slice(0, 10).map((a, i) => (
                <div key={a.id} className="relative pl-6 pb-4 border-l border-border/50 last:border-0 group/item">
                  <div className={`absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-background transition-transform group-hover/item:scale-150 ${a.type === 'payment' ? 'bg-emerald-500' :
                      a.type === 'expense' ? 'bg-rose-500' :
                        a.type === 'installment' ? 'bg-cyan-500' : 'bg-primary'
                    }`} />
                  <div className="bg-muted/30 p-3 rounded-xl border border-border/50 group-hover/item:bg-muted/50 transition-colors">
                    <p className="text-sm font-medium text-foreground leading-snug">{a.message}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 font-medium">{new Date(a.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Financial Summaries */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-blue-500/5 backdrop-blur-md shadow-lg p-6 group hover:shadow-cyan-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-cyan-500" />
                <h3 className="font-semibold text-foreground">Installment Funds</h3>
              </div>
              <p className="text-3xl font-bold text-cyan-600 dark:text-cyan-400 tracking-tight mt-3">{formatBdtBangla(totalInstallments)}</p>
            </div>
            <Link to="/installments">
              <Button variant="ghost" size="icon" className="rounded-full bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 hover:text-cyan-600 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 backdrop-blur-md shadow-lg p-6 group hover:shadow-emerald-500/10 transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Home className="w-5 h-5 text-emerald-500" />
                <h3 className="font-semibold text-foreground">Rental Income</h3>
              </div>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 tracking-tight mt-3">
                {formatBdtBangla(rentalCollections.reduce((s, r) => s + Number(r.amount), 0))}
              </p>
              <p className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/70 mt-1">{rentalCollections.length} Months Collected</p>
            </div>
            <Link to="/rental">
              <Button variant="ghost" size="icon" className="rounded-full bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 hover:text-emerald-600 transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Land tracking & Net Overview */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border border-border bg-card/40 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">🏞️</span> Land Cost Tracking
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/40 rounded-xl p-4 text-center border border-border/50">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Cost</p>
                <p className="text-lg font-bold">{formatBdtBangla(landCost)}</p>
              </div>
              <div className="bg-emerald-500/10 rounded-xl p-4 text-center border border-emerald-500/20">
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Paid</p>
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{formatBdtBangla(totalCollected)}</p>
              </div>
              <div className="bg-rose-500/10 rounded-xl p-4 text-center border border-rose-500/20">
                <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider mb-1">Due</p>
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{formatBdtBangla(Math.max(0, landRemaining))}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Progress value={(totalCollected / landCost) * 100} className="h-3 rounded-full bg-muted" />
              <p className="text-right text-xs font-bold text-muted-foreground">{Math.round((totalCollected / landCost) * 100)}% Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border bg-card/40 backdrop-blur-md shadow-lg rounded-2xl overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/50 pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="text-xl">⚖️</span> Net Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 flex flex-col justify-center h-[calc(100%-65px)]">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/5 border border-rose-500/10">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-rose-500/20 rounded-lg text-rose-500"><Receipt className="w-5 h-5" /></div>
                  <span className="font-semibold text-muted-foreground">Total Expenses</span>
                </div>
                <span className="text-xl font-bold text-foreground">{formatBdtBangla(totalExpenses)}</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500"><TrendingUp className="w-5 h-5" /></div>
                  <span className="font-bold text-foreground">Net Available Fund</span>
                </div>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatBdtBangla(totalCollected - totalExpenses)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4 pt-4">
        <Link to="/project">
          <Button className="rounded-full px-6 bg-foreground text-background hover:bg-foreground/90 gap-2 font-semibold shadow-md">
            <FileText className="w-4 h-4" /> Project Documents
          </Button>
        </Link>
        <Link to="/directors">
          <Button variant="outline" className="rounded-full px-6 gap-2 font-semibold border-border bg-card/50 backdrop-blur-sm hover:bg-muted shadow-sm">
            <UserCheck className="w-4 h-4" /> Board of Directors
          </Button>
        </Link>
      </div>
    </div>
  );
}
