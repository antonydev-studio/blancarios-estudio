# Barber BR — Blanca Ríos Estudio

Full-stack booking and management platform for a barbershop.  
Clients can book appointments online; admins manage the full operation from a dedicated panel.

**Production:** https://blancarios-estudio.vercel.app

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Backend | Vercel Serverless Functions (Node.js 22) |
| Database | MongoDB Atlas M0 (Mongoose 9) |
| Auth | JWT (7d) + bcrypt + email verification |
| Email | Resend |
| Package manager | pnpm (npm/npx/yarn prohibited) |
| Deploy | Vercel (frontend + backend unified) |

---

## Local Development

```bash
pnpm install
cp .env.example .env.local   # fill in all variables
pnpm vercel dev              # localhost:3000 — frontend + functions unified
```

Requires [Vercel CLI](https://vercel.com/docs/cli). The `pnpm vercel dev` command serves both the React frontend and all Vercel Functions on the same port.

---

## Environment Variables

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=minimum-32-char-random-string
RESEND_API_KEY=re_xxxx
EMAIL_FROM=Blanca Ríos Estudio <noreply@blancariosestudio.com>
FRONTEND_URL=https://blancariosestudio.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=...
```

---

## Testing

```bash
pnpm test:e2e:smoke      # non-destructive — always safe
pnpm test:e2e:validate   # mutation tests — creates TEST QA FINAL data in prod
pnpm test:cleanup        # clean up test data (requires MONGO_URI env var)
```

For admin panel tests:

```bash
TEST_ADMIN_EMAIL=... TEST_ADMIN_PASSWORD=... \
  pnpm playwright test tests/validation/admin-panel.spec.ts
```

See `FINAL_VALIDATION.md` for full validation status and `ARCHITECTURE.md` for complete technical documentation.

---

## Features

**Client Portal**
- Book appointments with or without an account
- 6-digit email verification on registration
- Appointment history, cancellation, rescheduling (once)
- Password recovery

**Admin Panel**
- Dashboard KPIs (today / week / month)
- Appointment management (confirm, finalize, cancel, notes)
- Service catalog CRUD
- Weekly schedule + blocked days + buffer time
- Client management with blacklist
- Financial movement tracking
- Reports by period
- Homepage content editor
