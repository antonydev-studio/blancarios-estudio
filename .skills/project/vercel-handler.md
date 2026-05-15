# Skill: Vercel Handler Recipe

## Template — copy and adapt

```js
// api/[group]/[...path].js
import { connectDB } from "../../lib/mongoose.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import {
  getAll,
  getOne,
  create,
  update,
  remove
} from "../../controllers/groupController.js";

export default async function handler(req, res) {
  await connectDB();

  const path = req.url.replace(/^\/api\/GROUP_NAME/, "").replace(/\?.*/, "");
  const id   = path.match(/^\/([^/]+)$/)?.[1];

  if (req.method === "GET"    && !id) return getAll(req, res);
  if (req.method === "GET"    && id)  return requireAdmin(req, res, () => getOne(req, res));
  if (req.method === "POST"   && !id) return requireAdmin(req, res, () => create(req, res));
  if (req.method === "PATCH"  && id)  return requireAdmin(req, res, () => update(req, res));
  if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => remove(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
```

## Passing id to controller

```js
// Before calling controller that needs the id:
req.params = { id };
return requireAdmin(req, res, () => update(req, res));
```

## Query string parsing

```js
const { searchParams } = new URL(req.url, "http://localhost");
const fecha = searchParams.get("fecha");
const periodo = searchParams.get("periodo");
```

## Middleware inline

```js
// Public endpoint — no middleware
if (req.method === "GET" && !id) return getAll(req, res);

// Auth required
if (req.method === "GET" && path === "/mias")
  return requireAuth(req, res, () => getMias(req, res));

// Admin required
if (req.method === "DELETE" && id)
  return requireAdmin(req, res, () => remove(req, res));
```
