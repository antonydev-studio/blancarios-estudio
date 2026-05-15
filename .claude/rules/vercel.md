# Rule: Vercel Functions

## Handler template — copy exactly

```js
// api/[group]/[...path].js
import { connectDB } from "../../lib/mongoose.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import { getX, createX, updateX, deleteX } from "../../controllers/xController.js";

export default async function handler(req, res) {
  await connectDB();

  const path = req.url.replace(/^\/api\/group/, "").replace(/\?.*/, "");
  const id   = path.match(/^\/([^/]+)$/)?.[1];

  if (req.method === "GET"    && !id) return getX(req, res);
  if (req.method === "POST"   && !id) return requireAdmin(req, res, () => createX(req, res));
  if (req.method === "PATCH"  && id)  return requireAdmin(req, res, () => updateX(req, res));
  if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => deleteX(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
```

## vercel.json — minimal, at root

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Vercel auto-detects `api/` as Functions. Do NOT add explicit function configs.

## Serverless constraints

- No `express`, `express-rate-limit`, or any HTTP framework in api handlers
- No in-memory singletons (except `global.mongoose` cache)
- No `process.exit()` in handlers
- No `setTimeout`/`setInterval` that outlast the request
- Cold-start friendly: imports at top, logic inside handler

## Environment variables

- Server-only: `MONGO_URI`, `JWT_SECRET`, `RESEND_API_KEY`, `EMAIL_FROM`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `FRONTEND_URL`
- Client-accessible: prefix with `VITE_`
- Never log secrets

## Local dev

```bash
pnpm vercel dev    # runs frontend + functions on localhost:3000
```

## Deployment

```bash
pnpm vercel deploy --prod
```
