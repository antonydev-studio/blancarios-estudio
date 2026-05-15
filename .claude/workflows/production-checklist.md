# Workflow: Production Readiness Checklist

## Architecture

- [ ] Single `package.json` at root
- [ ] No `package-lock.json` anywhere in repo
- [ ] `pnpm-lock.yaml` committed at root
- [ ] No `backend/` or `frontend/` subdirectory with own `package.json`
- [ ] No `node_modules/` at backend/ or frontend/
- [ ] `.npmrc` at root with `engine-strict=true`

## Package manager

- [ ] Zero `npm`, `npx`, `yarn` in scripts
- [ ] Zero `npm`, `npx`, `yarn` in any `.md` or workflow doc
- [ ] All scripts use `pnpm` or no explicit PM prefix

## Vercel Functions

- [ ] Every `api/*/[...path].js` starts with `await connectDB()`
- [ ] Every handler ends with `res.status(405).json({ mensaje: "Método no permitido." })`
- [ ] No Express imports in any `api/` file
- [ ] No `express-rate-limit` in `package.json`
- [ ] `vercel.json` has SPA rewrite only
- [ ] All env vars set in Vercel dashboard

## MongoDB

- [ ] `lib/mongoose.js` uses `global.mongoose` cache
- [ ] `bufferCommands: false` set
- [ ] No `mongoose.connect()` outside `lib/mongoose.js`
- [ ] All models use `mongoose.models.X || mongoose.model(...)` pattern

## API contracts

- [ ] All error messages in Spanish with `mensaje` key
- [ ] Success responses use shorthand property names `{ appointment }`
- [ ] Email sends are fire-and-forget (no `await` on email calls)

## Frontend

- [ ] `VITE_` prefix on any client-exposed env vars
- [ ] No Railway URLs remaining in frontend code
- [ ] `AuthContext.jsx` untouched

## Security

- [ ] JWT_SECRET is random string ≥32 chars
- [ ] `.env` not committed (in `.gitignore`)
- [ ] `.env.example` committed with placeholder values
- [ ] No hardcoded credentials in source

## Full flow test

- [ ] Register new user → receive verification email
- [ ] Verify code → login succeeds
- [ ] Book appointment (as guest and as logged user)
- [ ] Admin: confirm, finalize, cancel appointment
- [ ] Admin: create/edit/delete service
- [ ] Admin: edit schedule config
- [ ] Forgot password flow end-to-end
