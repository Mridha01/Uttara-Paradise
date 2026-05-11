/**
 * 🏢 UTTARA VILAS — Project Configuration
 * ============================================
 * এই ফাইলে প্রজেক্টের সব নাম্বার ও তথ্য আছে।
 * ভবিষ্যতে কিছু পরিবর্তন করতে চাইলে শুধু এই ফাইল edit করো,
 * পুরো অ্যাপে অটোমেটিক change হয়ে যাবে।
 *
 * 👉 কোথায় change করবে?
 *   - Katha (জমির পরিমাণ): KATHA
 *   - মোট শেয়ারহোল্ডার সংখ্যা: TOTAL_SHAREHOLDERS
 *   - বিল্ডিং ডিজাইন: BUILDING
 *   - প্রজেক্টের নাম: PROJECT_NAME / PROJECT_NAME_BN
 *
 * Production deploy: GitHub-এ commit + push → Vercel auto-deploy 🚀
 */

export const PROJECT = {
  // ── Project Identity ───────────────────────────
  name: 'UTTARA PARADISE',
  nameBn: 'উত্তরা প্যারাডাইস',
  tagline: 'Real Estate Share Project',

  // ── Building & Land Details ────────────────────
  building: 'B+G+14',          // ✏️ পরিবর্তন করতে এখানে edit করো
  katha: 14,                   // ✏️ জমির পরিমাণ (katha)
  totalShareholders: 100,       // ✏️ মোট শেয়ারহোল্ডার সংখ্যা
  totalSharesAvailable: 75,    // ✏️ ডিরেক্টরদের বিক্রি করার জন্য মোট শেয়ার

  // ── Address ────────────────────────────────────
  address: 'Mudafa, Nishat Nagar, Tongi, Gazipur',

  // ── Receipt Footer ─────────────────────────────
  receiptFooter: 'This is a computer-generated receipt. Verify online via the shareholder portal.',
} as const;

/** Convenient combined building line for headers / receipts */
export const BUILDING_LINE = `${PROJECT.building} Building • ${PROJECT.katha} Katha • ${PROJECT.totalShareholders} Shareholders`;
