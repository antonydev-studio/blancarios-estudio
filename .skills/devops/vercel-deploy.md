# Skill: Vercel Deploy

## First-time setup

```bash
pnpm dlx vercel login
pnpm dlx vercel link      # link to Vercel project
pnpm dlx vercel env pull  # pull env vars to local .env
```

## Deploy commands

```bash
pnpm vercel dev           # local: localhost:3000
pnpm vercel deploy        # preview deployment
pnpm vercel deploy --prod # production deployment
pnpm vercel rollback      # revert to previous production
```

## View logs

```bash
pnpm vercel logs <deployment-url> --follow
```

## Project config (vercel.json at root)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Vercel auto-detects `api/` directory as Serverless Functions.
No explicit function config needed.

## Build config (auto-detected for Vite)

Vercel reads `package.json` scripts:
- Build command: `vite build` (or `pnpm run build`)
- Output directory: `dist`
- Install command: `pnpm install`

## Node.js runtime

Add to `package.json`:
```json
{
  "engines": { "node": ">=22" }
}
```

## Environment variables

Set in Vercel dashboard → Project → Settings → Environment Variables.
Required for this project:
- `MONGO_URI`
- `JWT_SECRET`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `FRONTEND_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
