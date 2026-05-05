# উত্তরা ভিলাস — সম্পূর্ণ বাংলা গাইড 🇧🇩

এই ডকুমেন্ট পড়লে আপনি অ্যাপের প্রতিটি মডিউল, ফাংশন, স্টেট, এবং ক্যালকুলেশন বুঝতে পারবেন — যাতে ভবিষ্যতে নিজে নিজেই যেকোনো পরিবর্তন করতে পারেন।

---

## ১. অ্যাপ কী করে? (Overview)

**উত্তরা ভিলাস** একটা Real Estate Share Management সিস্টেম। ১৪ কাঠা জমিতে B+G+13 বিল্ডিং, মোট **৯১ শেয়ার** যা প্রায় **৯৮ জন শেয়ারহোল্ডার** এর কাছে বিক্রি হবে। এটি ট্র্যাক করে:

- শেয়ারহোল্ডার ও তাদের শেয়ার সংখ্যা
- বুকিং + ইনস্টলমেন্ট পেমেন্ট
- ব্যাংক ট্রান্সফার স্লিপ আপলোড ও ভেরিফিকেশন
- রেন্টাল ইনকাম (দোকান/রুম থেকে)
- প্রজেক্ট এক্সপেন্স (পাবলিক ও প্রাইভেট)
- ৫ জন ডিরেক্টরের শেয়ার বিক্রি (৭৩ টা টার্গেট)
- অটো-জেনারেটেড পেমেন্ট রিসিট (PDF/Print)
- প্রতি শেয়ারহোল্ডারের জন্য সিক্রেট পোর্টাল লিংক

---

## ২. প্রজেক্ট স্ট্রাকচার (কোথায় কী ফাইল)

```
src/
├── config/project.ts        ⭐ কাঠা/শেয়ার সংখ্যা/বিল্ডিং ফ্লোর — এখানে এডিট করেন
├── context/
│   ├── AppContext.tsx       ⭐ সব ডেটাবেস কাজ (read/write) এখানে
│   └── AuthContext.tsx      🔒 অ্যাডমিন লগইন
├── pages/                    প্রতিটা ফাইল = একটা রুট/পেজ
├── components/
│   ├── Layout.tsx            সাইডবার + হেডার
│   ├── PaymentReceipt.tsx    রিসিট ডিজাইন
│   └── ui/                   shadcn কম্পোনেন্ট (button, card, ...)
├── index.css                 ⭐ থিম কালার (HSL) — এখানে রঙ পরিবর্তন
├── types/index.ts            টাইপ + কনস্ট্যান্ট (formatBdtBangla)
└── App.tsx                   রুটিং
supabase/migrations/          SQL মাইগ্রেশন (ডেটাবেস পরিবর্তন)
```

---

## ৩. State কীভাবে কাজ করে?

পুরো অ্যাপের ডেটা **একটা জায়গায়** থাকে: `AppContext.tsx`। একে বলে **Global State**।

### কীভাবে?
1. অ্যাপ শুরু হলে `AppContext` সব ডেটা একসাথে Lovable Cloud (Supabase) থেকে fetch করে — `shareholders`, `payments`, `installments`, `expenses`, `directors`, `notifications`, `rental_collections`।
2. সব পেজ `useApp()` হুক দিয়ে এই ডেটা পড়ে। যেমন:
   ```tsx
   const { shareholders, addPayment } = useApp();
   ```
3. কোনো অ্যাকশন (যেমন পেমেন্ট অ্যাড) হলে → `addPayment()` কল হয় → DB তে save → state আপডেট → সব পেজে অটো রিফ্রেশ।

### Auth State (`AuthContext`)
- `isAdmin` — true হলে সব edit/delete বাটন দেখা যায়।
- `signIn`, `signOut` — লগইন/লগআউট।
- শুধু একটা স্ট্যাটিক ইমেইল: `admin@uttaravilas.com`।

---

## ৪. মডিউলগুলোর কাজ ও ক্যালকুলেশন

### 🟢 Dashboard (`src/pages/Dashboard.tsx`)
- **মোট শেয়ারহোল্ডার**, **বিক্রি হওয়া শেয়ার**, **collected অর্থ**, **remaining**, **slots left** দেখায়।
- **ক্যালকুলেশন:**
  - বিক্রিত শেয়ার = `Σ shareholder.num_shares`
  - কালেক্টেড = `Σ shareholder.total_paid`
  - রিমেইনিং = `Σ (total_share − total_paid)`
  - স্লট লেফট = `91 − বিক্রিত শেয়ার`
- **চার্ট:** Payment Status Overview = কতজন Fully Paid / Partial / Booked।

### 🟢 Shareholders (`src/pages/Shareholders.tsx`)
- পেজিনেশন ১২/পেজ।
- নতুন শেয়ারহোল্ডার অ্যাড করলে:
  - `total_share = num_shares × ৫,৫০,০০০` (১ শেয়ারের দাম)
  - `total_paid = booking_amount` (সাধারণত ৫০,০০০)
  - `status = 'booked'`
  - একটা পোর্টাল টোকেন (random) তৈরি হয় → সিক্রেট লিংক।

### 🟢 Shareholder Detail (`/shareholders/:id`)
- ব্যক্তির সব পেমেন্ট হিস্ট্রি ও ইনস্টলমেন্ট দেখায়।
- **status logic:**
  - `total_paid >= total_share` → fully_paid
  - `total_paid > booking_amount` → partial
  - else → booked
- **স্লিপ ইমেজ শুধু অ্যাডমিন দেখতে পারে** (privacy)।

### 🟢 Payments (`src/pages/Payments.tsx`)
- সব পেমেন্ট ট্রানজ্যাকশন।
- পেমেন্ট অ্যাড করলে:
  - রিসিট নাম্বার অটো-ইনক্রিমেন্ট (`receipt_no`)
  - শেয়ারহোল্ডারের `total_paid` আপডেট
  - স্ট্যাটাস recalculate
  - নোটিফিকেশন তৈরি
  - রিসিট পপআপ আসে (Print/Download PDF)।
- delete করলে → সব আবার recalculate।

### 🟢 Installments (`src/pages/Installments.tsx`)
- মাসিক ৫,০০০ টাকা (default) × ২৪ মাস টার্গেট।
- প্রতিটা এন্ট্রি unique by `(shareholder_id, month, year)`।
- টোটাল কালেক্টেড / টার্গেট / মাস বাকি — সব সামারি কার্ডে।

### 🟢 Rental Income (`src/pages/Rental.tsx`)
- `rental_config` থেকে: `rooms × room_rent + shops × shop_rent` = মাসিক রেন্ট।
- টার্গেট মাস (default 36) — কত মাসে ROI।
- প্রজেকশন চার্ট: cumulative income vs target।

### 🟢 Expenses (পাবলিক) ও Admin Expenses (প্রাইভেট)
- দুটো আলাদা টেবিল: `expenses` (সবার জন্য) ও `private_expenses` (শুধু অ্যাডমিন)।
- ক্যাটেগরি, ডেট, অ্যামাউন্ট, রিসিট ইমেজ।

### 🔒 Director Sales (`/director-sales`)
- শেয়ারহোল্ডারে `referred_by_director_id` field থাকে।
- এই পেজ বের করে: কোন ডিরেক্টর কয়টা শেয়ার বিক্রি করেছে।
- টোটাল = `Σ shareholder.num_shares যেখানে referred_by_director_id = director.id`
- ৭৩ এর মধ্যে কতটা বিক্রি হলো দেখায়। CSV export ও আছে।

### 🟢 Directors (`/directors`)
- ৫ জন ডিরেক্টর — নাম, রোল, ছবি, **সিগনেচার ইমেজ**।
- সিগনেচার আপলোড করলে রিসিটে অটো বসে। না দিলে blank line।

### 🟢 Portal (`/portal/:id?token=xxx`)
- শেয়ারহোল্ডারের পার্সোনাল view। শুধু সঠিক token থাকলে খোলে।
- নিজের সব ডিটেইল + স্লিপ দেখতে পারে। অন্যেরটা নয়।

### 🟢 Notifications
- পেমেন্ট/বুকিং হলে অটো নোটিফিকেশন তৈরি। `read/unread` ট্র্যাক।

---

## ৫. গুরুত্বপূর্ণ কনস্ট্যান্ট (পরিবর্তন করতে চাইলে)

| ফাইল | কী পরিবর্তন করবেন |
|------|--------------------|
| `src/config/project.ts` | কাঠা সংখ্যা (১৪), মোট শেয়ারহোল্ডার (৯৮), বিল্ডিং (B+G+13) |
| `src/types/index.ts` | `INSTALLMENT_AMOUNT` (৫০০০), `INSTALLMENT_MONTHS` (২৪), শেয়ার ভ্যালু |
| `src/index.css` | অ্যাপের রঙ (HSL ফরম্যাটে) |
| `src/components/Layout.tsx` | সাইডবার মেনু আইটেম |
| `src/context/AuthContext.tsx` | অ্যাডমিন ইমেইল/পাসওয়ার্ড |

---

## ৬. কালার থিম কীভাবে কাজ করে?

`src/index.css` এ `:root { --primary: 84 100% 60%; ... }` — এগুলো **HSL** ফরম্যাটে।

কোনো কম্পোনেন্টে `bg-primary`, `text-foreground` এগুলো ব্যবহার হয়। সরাসরি `bg-green-500` লিখবেন না — তাহলে থিম change হবে না।

রঙ পরিবর্তন করতে চাইলে শুধু `:root {}` এর মধ্যে HSL মান বদলান। পুরো অ্যাপে অটো অ্যাপ্লাই হবে।

---

## ৭. একটা নতুন ফিল্ড যোগ করতে চাইলে (যেমন: শেয়ারহোল্ডারে "NID Number")

1. **ডেটাবেস:** নতুন মাইগ্রেশন তৈরি — `ALTER TABLE shareholders ADD COLUMN nid TEXT;`
2. **Type:** `src/types/index.ts` এ `Shareholder` টাইপে `nid?: string` যোগ করেন।
3. **Form:** `Shareholders.tsx` এর Add Dialog এ নতুন `<Input>` যোগ করেন।
4. **Context:** `addShareholder` এ `nid` পাঠান।
5. **Display:** `ShareholderDetail.tsx` এ দেখান।

---

## ৮. সিকিউরিটি নিয়ম (মনে রাখবেন)

- পাবলিক পেজে **স্লিপ ইমেজ কখনো দেখানো যাবে না** — শুধু অ্যাডমিন।
- পোর্টাল লিংকে token থাকতে হবে।
- অ্যাডমিন বাটন সব জায়গায় `{isAdmin && <...>}` দিয়ে wrap করা।

---

## ৯. ডেপ্লয়মেন্ট

- GitHub-এ push করলে Vercel অটো-deploy করে।
- `vercel.json` ফাইল **must** — না থাকলে portal লিংক 404 দেখাবে।
- ডেটাবেস মাইগ্রেশন `supabase/migrations/` এ commit হলে অটো apply হয়।

---

## ১০. সমস্যা হলে কোথায় দেখবেন?

| সমস্যা | সমাধান |
|--------|--------|
| পেজ মোবাইলে scroll ভাঙছে | parent div এ `min-w-0 overflow-x-hidden` যোগ করেন |
| Vercel deep link 404 | `vercel.json` চেক করেন |
| অ্যাডমিন বাটন আসছে না | আবার লগইন করেন |
| ইমেজ আপলোড হচ্ছে না | bucket name বানান চেক করেন |
| রিসিট নম্বর ডুপ্লিকেট | `payments.receipt_no` sequence চেক করেন |

---

## ১১. সংক্ষেপে যা মনে রাখবেন

1. **সব ডেটা** আসে `useApp()` থেকে।
2. **লগইন স্টেট** আসে `useAuth()` থেকে।
3. **রঙ** = `index.css` এ HSL।
4. **নতুন রুট** = `App.tsx` এ যোগ + `Layout.tsx` সাইডবারে যোগ।
5. **DB পরিবর্তন** = `supabase/migrations/` এ নতুন SQL ফাইল।
6. **প্রাইভেসি** = স্লিপ ইমেজ পাবলিকে দেখাবেন না।

---

_এই ফাইল আপডেট রাখুন যখনই বড় পরিবর্তন করেন। ভবিষ্যতের ডেভেলপারদের কাজে আসবে।_
