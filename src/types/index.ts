export type UserRole = 'admin' | 'shareholder' | 'director';

export interface Shareholder {
  id: string;
  name: string;
  phone: string;
  address: string;
  profile_image_url: string;
  booking_date: string;
  num_shares: number;
  total_share: number;
  total_paid: number;
  status: 'booked' | 'partial' | 'fully_paid';
  referred_by_director_id?: string | null;
  portal_token?: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  shareholder_id: string;
  amount: number;
  date: string;
  type: 'booking' | 'remaining';
  screenshot_url: string;
  receipt_no?: string | null;
  notes?: string;
  created_at: string;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  date: string;
  notes?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  message: string;
  type: 'payment' | 'booking' | 'shareholder' | 'expense' | 'installment';
  read: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  message: string;
  type: 'payment' | 'expense' | 'shareholder' | 'installment';
  created_at: string;
}

export interface Director {
  id: string;
  name: string;
  phone: string;
  role: string;
  bio: string;
  image_url: string;
  signature_url?: string | null;
  display_order: number;
  created_at: string;
}

export interface DirectorRole {
  id: string;
  name: string;
  display_order: number;
  created_at: string;
}

export interface Installment {
  id: string;
  shareholder_id: string;
  amount: number;
  month: number;
  year: number;
  date: string;
  screenshot_url: string;
  notes?: string;
  created_at: string;
}

export interface ProjectSetting {
  id: string;
  key: string;
  value: string;
  updated_at: string;
}

export interface ProjectContent {
  id: string;
  section: string;
  content: any;
  updated_at: string;
}

export interface RentalConfig {
  id: string;
  rooms: number;
  rent_per_room: number;
  shops: number;
  rent_per_shop: number;
  target_months: number;
  notes?: string;
  updated_at: string;
}

export interface RentalCollection {
  id: string;
  month: number;
  year: number;
  amount: number;
  rooms: number;
  shops: number;
  date: string;
  notes?: string;
  screenshot_url?: string;
  created_at: string;
}

export interface PrivateExpense {
  id: string;
  title: string;
  amount: number;
  date: string;
  notes?: string;
  category?: string;
  created_at: string;
}


// Defaults — these are overridden at runtime by values from project_settings table
export const TOTAL_SHARE_AMOUNT = 550000;
export const MAX_BOOKING_AMOUNT = 50000;
export const TARGET_SHAREHOLDERS = 91;
export const TOTAL_LAND_COST = 45500000;
export const INSTALLMENT_AMOUNT = 5000;
export const INSTALLMENT_MONTHS = 24;

/** Format any BDT amount in Bangla style: ৳X লক্ষ / ৳X কোটি / ৳X হাজার */
export function formatBdtBangla(amount: number): string {
  if (!isFinite(amount)) return '৳0';
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  if (abs >= 10000000) return `${sign}৳${(amount / 10000000).toFixed(2).replace(/\.00$/, '')} কোটি`;
  if (abs >= 100000) return `${sign}৳${(amount / 100000).toFixed(2).replace(/\.00$/, '')} লক্ষ`;
  if (abs >= 1000) return `${sign}৳${(amount / 1000).toFixed(1).replace(/\.0$/, '')} হাজার`;
  return `${sign}৳${amount.toLocaleString()}`;
}
