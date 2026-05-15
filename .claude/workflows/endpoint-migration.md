# Workflow: Express → Vercel Functions Migration

## Migration order (from AGENTS.md)

1. `lib/mongoose.js` — cached connection
2. `api/config/[...path].js` — simplest, GET + PATCH
3. `api/services/[...path].js`
4. `api/auth/[...path].js` — 8 endpoints, most complex
5. `api/appointments/[...path].js` — `/occupied` MUST route before `/:id`
6. `api/movements/[...path].js`
7. `api/users/[...path].js`
8. Update `vercel.json`
9. Remove `express-rate-limit`
10. `pnpm install` to clean lockfile

## Per-endpoint steps

1. Read existing Express controller in `controllers/`
2. Do NOT modify controller logic
3. Create `api/[group]/[...path].js` using handler template
4. Parse path: `req.url.replace(/^\/api\/group/, "").replace(/\?.*/, "")`
5. Extract id: `path.match(/^\/([^/]+)$/)?.[1]`
6. Route by method + path — specific routes before catch-alls
7. Apply `requireAuth`/`requireAdmin` middleware inline
8. End with `res.status(405)`

## Route ordering — critical

```js
// WRONG — id route catches /occupied
if (req.method === "GET" && id)    return ...  // catches "occupied"
if (req.method === "GET" && path === "/occupied")  return ...  // never reached

// CORRECT — specific before general
if (req.method === "GET" && path === "/occupied") return getOccupied(req, res);
if (req.method === "GET" && path === "/mias")     return requireAuth(req, res, () => getMias(req, res));
if (req.method === "GET" && !id)                  return requireAdmin(req, res, () => getAll(req, res));
if (req.method === "GET" && id)                   return requireAdmin(req, res, () => getOne(req, res));
```

## Checklist per endpoint

- [ ] `await connectDB()` at top
- [ ] Path parsing correct
- [ ] All original routes covered
- [ ] Auth middleware applied correctly
- [ ] 405 fallthrough at end
- [ ] No Express imports
- [ ] Fire-and-forget emails
