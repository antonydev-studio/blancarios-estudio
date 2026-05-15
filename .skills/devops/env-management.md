# Skill: Environment Variable Management

## .env (local, never commit)

```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=at-least-32-random-characters-here
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=Blanca Ríos Estudio <noreply@blancariosestudio.com>
FRONTEND_URL=https://blancariosestudio.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=strong_password_here
```

## .env.example (commit this)

```env
MONGO_URI=mongodb+srv://USER:PASS@cluster.mongodb.net/DBNAME
JWT_SECRET=RANDOM_STRING_MIN_32_CHARS
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=Studio Name <noreply@yourdomain.com>
FRONTEND_URL=https://yourdomain.com
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
```

## .gitignore must include

```
.env
.env.local
.env.*.local
node_modules/
dist/
.vercel/
```

## Vercel dashboard setup

1. Go to vercel.com → project → Settings → Environment Variables
2. Add each var for Production + Preview + Development
3. Redeploy after adding vars

## Pull env from Vercel to local

```bash
pnpm dlx vercel env pull .env
```

## Frontend env vars (accessible in browser)

Must be prefixed with `VITE_`:
```env
VITE_API_URL=https://yourapp.vercel.app
```

Access in React:
```js
const apiUrl = import.meta.env.VITE_API_URL;
```

Server-only vars (no `VITE_` prefix) are NOT exposed to browser.
