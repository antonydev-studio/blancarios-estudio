# Napkin Runbook — Barber BR

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

---

## Execution & Validation (Highest Priority)

1. **[2026-05-15] Always `await connectDB()` first in every handler**
   Do instead: first line of every `api/*/[...path].js` handler must be `await connectDB()`.

2. **[2026-05-15] Route order: specific before id catch-all**
   Do instead: put `/occupied`, `/mias`, `/sesion` routes BEFORE `/:id` pattern — wrong order silently shadows routes.

3. **[2026-05-15] Mongoose model guard on warm invocations**
   Do instead: always `mongoose.models.X || mongoose.model("X", schema)` — never bare `mongoose.model()`.

4. **[2026-05-15] `req.params.id` doesn't exist in Vercel Functions**
   Do instead: parse id from URL `path.match(/^\/([^/]+)$/)?.[1]` and attach `req.params = { id }` before calling controller.

5. **[2026-05-15] Query strings need manual parsing in Vercel**
   Do instead: `new URL(req.url, "http://localhost").searchParams.get("fecha")` — not `req.query`.

6. **[2026-05-15] Fire-and-forget emails — never await**
   Do instead: `emailService.send(data).catch(() => {})` — awaiting blocks response and fails on email errors.

---

## Shell & Command Reliability

1. **[2026-05-15] pnpm only — no npm/npx/yarn anywhere**
   Do instead: `pnpm install`, `pnpm add`, `pnpm dlx` — reject any `npm`/`npx`/`yarn` suggestion.

2. **[2026-05-15] Local dev runs via Vercel CLI**
   Do instead: `pnpm vercel dev` — not `pnpm dev` alone (that only starts Vite, not functions).

3. **[2026-05-15] ES Modules — explicit .js extension required**
   Do instead: `import { x } from "./utils/x.js"` — Vercel Node.js ESM requires explicit extension.

---

## Domain Behavior Guardrails

1. **[2026-05-15] Frozen files — never touch**
   Do instead: `AuthContext.jsx`, `vite.config.js`, `index.html`, model schemas, `emailService.js` — move only, never edit logic.

2. **[2026-05-15] API error messages always in Spanish**
   Do instead: `{ mensaje: "No encontrado." }` — never `{ error: "..." }` or `{ message: "..." }`.

3. **[2026-05-15] appointments `/occupied` must route before `/:id`**
   Do instead: check `path === "/occupied"` as first GET branch — "occupied" gets mistakenly captured by id pattern otherwise.

4. **[2026-05-15] Config is singleton — no id routing needed**
   Do instead: `api/config/[...path].js` only needs GET and PATCH at root path — no id parsing needed.

5. **[2026-05-15] Atlas M0: no transactions, no $lookup on large collections**
   Do instead: use simple find/update queries — M0 free tier has no replica set transactions.

---

## Community Skills — Conflicts

1. **[2026-05-15] `vercel-functions` skill expects named exports (GET, POST) — this project uses `export default function handler`**
   Do instead: use `.skills/project/vercel-handler.md` template, ignore that specific rule from the community skill.

2. **[2026-05-15] `mongoose-mongodb` skill uses `require()` and deprecated options — override with project conventions**
   Do instead: use `import/export` (ES Modules), no `useNewUrlParser`/`useUnifiedTopology` (removed in Mongoose 7+), use `.skills/project/mongodb-connection.md`.

3. **[2026-05-15] Find skills before implementing: `pnpm dlx skills find "query"`**
   Do instead: always search skills.sh first for community skills, check installs + source quality before installing.

---

## Part 1 Status (Completed 2026-05-15)

1. **[2026-05-15] Part 1 restructure COMPLETE — unified fullstack at root**
   - `controllers/`, `models/`, `middleware/`, `services/`, `utils/`, `scripts/` moved from `backend/src/`
   - `src/`, `public/`, `index.html`, `vite.config.js`, `eslint.config.js`, `postcss.config.js` moved from `frontend/`
   - Single `package.json` + `pnpm-lock.yaml` at root
   - `pnpm build` passes (84 modules, no errors)
   - Remaining: `backend/src/index.js` + `backend/src/routes/` intentionally kept as reference for Part 2

2. **[2026-05-15] Mongoose model guard NOT yet added to models/ — add in Part 2**
   Do instead: all `models/*.js` use bare `mongoose.model("X", schema)` — must change to `mongoose.models.X || mongoose.model("X", schema)` before Vercel Functions are live.

3. **[2026-05-15] vercel.json still has Railway proxy — update in Part 2**
   Do instead: keep Railway rewrite until Vercel Functions created; then replace with `{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }`.

4. **[2026-05-15] vite.config.js proxy removed — use `pnpm vercel dev` for local API**
   Do instead: `pnpm vercel dev` serves frontend + functions on port 3000 — no proxy needed.

---

## User Directives

1. **[2026-05-15] pnpm is non-negotiable — enforce in every response**
   Do instead: reject npm/yarn/bun suggestions immediately, always write pnpm.

2. **[2026-05-15] Caveman mode active — terse output**
   Do instead: drop articles, fillers, pleasantries — fragments OK, technical terms exact.

3. **[2026-05-15] Check .skills/ before implementing anything**
   Do instead: read `.skills/global/registry.md` first, load relevant skill file, follow recipe.

4. **[2026-05-15] Use cavecrew subagents for investigation + surgical edits**
   Do instead: spawn `cavecrew-investigator` to locate code, `cavecrew-builder` for 1-2 file edits, `cavecrew-reviewer` for diff review.
