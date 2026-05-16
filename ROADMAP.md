# ROADMAP.md — Barber BR (Blanca Ríos Estudio)

**Production URL:** https://blancarios-estudio.vercel.app  
**Version:** 1.1.0  
**Status:** ✅ Production — fully validated  
**Last milestone:** 2026-05-15

---

## ✅ v1.1.0 — Complete (2026-05-15)

### Infrastructure Migration
- [x] Unified fullstack layout (removed `backend/` + `frontend/` subdirs)
- [x] Single `package.json` + `pnpm-lock.yaml` at root
- [x] Vercel Serverless Functions — all 7 API groups migrated from Express/Railway
- [x] Railway proxy removed from `vercel.json`
- [x] Cached MongoDB connection (`lib/mongoose.js`, `global.mongoose`)
- [x] All 6 Mongoose models have guard pattern (`mongoose.models.X || mongoose.model(...)`)
- [x] `express-rate-limit` removed — no Express in serverless handlers
- [x] vercel.json SPA rewrite uses negative lookahead (prevents CDN caching API routes)

### API (Vercel Functions)
- [x] `api/auth` — 8 endpoints including email verification and password recovery
- [x] `api/appointments` — public booking, occupied slots, client history, admin CRUD
- [x] `api/services` — public catalog read, admin CRUD
- [x] `api/config` — public read, admin update (schedule, blocked days, buffer)
- [x] `api/users` — admin CRUD
- [x] `api/movements` — admin financial tracking (auto-created on finalization)
- [x] `api/blocked-clients` — admin phone blacklist management
- [x] 12 functions exactly (Vercel Hobby plan limit)

### Production Validation (Playwright)
- [x] 104 automated tests, 0 failures (chromium)
- [x] Smoke tests — homepage, services, navigation, booking page
- [x] E2E tests — auth forms, booking flow, protected routes, admin form
- [x] Mutation validation — real appointment creation, conflict detection, occupied slots
- [x] Auth API validation — all error paths, forgot password, code verification
- [x] Admin panel validation — login, read endpoints, service CRUD (with live credentials)
- [x] Business logic validation — past dates, blocked days, closed weekdays, out-of-hours
- [x] Cleanup script — `scripts/cleanup-test-data.js`
- [x] `FINAL_VALIDATION.md` — complete validation map

---

## ✅ v1.0.0 — Complete

### Client Portal
- [x] Guest booking (no account required)
- [x] Account booking with auto-linking by phone number
- [x] Appointment history
- [x] Cancellation (>1h before appointment)
- [x] Rescheduling (>3h before, once only)
- [x] Phone blacklist detection

### Auth
- [x] Registration with 6-digit email verification
- [x] Login with JWT (7-day expiry)
- [x] 3-step password recovery (email → code → new password)
- [x] Role-based route protection (requireAuth, requireAdmin)

### Admin Panel
- [x] Dashboard KPIs (appointments today/week/month)
- [x] Visual appointment calendar
- [x] Appointment management (confirm, finalize, cancel, admin notes)
- [x] Service catalog CRUD
- [x] Weekly schedule configuration (per weekday)
- [x] Blocked days and specific blocked hours
- [x] Exception open days
- [x] Buffer time between appointments
- [x] Client management (notes, blacklist toggle)
- [x] Financial movements (income/expense tracking)
- [x] Reports by period
- [x] Homepage content editor (hero image, featured services, reasons)

### Business Logic
- [x] Overlap conflict detection with buffer enforcement
- [x] Mexico City timezone handling (UTC-6 fixed, no DST since 2023)
- [x] Phone number normalization for consistent blacklist matching
- [x] Admin email notifications on booking/cancellation/rescheduling

---

## 📋 v1.2+ Backlog

| Feature | Priority | Notes |
|---------|----------|-------|
| Client confirmation email | High | Notify client when admin confirms their appointment |
| Appointment reminder | High | 24h before via Vercel Cron Jobs |
| Firefox browser in Playwright | Medium | Add to `playwright.config.ts` projects |
| WebKit (Safari) testing | Low | Needs system libs on Arch Linux: `libicu74 libxml2 libwoff1` |
| Export reports to PDF | Low | Admin panel reports section |
| PWA manifest | Low | `manifest.json` scaffolding exists |
| Authenticated E2E flows | Medium | Client cancel/reschedule flows need test account |
| Admin UI Playwright tests | Medium | Clicking through admin tabs (needs label audit) |
| Phone blacklist E2E test | Medium | Requires creating a test blocked-client via API |

---

## Known Technical Debt

| Item | Impact | Notes |
|------|--------|-------|
| `blocked-clients` non-standard response | Low | Returns `{ ok: true, data }` instead of `{ blockedClients }` |
| No unit tests for slot algorithm | Medium | `utils/slots.js`, `appointmentController.hayConflicto` untested |
| No seed script for dev data | Low | Admin must manually create services/config after fresh deploy |
| Vercel Hobby function limit | Medium | At exactly 12/12 — new api groups require plan upgrade |
| Human-only validation flows | Low | Email verification, appointment status changes (not automatable) |

---

## Version History

| Version | Date | Status | Description |
|---------|------|--------|-------------|
| 1.0.0 | 2025 | ✅ Production | Full booking platform on Express + Railway |
| 1.1.0 | 2026-05-15 | ✅ Production | Vercel Functions migration + unified structure + Playwright QA |
| 1.2.0 | TBD | 📋 Planned | Reminders, PDF export, auth E2E tests |
