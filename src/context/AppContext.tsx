import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Shareholder, Payment, Expense, Notification, Activity, TOTAL_SHARE_AMOUNT, MAX_BOOKING_AMOUNT } from '@/types';
import { mockShareholders, mockPayments, mockExpenses, mockNotifications, mockActivities } from '@/data/mockData';

interface AppState {
  shareholders: Shareholder[];
  payments: Payment[];
  expenses: Expense[];
  notifications: Notification[];
  activities: Activity[];
  currentRole: 'admin' | 'shareholder' | 'director';
}

interface AppContextType extends AppState {
  addShareholder: (s: Omit<Shareholder, 'id' | 'totalPaid' | 'status' | 'createdAt'>) => void;
  updateShareholder: (id: string, s: Partial<Shareholder>) => void;
  addPayment: (p: Omit<Payment, 'id' | 'createdAt'>) => void;
  deletePayment: (id: string) => void;
  addExpense: (e: Omit<Expense, 'id' | 'createdAt'>) => void;
  deleteShareholder: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  getShareholderPayments: (id: string) => Payment[];
  getShareholder: (id: string) => Shareholder | undefined;
  setRole: (role: AppState['currentRole']) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [shareholders, setShareholders] = useState<Shareholder[]>(mockShareholders);
  const [payments, setPayments] = useState<Payment[]>(mockPayments);
  const [expenses, setExpenses] = useState<Expense[]>(mockExpenses);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [activities, setActivities] = useState<Activity[]>(mockActivities);
  const [currentRole, setCurrentRole] = useState<AppState['currentRole']>('admin');

  const addNotification = useCallback((message: string, type: Notification['type']) => {
    const n: Notification = { id: `n${Date.now()}`, message, type, read: false, createdAt: new Date().toISOString() };
    setNotifications(prev => [n, ...prev]);
  }, []);

  const addActivity = useCallback((message: string, type: Activity['type']) => {
    const a: Activity = { id: `a${Date.now()}`, message, type, createdAt: new Date().toISOString() };
    setActivities(prev => [a, ...prev]);
  }, []);

  const addShareholder = useCallback((s: Omit<Shareholder, 'id' | 'totalPaid' | 'status' | 'createdAt'>) => {
    const newS: Shareholder = {
      ...s,
      id: `s${Date.now()}`,
      totalPaid: 0,
      status: 'booked',
      createdAt: new Date().toISOString(),
    };
    setShareholders(prev => [...prev, newS]);
    addNotification(`New shareholder: ${s.name}`, 'shareholder');
    addActivity(`${s.name} added as shareholder`, 'shareholder');
  }, [addNotification, addActivity]);

  const updateShareholder = useCallback((id: string, updates: Partial<Shareholder>) => {
    setShareholders(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const addPayment = useCallback((p: Omit<Payment, 'id' | 'createdAt'>) => {
    const shareholder = shareholders.find(s => s.id === p.shareholderId);
    if (!shareholder) return;

    if (p.type === 'booking' && p.amount > MAX_BOOKING_AMOUNT) return;
    if (shareholder.totalPaid + p.amount > TOTAL_SHARE_AMOUNT) return;

    const newP: Payment = { ...p, id: `p${Date.now()}`, createdAt: new Date().toISOString() };
    setPayments(prev => [...prev, newP]);

    const newTotalPaid = shareholder.totalPaid + p.amount;
    const newStatus = newTotalPaid >= TOTAL_SHARE_AMOUNT ? 'fully_paid' : newTotalPaid > 0 ? 'partial' : 'booked';
    setShareholders(prev => prev.map(s => s.id === p.shareholderId ? { ...s, totalPaid: newTotalPaid, status: newStatus } : s));

    addNotification(`${shareholder.name} paid ৳${p.amount.toLocaleString()}`, 'payment');
    addActivity(`${shareholder.name} paid ৳${p.amount.toLocaleString()}`, 'payment');
  }, [shareholders, addNotification, addActivity]);

  const addExpense = useCallback((e: Omit<Expense, 'id' | 'createdAt'>) => {
    const newE: Expense = { ...e, id: `e${Date.now()}`, createdAt: new Date().toISOString() };
    setExpenses(prev => [...prev, newE]);
    addNotification(`Expense added: ${e.title} ৳${e.amount.toLocaleString()}`, 'expense');
    addActivity(`${e.title} expense added ৳${e.amount.toLocaleString()}`, 'expense');
  }, [addNotification, addActivity]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const getShareholderPayments = useCallback((id: string) => {
    return payments.filter(p => p.shareholderId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [payments]);

  const getShareholder = useCallback((id: string) => {
    return shareholders.find(s => s.id === id);
  }, [shareholders]);

  return (
    <AppContext.Provider value={{
      shareholders, payments, expenses, notifications, activities, currentRole,
      addShareholder, updateShareholder, addPayment, addExpense,
      markNotificationRead, markAllNotificationsRead,
      getShareholderPayments, getShareholder, setRole: setCurrentRole,
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
