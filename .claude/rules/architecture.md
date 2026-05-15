# Rule: Architecture

## Folder structure — non-negotiable

```
api/[group]/[...path].js   # Vercel Functions (one catch-all per group)
src/                        # React frontend
models/                     # Mongoose schemas
controllers/                # Business logic
middleware/                 # auth.js only
services/                   # emailService.js
utils/                      # validators, slots, passwordUtils
lib/                        # mongoose.js (cached connection)
scripts/                    # one-off scripts
public/                     # static assets
```

## Constraints

- One `package.json` at root — zero nested package.json files
- One `pnpm-lock.yaml` at root — no `package-lock.json` anywhere
- One `vercel.json` at root
- One `vite.config.js` at root
- No `backend/` or `frontend/` subdirectories
- No `node_modules/` at backend/ or frontend/
- No Express server files — serverless only

## Import rules

- Always use relative imports with explicit `.js` extension
- Example: `import { connectDB } from "../../lib/mongoose.js"`
- Never import from `node_modules` paths directly in api handlers without package.json declaring them

## Handler structure

Every `api/[group]/[...path].js` MUST:
1. `await connectDB()` first
2. Parse path and id from `req.url`
3. Route by method + path presence
4. Return `405` for unmatched routes
