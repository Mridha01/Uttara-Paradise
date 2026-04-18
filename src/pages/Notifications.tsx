import { useEffect, useMemo, useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, Send } from 'lucide-react';
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
      case 'payment': return '💰';
      case 'shareholder': return '👤';
      case 'booking': return '📋';
      case 'expense': return '📦';
      case 'installment': return '📅';
      default: return '🔔';
    }
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && <span className="px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-xs font-medium">{unreadCount} new</span>}
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllNotificationsRead} className="gap-2"><CheckCheck className="w-4 h-4" /> Mark all read</Button>
        )}
      </div>

      {/* Auto Reminder Panel */}
      <Card className={cn("shadow-card border-2", overdue && unpaidShareholders.length > 0 ? "border-destructive/50" : "border-warning/30")}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-2">
              {overdue && unpaidShareholders.length > 0 ? <AlertTriangle className="w-5 h-5 text-destructive" /> : <Bell className="w-5 h-5 text-warning" />}
              {BN_MONTHS[currentMonth - 1]} {currentYear} ইনস্টলমেন্ট স্ট্যাটাস
            </span>
            {isAdmin && (
              <Button size="sm" variant="outline" onClick={handleManualReminder} className="gap-2">
                <Send className="w-3.5 h-3.5" /> এখনই রিমাইন্ডার পাঠাও
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-lg bg-success/10">
              <p className="text-xs text-muted-foreground">পরিশোধিত</p>
              <p className="text-lg font-bold text-success">{shareholders.length - unpaidShareholders.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-destructive/10">
              <p className="text-xs text-muted-foreground">বাকি</p>
              <p className="text-lg font-bold text-destructive">{unpaidShareholders.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <p className="text-xs text-muted-foreground">শেষ তারিখ</p>
              <p className="text-lg font-bold text-primary">{dueDay} {BN_MONTHS[currentMonth - 1]}</p>
            </div>
          </div>

          {overdue && unpaidShareholders.length > 0 && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
              ⚠️ শেষ তারিখ ({dueDay} তারিখ) পার হয়ে গেছে। নিচে যাদের নাম দেখানো হচ্ছে তারা এখনো পরিশোধ করেননি।
            </div>
          )}

          {unpaidShareholders.length > 0 ? (
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
              {unpaidShareholders.map(sh => (
                <Badge key={sh.id} variant="outline" className="text-xs border-destructive/40 text-destructive">
                  {sh.name}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-success text-center py-2">🎉 সবাই এই মাসের ইনস্টলমেন্ট পরিশোধ করেছেন!</p>
          )}

          <p className="text-[10px] text-muted-foreground text-center pt-1">
            💡 SMS/email ইন্টিগ্রেশন পরে যোগ করা যাবে — এখন শুধু in-app reminder
          </p>
        </CardContent>
      </Card>

      <Card className="shadow-card">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground"><Bell className="w-10 h-10 mx-auto mb-2 opacity-30" /><p>No notifications yet</p></div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((n, i) => (
                <button key={n.id} onClick={() => !n.read && markNotificationRead(n.id)} className={cn("w-full text-left p-4 flex items-start gap-3 hover:bg-muted/50 transition-colors animate-fade-in", !n.read && "bg-primary/5")} style={{ animationDelay: `${i * 40}ms` }}>
                  <span className="text-lg">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm", !n.read ? "font-semibold text-card-foreground" : "text-muted-foreground")}>{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{new Date(n.created_at).toLocaleDateString()}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
