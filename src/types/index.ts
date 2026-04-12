export type UserRole = 'admin' | 'shareholder' | 'director';

export interface Shareholder {
  id: string;
  name: string;
  phone: string;
  address: string;
  profileImage: string;
  bookingDate: string;
  totalShare: number;
  totalPaid: number;
  status: 'booked' | 'partial' | 'fully_paid';
  createdAt: string;
}

export interface Payment {
  id: string;
  shareholderId: string;
  amount: number;
  date: string;
  type: 'booking' | 'remaining';
  screenshotUrl: string;
  notes?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'payment' | 'booking' | 'shareholder' | 'expense';
  read: boolean;
  createdAt: string;
}

export interface Activity {
  id: string;
  message: string;
  type: 'payment' | 'expense' | 'shareholder';
  createdAt: string;
}

export const TOTAL_SHARE_AMOUNT = 550000;
export const MAX_BOOKING_AMOUNT = 50000;
export const TARGET_SHAREHOLDERS = 91;
export const TOTAL_LAND_COST = 45500000; // ৪ কোটি ৫৫ লক্ষ টাকা
