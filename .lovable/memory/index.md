# Project Memory

## Core
Uttara Paradise (উত্তরা প্যারাডাইস): Real Estate Share Management System (B+G+13 on 14 katha, 91 shares).
Lovable Cloud for DB & Storage. Static admin auth (admin@uttaravilas.com).
All data persistent in database. Images stored in storage buckets.
Multiple shares per shareholder (num_shares field). Installment module active.
Rental Income module tracks monthly land rental revenue (rooms+shops, configurable).

## Memories
- [Business Logic & Constraints](mem://business/logic-constraints) — Financial formulas, share limits (৳550k value, ৳50k booking), and project cost targets
- [Payment Verification](mem://features/payment-verification) — Manual admin workflow for uploading bank transfer proofs
- [Project Details](mem://features/project-details) — Fully editable sections (hero, location, overview, features, income, why, timeline) via project_content table
- [Shareholder Management](mem://features/shareholder-management) — Pagination (12/page) and cascading deletes for payment records
- [Payment System](mem://features/payment-system) — Recalculations on delete, clickable transaction slips, multi-share booking max with "Use max" helper
- [Directors Page](mem://features/directors) — Card-based UI (circle on list, square on popup), DB-backed with image upload
- [Access Control](mem://auth/access-control) — Static admin auth, client-side gating, permissive RLS
- [Installment Module](mem://features/installments) — Monthly collection (default ৳5000), 24-month target, per-shareholder tracking, popup shows screenshots
- [Rental Income Module](mem://features/rental-income) — Editable rooms/shops/rent config, monthly collection records, dashboard widget
- [Database Schema](mem://data/schema) — Tables: shareholders, payments, expenses, notifications, activities, directors, installments, project_settings, project_content, rental_config, rental_collections
