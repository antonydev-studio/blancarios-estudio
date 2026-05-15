# Workflow: Deploy to Vercel

## Pre-deploy

1. Run `.claude/workflows/production-checklist.md`
2. Confirm `.env` vars set in Vercel dashboard
3. Confirm `pnpm-lock.yaml` committed

## Commands

```bash
pnpm vercel deploy         # preview
pnpm vercel deploy --prod  # production
```

## Post-deploy validation

1. Homepage loads
2. GET /api/services → 200
3. POST /api/auth/login → 200
4. POST /api/appointments → 201
5. GET /api/appointments (admin token) → 200
6. Check Vercel Function logs for errors

## Required env vars in Vercel dashboard

```
MONGO_URI
JWT_SECRET
RESEND_API_KEY
EMAIL_FROM
FRONTEND_URL=https://blancariosestudio.com
ADMIN_EMAIL
ADMIN_PASSWORD
```

## Rollback

```bash
pnpm vercel rollback
```

## Railway cutover (one-time)

1. Deploy Vercel prod + validate all endpoints
2. Update `FRONTEND_URL` in Vercel env
3. Switch frontend API base URL to Vercel domain
4. Redeploy frontend
5. Confirm flow: register → verify → login → book → admin manages
6. Disable Railway
