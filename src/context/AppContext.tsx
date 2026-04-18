import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Shareholder, Payment, Expense, Notification, Activity, Director, DirectorRole, Installment, ProjectSetting, ProjectContent, RentalConfig, RentalCollection, TOTAL_SHARE_AMOUNT, MAX_BOOKING_AMOUNT } from '@/types';

interface AppContextType {
  shareholders: Shareholder[];
  payments: Payment[];
  expenses: Expense[];
  notifications: Notification[];
  activities: Activity[];
  directors: Director[];
  directorRoles: DirectorRole[];
  installments: Installment[];
  settings: Record<string, string>;
  loading: boolean;
  addShareholder: (s: Omit<Shareholder, 'id' | 'total_paid' | 'status' | 'created_at'>) => Promise<void>;
  updateShareholder: (id: string, s: Partial<Shareholder>) => Promise<void>;
  deleteShareholder: (id: string) => Promise<void>;
  addPayment: (p: Omit<Payment, 'id' | 'created_at'>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  addExpense: (e: Omit<Expense, 'id' | 'created_at'>) => Promise<void>;
  addDirector: (d: Omit<Director, 'id' | 'created_at'>) => Promise<void>;
  updateDirector: (id: string, d: Partial<Director>) => Promise<void>;
  deleteDirector: (id: string) => Promise<void>;
  addDirectorRole: (name: string) => Promise<void>;
  deleteDirectorRole: (id: string) => Promise<void>;
  addInstallment: (i: Omit<Installment, 'id' | 'created_at'>) => Promise<void>;
  deleteInstallment: (id: string) => Promise<void>;
  updateSetting: (key: string, value: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  getShareholderPayments: (id: string) => Payment[];
  getShareholderInstallments: (id: string) => Installment[];
  getShareholder: (id: string) => Shareholder | undefined;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [shareholders, setShareholders] = useState<Shareholder[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [directors, setDirectors] = useState<Director[]>([]);
  const [directorRoles, setDirectorRoles] = useState<DirectorRole[]>([]);
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [shRes, payRes, expRes, notRes, actRes, dirRes, rolesRes, instRes, setRes] = await Promise.all([
      supabase.from('shareholders').select('*').order('created_at', { ascending: false }),
      supabase.from('payments').select('*').order('date', { ascending: false }),
      supabase.from('expenses').select('*').order('date', { ascending: false }),
      supabase.from('notifications').select('*').order('created_at', { ascending: false }),
      supabase.from('activities').select('*').order('created_at', { ascending: false }),
      supabase.from('directors').select('*').order('display_order', { ascending: true }),
      (supabase.from as any)('director_roles').select('*').order('display_order', { ascending: true }),
      supabase.from('installments').select('*').order('year', { ascending: false }).order('month', { ascending: false }),
      (supabase.from as any)('project_settings').select('*'),
    ]);
    if (shRes.data) setShareholders(shRes.data as unknown as Shareholder[]);
    if (payRes.data) setPayments(payRes.data as unknown as Payment[]);
    if (expRes.data) setExpenses(expRes.data as unknown as Expense[]);
    if (notRes.data) setNotifications(notRes.data as unknown as Notification[]);
    if (actRes.data) setActivities(actRes.data as unknown as Activity[]);
    if (dirRes.data) setDirectors(dirRes.data as unknown as Director[]);
    if (rolesRes?.data) setDirectorRoles(rolesRes.data as unknown as DirectorRole[]);
    if (instRes.data) setInstallments(instRes.data as unknown as Installment[]);
    if (setRes?.data) {
      const map: Record<string, string> = {};
      (setRes.data as ProjectSetting[]).forEach(r => { map[r.key] = r.value; });
      setSettings(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase.channel('app-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shareholders' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' }, () => fetchAll())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'installments' }, () => fetchAll())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [fetchAll]);

  const addNotification = async (message: string, type: Notification['type']) => {
    await supabase.from('notifications').insert({ message, type } as any);
  };

  const addActivity = async (message: string, type: Activity['type']) => {
    await supabase.from('activities').insert({ message, type } as any);
  };

  const addShareholder = useCallback(async (s: Omit<Shareholder, 'id' | 'total_paid' | 'status' | 'created_at'>) => {
    const totalShare = s.num_shares * TOTAL_SHARE_AMOUNT;
    await supabase.from('shareholders').insert({
      name: s.name, phone: s.phone, address: s.address,
      profile_image_url: s.profile_image_url, booking_date: s.booking_date,
      num_shares: s.num_shares, total_share: totalShare,
    } as any);
    await addNotification(`New shareholder: ${s.name}`, 'shareholder');
    await addActivity(`${s.name} added as shareholder`, 'shareholder');
    await fetchAll();
  }, [fetchAll]);

  const updateShareholder = useCallback(async (id: string, updates: Partial<Shareholder>) => {
    if (updates.num_shares) {
      updates.total_share = updates.num_shares * TOTAL_SHARE_AMOUNT;
    }
    await supabase.from('shareholders').update(updates as any).eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const deleteShareholder = useCallback(async (id: string) => {
    await supabase.from('shareholders').delete().eq('id', id);
    await addNotification('Shareholder removed', 'shareholder');
    await addActivity('Shareholder removed', 'shareholder');
    await fetchAll();
  }, [fetchAll]);

  const addPayment = useCallback(async (p: Omit<Payment, 'id' | 'created_at'>) => {
    const sh = shareholders.find(s => s.id === p.shareholder_id);
    if (!sh) return;
    if (p.type === 'booking' && p.amount > MAX_BOOKING_AMOUNT * (sh.num_shares || 1)) return;
    if (sh.total_paid + p.amount > sh.total_share) return;

    await supabase.from('payments').insert({
      shareholder_id: p.shareholder_id, amount: p.amount, date: p.date,
      type: p.type, screenshot_url: p.screenshot_url, notes: p.notes || '',
    } as any);

    const newTotalPaid = sh.total_paid + p.amount;
    const newStatus = newTotalPaid >= sh.total_share ? 'fully_paid' : newTotalPaid > 0 ? 'partial' : 'booked';
    await supabase.from('shareholders').update({ total_paid: newTotalPaid, status: newStatus } as any).eq('id', p.shareholder_id);

    await addNotification(`${sh.name} paid ৳${p.amount.toLocaleString()}`, 'payment');
    await addActivity(`${sh.name} paid ৳${p.amount.toLocaleString()}`, 'payment');
    await fetchAll();
  }, [shareholders, fetchAll]);

  const deletePayment = useCallback(async (id: string) => {
    const payment = payments.find(p => p.id === id);
    if (payment) {
      const sh = shareholders.find(s => s.id === payment.shareholder_id);
      if (sh) {
        const newTotalPaid = Math.max(0, sh.total_paid - payment.amount);
        const newStatus = newTotalPaid >= sh.total_share ? 'fully_paid' : newTotalPaid > 0 ? 'partial' : 'booked';
        await supabase.from('shareholders').update({ total_paid: newTotalPaid, status: newStatus } as any).eq('id', payment.shareholder_id);
      }
    }
    await supabase.from('payments').delete().eq('id', id);
    await addNotification('Payment deleted', 'payment');
    await addActivity('Payment record removed', 'payment');
    await fetchAll();
  }, [payments, shareholders, fetchAll]);

  const addExpense = useCallback(async (e: Omit<Expense, 'id' | 'created_at'>) => {
    await supabase.from('expenses').insert({ title: e.title, amount: e.amount, date: e.date, notes: e.notes || '' } as any);
    await addNotification(`Expense added: ${e.title} ৳${e.amount.toLocaleString()}`, 'expense');
    await addActivity(`${e.title} expense added ৳${e.amount.toLocaleString()}`, 'expense');
    await fetchAll();
  }, [fetchAll]);

  const addDirector = useCallback(async (d: Omit<Director, 'id' | 'created_at'>) => {
    await supabase.from('directors').insert(d as any);
    await fetchAll();
  }, [fetchAll]);

  const updateDirector = useCallback(async (id: string, d: Partial<Director>) => {
    await supabase.from('directors').update(d as any).eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const deleteDirector = useCallback(async (id: string) => {
    await supabase.from('directors').delete().eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const addDirectorRole = useCallback(async (name: string) => {
    await (supabase.from as any)('director_roles').insert({ name, display_order: directorRoles.length });
    await fetchAll();
  }, [fetchAll, directorRoles.length]);

  const deleteDirectorRole = useCallback(async (id: string) => {
    await (supabase.from as any)('director_roles').delete().eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const updateSetting = useCallback(async (key: string, value: string) => {
    const { data: existing } = await (supabase.from as any)('project_settings').select('id').eq('key', key).maybeSingle();
    if (existing?.id) {
      await (supabase.from as any)('project_settings').update({ value, updated_at: new Date().toISOString() }).eq('id', existing.id);
    } else {
      await (supabase.from as any)('project_settings').insert({ key, value });
    }
    await fetchAll();
  }, [fetchAll]);

  const addInstallment = useCallback(async (i: Omit<Installment, 'id' | 'created_at'>) => {
    const sh = shareholders.find(s => s.id === i.shareholder_id);
    await supabase.from('installments').insert({
      shareholder_id: i.shareholder_id, amount: i.amount, month: i.month,
      year: i.year, date: i.date, screenshot_url: i.screenshot_url, notes: i.notes || '',
    } as any);
    if (sh) {
      await addNotification(`${sh.name} installment ৳${i.amount.toLocaleString()} (${i.month}/${i.year})`, 'installment');
      await addActivity(`${sh.name} installment ৳${i.amount.toLocaleString()}`, 'installment');
    }
    await fetchAll();
  }, [shareholders, fetchAll]);

  const deleteInstallment = useCallback(async (id: string) => {
    await supabase.from('installments').delete().eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const markNotificationRead = useCallback(async (id: string) => {
    await supabase.from('notifications').update({ read: true } as any).eq('id', id);
    await fetchAll();
  }, [fetchAll]);

  const markAllNotificationsRead = useCallback(async () => {
    await supabase.from('notifications').update({ read: true } as any).eq('read', false);
    await fetchAll();
  }, [fetchAll]);

  const getShareholderPayments = useCallback((id: string) => {
    return payments.filter(p => p.shareholder_id === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments]);

  const getShareholderInstallments = useCallback((id: string) => {
    return installments.filter(i => i.shareholder_id === id).sort((a, b) => b.year - a.year || b.month - a.month);
  }, [installments]);

  const getShareholder = useCallback((id: string) => {
    return shareholders.find(s => s.id === id);
  }, [shareholders]);

  return (
    <AppContext.Provider value={{
      shareholders, payments, expenses, notifications, activities, directors, directorRoles, installments, settings, loading,
      addShareholder, updateShareholder, deleteShareholder,
      addPayment, deletePayment, addExpense,
      addDirector, updateDirector, deleteDirector,
      addDirectorRole, deleteDirectorRole,
      addInstallment, deleteInstallment,
      updateSetting,
      markNotificationRead, markAllNotificationsRead,
      getShareholderPayments, getShareholderInstallments, getShareholder,
      refresh: fetchAll,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
