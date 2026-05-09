import { useEffect, useMemo } from 'react';
import { Bell, CheckCheck, AlertTriangle, Send, Calendar, CreditCard, Package, User, Wallet, CheckCircle2, ShieldAlert, Sparkles } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { INSTALLMENT_AMOUNT } from '@/types';

const BN_MONTHS = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

export default function Notifications() {
  const { notifications, shareholders, installments, settings, markNotificationRead, markAllNotificationsRead, refresh, loading } = useApp();
  const { isAdmin } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();
  const monthlyAmount = Number(settings.installment_amount) || INSTALLMENT_AMOUNT;
  const dueDay = 10; // 1-10 of the month

  // Compute who has NOT paid this month
  const unpaidShareholders = useMemo(() => {
    return shareholders.filter(sh => {
      const paid = installments.some(i => i.shareholder_id === sh.id && i.month === currentMonth && i.year === currentYear);
      return !paid;
    });
  }, [shareholders, installments, currentMonth, currentYear]);

  const overdue = now.getDate() > dueDay;
  const reminderTag = `[REMINDER ${currentYear}-${currentMonth}]`;

  // Auto-generate reminder notifications when overdue (once per month per shareholder)
  useEffect(() => {
    if (!overdue || loading) return;
    if (shareholders.length === 0) return;

    const existingReminderMessages = new Set(
      notifications
        .filter(n => n.type === 'installment' && n.message.includes(reminderTag))
        .map(n => n.message)
    );

    const toCreate = unpaidShareholders
      .map(sh => `${reminderTag} ${sh.name} এই মাসের ইনস্টলমেন্ট (৳${monthlyAmount.toLocaleString()}) এখনো দেননি`)
      .filter(msg => !existingReminderMessages.has(msg));

    if (toCreate.length === 0) return;

    (async () => {
      const rows = toCreate.map(message => ({ message, type: 'installment', read: false }));
      await supabase.from('notifications').insert(rows as any);
      await refresh();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overdue, shareholders.length, unpaidShareholders.length, loading]);

  const handleManualReminder = async () => {
    if (unpaidShareholders.length === 0) {
      toast.info('এই মাসে সবাই পরিশোধ করেছেন!');
      return;
    }
    const rows = unpaidShareholders.map(sh => ({
      message: `${reminderTag} ${sh.name} এই মাসের ইনস্টলমেন্ট (৳${monthlyAmount.toLocaleString()}) এখনো দেননি`,
      type: 'installment',
      read: false,
    }));
    await supabase.from('notifications').insert(rows as any);
    await refresh();
    toast.success(`${rows.length} জনের রিমাইন্ডার তৈরি হয়েছে`);
  };

  const typeIcon = (type: string) => {
    switch (type) {
      case 'payment': return <Wallet className="w-5 h-5 text-emerald-500" />;
      case 'shareholder': return <User className="w-5 h-5 text-blue-500" />;
      case 'booking': return <CreditCard className="w-5 h-5 text-cyan-500" />;
      case 'expense': return <Package className="w-5 h-5 text-rose-500" />;
      case 'installment': return <Calendar className="w-5 h-5 text-indigo-500" />;
      default: return <Bell className="w-5 h-5 text-amber-500" />;
    }
  };

  const typeColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-emerald-500/10 border-emerald-500/20';
      case 'shareholder': return 'bg-blue-500/10 border-blue-500/20';
      case 'booking': return 'bg-cyan-500/10 border-cyan-500/20';
      case 'expense': return 'bg-rose-500/10 border-rose-500/20';
      case 'installment': return 'bg-indigo-500/10 border-indigo-500/20';
      default: return 'bg-amber-500/10 border-amber-500/20';
    }
  };

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
        <div className="absolute inset-2 rounded-full border-r-2 border-amber-500 animate-spin-reverse"></div>
      </div>
    </div>
  );

  const hasUnpaid = unpaidShareholders.length > 0;

  return (
    <div className="space-y-6 pb-10">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl p-6 lg:p-8 group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity duration-700"></div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="w-full sm:w-auto text-center sm:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-4 backdrop-blur-md">
              <Bell className="w-3 h-3" /> Alert Center
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight drop-shadow-md">
                Notifications
              </h1>
              {unreadCount > 0 && (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-sm font-bold shadow-[0_0_15px_rgba(245,158,11,0.5)] animate-pulse">
                  {unreadCount} New
                </span>
              )}
            </div>
          </div>

          <div className="w-full sm:w-auto flex justify-center sm:justify-end">
            {unreadCount > 0 && (
              <Button onClick={markAllNotificationsRead} className="h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md gap-2 transition-all shadow-lg hover:shadow-white/10 px-6">
                <CheckCheck className="w-4 h-4" /> Mark All as Read
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Dynamic Auto Reminder Dashboard */}
      <Card className={cn(
        "shadow-2xl backdrop-blur-xl overflow-hidden rounded-3xl transition-colors duration-500",
        overdue && hasUnpaid
          ? "border-rose-500/40 bg-rose-500/5"
          : hasUnpaid
            ? "border-amber-500/30 bg-amber-500/5"
            : "border-emerald-500/30 bg-emerald-500/5"
      )}>
        <div className={cn(
          "h-1.5 w-full",
          overdue && hasUnpaid ? "bg-gradient-to-r from-rose-500 to-red-600"
            : hasUnpaid ? "bg-gradient-to-r from-amber-400 to-orange-500"
              : "bg-gradient-to-r from-emerald-400 to-teal-500"
        )}></div>

        <CardHeader className="pb-2 pt-6">
          <CardTitle className="text-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2.5 rounded-xl shadow-inner border",
                overdue && hasUnpaid ? "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  : hasUnpaid ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
              )}>
                {overdue && hasUnpaid ? <ShieldAlert className="w-6 h-6 animate-pulse" />
                  : hasUnpaid ? <Bell className="w-6 h-6" />
                    : <CheckCircle2 className="w-6 h-6" />}
              </div>
              <div>
                <p className="text-base font-bold text-foreground leading-tight">
                  {BN_MONTHS[currentMonth - 1]} {currentYear} Installment Status
                </p>
                <p className="text-xs font-medium text-muted-foreground mt-0.5">
                  Automated tracking system
                </p>
              </div>
            </div>

            {isAdmin && hasUnpaid && (
              <Button size="sm" onClick={handleManualReminder} className={cn(
                "gap-2 rounded-lg shadow-lg transition-all hover:scale-105 border-0 text-white w-full sm:w-auto",
                overdue ? "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 shadow-rose-500/25"
                  : "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/25"
              )}>
                <Send className="w-4 h-4" /> Send Reminders Now
              </Button>
            )}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6 pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-background/50 backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-emerald-600/70 dark:text-emerald-400/70 uppercase tracking-widest mb-1">Paid Members</p>
              <p className="text-3xl font-extrabold text-emerald-500">{shareholders.length - unpaidShareholders.length}</p>
            </div>
            <div className="bg-background/50 backdrop-blur-sm border border-rose-500/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-rose-600/70 dark:text-rose-400/70 uppercase tracking-widest mb-1">Unpaid Due</p>
              <p className="text-3xl font-extrabold text-rose-500">{unpaidShareholders.length}</p>
            </div>
            <div className="bg-background/50 backdrop-blur-sm border border-indigo-500/20 rounded-2xl p-4 text-center">
              <p className="text-[10px] font-bold text-indigo-600/70 dark:text-indigo-400/70 uppercase tracking-widest mb-1">Due Date</p>
              <p className="text-2xl font-extrabold text-indigo-500 mt-1">{dueDay} {BN_MONTHS[currentMonth - 1]}</p>
            </div>
          </div>

          {overdue && hasUnpaid && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-semibold text-rose-600 dark:text-rose-400 leading-relaxed">
                শেষ তারিখ ({dueDay} তারিখ) পার হয়ে গেছে। নিচে যাদের নাম দেখানো হচ্ছে তারা এখনো এই মাসের টাকা পরিশোধ করেননি।
              </p>
            </div>
          )}

          {hasUnpaid ? (
            <div className="space-y-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1">Unpaid Members List:</p>
              <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto custom-scrollbar p-1">
                {unpaidShareholders.map(sh => (
                  <Badge key={sh.id} variant="outline" className={cn(
                    "px-3 py-1.5 text-sm font-bold border",
                    overdue
                      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                  )}>
                    {sh.name}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col items-center justify-center text-center">
              <Sparkles className="w-12 h-12 text-emerald-500 mb-3" />
              <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">অসাধারণ!</p>
              <p className="text-sm font-medium text-emerald-600/80 dark:text-emerald-400/80 mt-1">সবাই এই মাসের ইনস্টলমেন্ট পরিশোধ করেছেন।</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Premium Notification Feed */}
      <Card className="shadow-xl border-border/50 bg-card/40 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col min-h-[500px]">
        <CardHeader className="bg-muted/20 border-b border-border/50 pb-4 shrink-0">
          <CardTitle className="text-lg flex items-center justify-between">
            <div className="flex items-center gap-2"><Bell className="w-5 h-5 text-amber-500" /> Recent Activity Feed</div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden flex flex-col h-full">
          {notifications.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-muted-foreground">
              <Bell className="w-16 h-16 mb-4 opacity-20" />
              <p className="font-medium text-lg">You're all caught up!</p>
              <p className="text-sm mt-1">No new notifications to display.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto divide-y divide-border/30 custom-scrollbar max-h-[800px]">
              {notifications.map((n, i) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && markNotificationRead(n.id)}
                  className={cn(
                    "w-full text-left p-4 sm:p-5 flex items-start gap-4 transition-all duration-300 group",
                    !n.read ? "bg-background border-l-4 border-l-primary hover:bg-muted/30" : "bg-muted/10 hover:bg-muted/30 opacity-80 hover:opacity-100"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border shadow-sm transition-transform group-hover:scale-105",
                    typeColor(n.type),
                    !n.read ? "ring-2 ring-primary/20 ring-offset-2 ring-offset-background" : ""
                  )}>
                    {typeIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 pt-0.5">
                    <p className={cn(
                      "text-sm sm:text-base leading-relaxed",
                      !n.read ? "font-bold text-foreground" : "font-medium text-muted-foreground"
                    )}>
                      {n.message}
                    </p>
                    <p className="text-xs font-semibold text-muted-foreground/80 mt-1.5 flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {new Date(n.created_at).toLocaleString('en-GB', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {!n.read && (
                    <div className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0 mt-3 shadow-[0_0_8px_rgba(var(--primary),0.8)] animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
