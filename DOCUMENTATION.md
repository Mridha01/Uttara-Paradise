# Uttara Vilas — Developer Documentation

Complete guide for new developers to understand and contribute to the Uttara Vilas Real Estate Share Management System.

---

## 1. What Is This App?

**Uttara Vilas (উত্তরা ভিলাস)** is a Real Estate Share Management System for a 14-katha plot building (B+G+13) split into **91 shares** and sold to ~98 shareholders. It tracks:

- Shareholders & their shares
- Booking + installment payments
- Bank transfer slip uploads & verification
- Rental income from existing rooms/shops
- Project expenses (public + private)
- Director-driven sales (5 directors, 73 share target)
- Auto-generated payment receipts (printable PDF)
- Public per-shareholder portal (token-protected)

---

## 2. Tech Stack

| Layer        | Technology                                          |
| ------------ | --------------------------------------------------- |
| Framework    | React 18 + Vite 5 + TypeScript 5                    |
| Styling      | Tailwind CSS v3 + semantic HSL design tokens        |
| UI Library   | shadcn/ui (Radix UI primitives)                     |
| Routing      | react-router-dom v6                                 |
| State        | React Context (`AppContext`, `AuthContext`)         |
| Backend      | **Lovable Cloud** (Supabase under the hood)         |
| Database     | PostgreSQL (Supabase)                               |
| Storage      | Supabase Storage (image uploads)                    |
| Forms/Toast  | sonner (toast), native form handling                |
| Charts       | recharts                                            |
| Hosting      | Vercel (`vercel.json` SPA rewrite required)         |
| PWA          | `public/manifest.json` for installable mobile app   |

> **Note:** We refer to the backend as "Lovable Cloud" in user-facing language. Internally it is a Supabase project.

---

## 3. Folder Structure

```
project-root/
├── public/                     # Static assets served as-is
│   ├── manifest.json           # PWA install manifest
│   ├── favicon.svg             # App icon
│   └── robots.txt
├── src/
│   ├── assets/                 # (Imported images for components)
│   ├── components/
│   │   ├── Layout.tsx          # App shell: sidebar + header + main
│   │   ├── NavLink.tsx         # Sidebar nav link helper
│   │   ├── PaymentReceipt.tsx  # Auto-generated receipt (print/PDF)
│   │   ├── RentalProjectionChart.tsx  # Bar+line projection chart
│   │   └── ui/                 # shadcn components (button, card, dialog, ...)
│   ├── config/
│   │   └── project.ts          # ⭐ EDIT HERE: katha, shareholder count, etc.
│   ├── context/
│   │   ├── AppContext.tsx      # ⭐ ALL data fetching + mutations
│   │   └── AuthContext.tsx     # Admin login state (static credentials)
│   ├── data/
│   │   └── mockData.ts         # (Legacy/unused mock data)
│   ├── hooks/
│   │   ├── use-mobile.tsx      # Responsive breakpoint hook
│   │   └── use-toast.ts
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts       # ⛔ AUTO-GENERATED, never edit
│   │       └── types.ts        # ⛔ AUTO-GENERATED DB types
│   ├── lib/
│   │   ├── storage.ts          # uploadImage() helper for Supabase storage
│   │   └── utils.ts            # cn() classname helper
│   ├── pages/                  # One file = one route
│   │   ├── Dashboard.tsx
│   │   ├── Shareholders.tsx
│   │   ├── ShareholderDetail.tsx
│   │   ├── Payments.tsx
│   │   ├── Installments.tsx
│   │   ├── Rental.tsx
│   │   ├── Expenses.tsx
│   │   ├── AdminExpenses.tsx     # 🔒 Admin-only
│   │   ├── Notifications.tsx
│   │   ├── ProjectDetails.tsx
│   │   ├── Directors.tsx
│   │   ├── DirectorSales.tsx     # 🔒 Admin-only
│   │   ├── Portal.tsx            # Public per-shareholder portal (token)
│   │   ├── Login.tsx             # Admin login
│   │   └── NotFound.tsx
│   ├── types/
│   │   └── index.ts            # TS types + helpers (formatBdtBangla, constants)
│   ├── App.tsx                 # Routes + providers
│   ├── main.tsx                # React root
│   └── index.css               # ⭐ Design tokens (HSL colors), gradients
├── supabase/
│   ├── config.toml             # Supabase project config
│   └── migrations/             # SQL migrations (timestamp-prefixed)
├── vercel.json                 # SPA rewrite — REQUIRED for deep links
├── tailwind.config.ts          # Tailwind theme extension
└── package.json
```

---

## 4. Where to Edit Common Things

| I want to change…                                | Edit this file                                      |
| ------------------------------------------------ | --------------------------------------------------- |
| Number of katha / shareholders / building floors | `src/config/project.ts`                             |
| App colors / theme                               | `src/index.css` (CSS vars) + `tailwind.config.ts`   |
| Sidebar menu items                               | `src/components/Layout.tsx` (`navItems` array)      |
| A page's UI/logic                                | `src/pages/<PageName>.tsx`                          |
| Database operations (insert/update/delete)       | `src/context/AppContext.tsx`                        |
| Receipt design / signatures                      | `src/components/PaymentReceipt.tsx`                 |
| Admin login credentials                          | `src/context/AuthContext.tsx`                       |
| PWA name / icons                                 | `public/manifest.json` + `index.html`               |
| Add a new database table or column               | Create a new SQL file under `supabase/migrations/`  |

---

## 5. Routing Map (`src/App.tsx`)

| Route                       | Page                  | Access            |
| --------------------------- | --------------------- | ----------------- |
| `/`                         | Dashboard             | Public (read)     |
| `/shareholders`             | Shareholders list     | Public (read)     |
| `/shareholders/:id`         | ShareholderDetail     | Public (read), slip images admin-only |
| `/payments`                 | Payments              | Public (read), slips admin-only       |
| `/installments`             | Installments          | Public (read), slips admin-only       |
| `/rental`                   | Rental Income         | Public (read)     |
| `/expenses`                 | Public Expenses       | Public (read)     |
| `/notifications`            | Notifications         | Public (read)     |
| `/project`                  | Project Details       | Public            |
| `/directors`                | Directors             | Public (read)     |
| `/director-sales`           | Director Sales report | 🔒 Admin only     |
| `/admin-expenses`           | Private Expenses      | 🔒 Admin only     |
| `/portal/:id?token=xxx`     | Per-shareholder portal| Public via token  |
| `/login`                    | Admin login           | Public            |

**Write actions** (add/edit/delete) are gated by `isAdmin` everywhere.

---

## 6. Authentication Model

- Static admin credentials (single admin: `admin@uttaravilas.com`).
- `AuthContext` exposes `isAdmin`, `signIn`, `signOut`, `user`.
- All write buttons / dialogs are wrapped in `{isAdmin && <...>}`.
- Database RLS is permissive (read+write open) since gating is client-side. **If multi-admin or stricter security is later required, migrate to Supabase Auth and tighten RLS.**

---

## 7. Data Layer — `src/context/AppContext.tsx`

This is the heart of the app. **Every read and write goes through this file.**

It exposes a single `useApp()` hook returning:

- **Data arrays:** `shareholders`, `payments`, `installments`, `expenses`, `notifications`, `directors`, `rentalCollections`
- **Settings:** `settings` (key/value), `rentalConfig`
- **Mutations:** `addShareholder`, `updateShareholder`, `deleteShareholder`, `addPayment`, `deletePayment`, `addInstallment`, `deleteInstallment`, `addExpense`, `deleteExpense`, `addRentalCollection`, `deleteRentalCollection`, `updateRentalConfig`, `markNotificationRead`, etc.
- **Helpers:** loading state, derived totals.

All Supabase calls live here. Pages should never import `supabase` directly — they import `useApp()`.

---

## 8. Database Schema (PostgreSQL)

Defined via migrations in `supabase/migrations/`. Key tables:

| Table                | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `shareholders`       | People holding shares (name, phone, num_shares, profile_image_url, portal_token, referred_by_director_id) |
| `payments`           | Booking + installment payments with bank slip URL, receipt_no |
| `installments`       | Monthly installment records (per shareholder, unique month+year) |
| `expenses`           | Public project expenses                              |
| `private_expenses`   | Admin-only expenses                                  |
| `notifications`      | System notifications (e.g., payment received)        |
| `activities`         | Audit log of admin actions                           |
| `directors`          | 5 directors with name, role, image, signature_url    |
| `rental_config`      | Rooms, shops, rent per unit, target months           |
| `rental_collections` | Monthly rental income records                        |
| `app_settings`       | Key/value config (installment_amount, installment_months, etc.) |

⚠️ Never edit `src/integrations/supabase/types.ts` — it auto-regenerates after migrations.

---

## 9. Storage Buckets (Supabase Storage)

| Bucket                | Used for                                  |
| --------------------- | ----------------------------------------- |
| `payment-screenshots` | Bank transfer slips for payments / installments / rental |
| `profile-images`      | Shareholder profile pictures              |
| `director-images`     | Director portrait photos                  |
| `director-signatures` | Director signature PNGs (used on receipts)|

Upload helper: `uploadImage(bucket, file, folder?)` from `src/lib/storage.ts`.

---

## 10. Design System

- **Always use semantic tokens** (`text-foreground`, `bg-primary`, `border-border`, etc.). Never hardcode colors like `text-white` or `bg-black` in components.
- All color values are HSL inside `src/index.css` `:root { ... }` and `.dark { ... }`.
- Tailwind is configured in `tailwind.config.ts` to read those CSS vars.
- Gradients (`gradient-primary`, `gradient-hero`) are defined as Tailwind utilities.
- Bengali numerals: use `formatBdtBangla(amount)` from `src/types/index.ts`.

---

## 11. Receipt System (`PaymentReceipt.tsx`)

When admin adds a payment, an auto-generated receipt is available:

- Receipt number is auto-incremented and stored in `payments.receipt_no`.
- Component renders an on-screen preview AND opens a self-contained HTML window for **Print** / **Download PDF** with identical styling (inline CSS, no external dependencies).
- Director signatures: if `signature_url` is uploaded for a director, image appears; otherwise a blank signature line + name is shown. Upload signatures via `/directors`.

---

## 12. PWA / Installable App

- `public/manifest.json` declares app name, icons, theme color.
- `index.html` has the `<link rel="manifest">` and mobile meta tags.
- Users open the site in Chrome/Safari and tap **"Add to Home Screen"** (or browser install prompt) → app installs with offline shell + real-time updates.
- For native APK: wrap with Capacitor (`npx cap add android`) — not currently set up.

---

## 13. Hosting & Deployment

- **Production host:** Vercel.
- **Required:** `vercel.json` contains an SPA rewrite so deep links (`/portal/abc?token=xyz`) don't 404:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- Code is pushed to GitHub → Vercel auto-deploys on `main` branch.
- Lovable Cloud (Supabase) is deployed automatically — migrations apply when committed under `supabase/migrations/`.

---

## 14. Local Development

```bash
bun install        # or npm install
bun run dev        # starts Vite on http://localhost:8080
```

Environment variables come from `.env` (auto-managed by Lovable Cloud — do not edit manually):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SUPABASE_PROJECT_ID`

---

## 15. How to Add a New Feature (Recipe)

**Example: add a new "Maintenance Tasks" module.**

1. **Database:** Create a migration `supabase/migrations/<timestamp>_maintenance.sql` with `CREATE TABLE` + RLS policies. Commit — it auto-applies and regenerates types.
2. **Context:** In `src/context/AppContext.tsx` add `maintenance` state, a fetch in the initial load `useEffect`, and CRUD methods (`addMaintenance`, `deleteMaintenance`). Export them via `useApp()`.
3. **Page:** Create `src/pages/Maintenance.tsx`. Import `useApp()` + `useAuth()`. Gate write actions with `{isAdmin && ...}`.
4. **Route:** In `src/App.tsx` add `<Route path="/maintenance" element={<Maintenance />} />`.
5. **Sidebar:** In `src/components/Layout.tsx` add an entry to `navItems` (or `adminOnlyNavItems` if admin-only).
6. **Test:** Login as admin, create an entry, verify it persists after refresh.

---

## 16. Important Conventions

- **Never edit:** `src/integrations/supabase/client.ts`, `src/integrations/supabase/types.ts`, `.env`, `supabase/config.toml` project-level settings.
- **Currency:** Always use `formatBdtBangla()` for display; store raw numbers in DB.
- **Mobile-first:** Every page must work on 360px width. Use `grid-cols-2 sm:grid-cols-4` patterns and `truncate` long text.
- **Security:** Slip images are admin-only (privacy). Portal access requires `?token=xxx`.

---

## 17. Common Issues & Fixes

| Symptom                                   | Likely cause / Fix                                              |
| ----------------------------------------- | --------------------------------------------------------------- |
| Page horizontally scrolls on mobile       | Add `min-w-0 overflow-x-hidden` to flex container               |
| Deep link 404 on Vercel                   | `vercel.json` missing SPA rewrite                               |
| `types.ts` mismatched with DB             | A new migration wasn't applied — re-deploy / re-run Cloud sync  |
| Admin button not appearing                | Check `useAuth().isAdmin` is true; re-login                     |
| Image upload silently fails               | Bucket name typo or bucket not public                           |

---

## 18. Where to Get Help

- This doc → start here.
- `mem://` files → contain product/business decisions.
- Lovable chat → ask in plain language; the AI agent can navigate this codebase.

---

_Last updated: May 2026 — keep this file in sync when you change architecture._
