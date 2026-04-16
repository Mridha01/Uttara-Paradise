import { Bell, CheckCheck } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, loading } = useApp();
  const unreadCount = notifications.filter(n => !n.read).length;

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
