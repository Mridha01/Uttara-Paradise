import { Shareholder, Payment, Expense, Notification, Activity } from '@/types';

export const mockShareholders: Shareholder[] = [
  { id: '1', name: 'Rahim Uddin', phone: '01712345678', address: 'Dhaka, Mirpur-10', profileImage: '', bookingDate: '2024-01-15', totalShare: 550000, totalPaid: 550000, status: 'fully_paid', createdAt: '2024-01-15' },
  { id: '2', name: 'Karim Ahmed', phone: '01812345679', address: 'Dhaka, Uttara', profileImage: '', bookingDate: '2024-02-10', totalShare: 550000, totalPaid: 200000, status: 'partial', createdAt: '2024-02-10' },
  { id: '3', name: 'Fatema Begum', phone: '01912345680', address: 'Dhaka, Dhanmondi', profileImage: '', bookingDate: '2024-03-05', totalShare: 550000, totalPaid: 50000, status: 'booked', createdAt: '2024-03-05' },
  { id: '4', name: 'Jamal Hossain', phone: '01612345681', address: 'Chittagong, Agrabad', profileImage: '', bookingDate: '2024-03-20', totalShare: 550000, totalPaid: 350000, status: 'partial', createdAt: '2024-03-20' },
  { id: '5', name: 'Nasreen Akhter', phone: '01512345682', address: 'Dhaka, Banani', profileImage: '', bookingDate: '2024-04-01', totalShare: 550000, totalPaid: 550000, status: 'fully_paid', createdAt: '2024-04-01' },
  { id: '6', name: 'Sumon Mia', phone: '01312345683', address: 'Sylhet, Zindabazar', profileImage: '', bookingDate: '2024-04-15', totalShare: 550000, totalPaid: 50000, status: 'booked', createdAt: '2024-04-15' },
];

export const mockPayments: Payment[] = [
  { id: 'p1', shareholderId: '1', amount: 50000, date: '2024-01-15', type: 'booking', screenshotUrl: '', createdAt: '2024-01-15' },
  { id: 'p2', shareholderId: '1', amount: 500000, date: '2024-02-20', type: 'remaining', screenshotUrl: '', createdAt: '2024-02-20' },
  { id: 'p3', shareholderId: '2', amount: 50000, date: '2024-02-10', type: 'booking', screenshotUrl: '', createdAt: '2024-02-10' },
  { id: 'p4', shareholderId: '2', amount: 150000, date: '2024-03-15', type: 'remaining', screenshotUrl: '', createdAt: '2024-03-15' },
  { id: 'p5', shareholderId: '3', amount: 50000, date: '2024-03-05', type: 'booking', screenshotUrl: '', createdAt: '2024-03-05' },
  { id: 'p6', shareholderId: '4', amount: 50000, date: '2024-03-20', type: 'booking', screenshotUrl: '', createdAt: '2024-03-20' },
  { id: 'p7', shareholderId: '4', amount: 300000, date: '2024-05-10', type: 'remaining', screenshotUrl: '', createdAt: '2024-05-10' },
  { id: 'p8', shareholderId: '5', amount: 50000, date: '2024-04-01', type: 'booking', screenshotUrl: '', createdAt: '2024-04-01' },
  { id: 'p9', shareholderId: '5', amount: 500000, date: '2024-05-01', type: 'remaining', screenshotUrl: '', createdAt: '2024-05-01' },
  { id: 'p10', shareholderId: '6', amount: 50000, date: '2024-04-15', type: 'booking', screenshotUrl: '', createdAt: '2024-04-15' },
];

export const mockExpenses: Expense[] = [
  { id: 'e1', title: 'Land Survey', amount: 25000, date: '2024-01-20', notes: 'Government surveyor fees', createdAt: '2024-01-20' },
  { id: 'e2', title: 'Legal Documentation', amount: 50000, date: '2024-02-05', notes: 'Lawyer and document fees', createdAt: '2024-02-05' },
  { id: 'e3', title: 'Office Rent', amount: 15000, date: '2024-03-01', notes: 'Monthly office rent', createdAt: '2024-03-01' },
];

export const mockNotifications: Notification[] = [
  { id: 'n1', message: 'Rahim Uddin paid ৳500,000', type: 'payment', read: false, createdAt: '2024-02-20' },
  { id: 'n2', message: 'New shareholder: Sumon Mia', type: 'shareholder', read: false, createdAt: '2024-04-15' },
  { id: 'n3', message: 'Jamal Hossain paid ৳300,000', type: 'payment', read: true, createdAt: '2024-05-10' },
];

export const mockActivities: Activity[] = [
  { id: 'a1', message: 'Sumon Mia added as shareholder', type: 'shareholder', createdAt: '2024-04-15' },
  { id: 'a2', message: 'Nasreen Akhter completed full payment', type: 'payment', createdAt: '2024-05-01' },
  { id: 'a3', message: 'Jamal Hossain paid ৳300,000', type: 'payment', createdAt: '2024-05-10' },
  { id: 'a4', message: 'Office Rent expense added ৳15,000', type: 'expense', createdAt: '2024-03-01' },
];
