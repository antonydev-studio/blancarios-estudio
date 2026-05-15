# Skill: Express → Vercel Functions Migration

## Migration map

| Express pattern | Vercel equivalent |
|----------------|-------------------|
| `router.get("/", handler)` | `if (req.method === "GET" && !id)` |
| `router.get("/:id", handler)` | `if (req.method === "GET" && id)` |
| `router.post("/", handler)` | `if (req.method === "POST" && !id)` |
| `router.patch("/:id", handler)` | `if (req.method === "PATCH" && id)` |
| `router.delete("/:id", handler)` | `if (req.method === "DELETE" && id)` |
| `req.params.id` | `id` (parsed from URL) |
| `req.query.fecha` | `new URL(req.url, "http://x").searchParams.get("fecha")` |
| `authMiddleware, handler` | `requireAuth(req, res, () => handler(req, res))` |
| `express.json()` | already parsed by Vercel |
| `express-rate-limit` | remove — not needed |
| `cors()` | remove — Vercel handles via `vercel.json` |
| `app.listen()` | remove — no server |

## Step-by-step for each group

### 1. Create `api/[group]/[...path].js`

```js
import { connectDB } from "../../lib/mongoose.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import {
  getAll, getOne, create, update, remove
} from "../../controllers/groupController.js";

export default async function handler(req, res) {
  await connectDB();

  const path = req.url.replace(/^\/api\/group/, "").replace(/\?.*/, "");
  const id   = path.match(/^\/([^/]+)$/)?.[1];

  // SPECIFIC routes first, then general
  if (req.method === "GET"    && !id) return getAll(req, res);
  if (req.method === "POST"   && !id) return requireAdmin(req, res, () => create(req, res));
  if (req.method === "PATCH"  && id)  return requireAdmin(req, res, () => update(req, res));
  if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => remove(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
```

### 2. Replace `req.params.id` in controller

Controller still receives `req`, `res`. Pass id via `req.params` simulation:

Option A — add to req before calling controller:
```js
req.params = { id };
return requireAdmin(req, res, () => update(req, res));
```

Option B — parse in controller:
```js
const id = req.url.match(/\/([^/?]+)(?:\?|$)/)?.[1];
```

### 3. Replace `req.query.*`

```js
// Express: req.query.fecha
// Vercel:
const { searchParams } = new URL(req.url, "http://localhost");
const fecha = searchParams.get("fecha");
```

### 4. Remove from package.json

```json
// Remove:
"express": "...",
"express-rate-limit": "...",
"cors": "...",
"nodemon": "..."
```

### 5. Appointments — critical route order

```js
// /occupied must come before /:id
if (req.method === "GET" && path === "/occupied")      return getOccupied(req, res);
if (req.method === "GET" && path === "/mias")          return requireAuth(req, res, () => getMias(req, res));
if (req.method === "PATCH" && path.startsWith("/mias/")) return requireAuth(req, res, () => cancelMia(req, res));
if (req.method === "GET"    && !id)                    return requireAdmin(req, res, () => getAll(req, res));
if (req.method === "PATCH"  && id)                     return requireAdmin(req, res, () => update(req, res));
if (req.method === "DELETE" && id)                     return requireAdmin(req, res, () => remove(req, res));
if (req.method === "POST"   && !id)                    return create(req, res);
```

## Checklist after each migration

- [ ] `await connectDB()` at top
- [ ] All original routes covered
- [ ] Route order: specific before general
- [ ] `req.params.id` replaced
- [ ] `req.query.*` replaced
- [ ] Auth middleware applied correctly
- [ ] `405` fallthrough at end
- [ ] No Express/cors/rate-limit imports
- [ ] Fire-and-forget emails
