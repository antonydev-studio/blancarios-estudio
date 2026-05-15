# AGENTS.md — AI Agent Instructions for Barber BR

Read ARCHITECTURE.md and ROADMAP.md before any action.  
Read `.claude/napkin.md` for live session-accumulated gotchas.

---

## Absolute Rules — Non-Negotiable

| Rule | Correct | Prohibited |
|------|---------|-----------|
| Package manager | `pnpm install`, `pnpm add`, `pnpm dlx` | `npm`, `npx`, `yarn`, `bun` |
| Module system | `import/export` | `require()`, `module.exports` |
| Async pattern | `async/await` | callbacks, `.then()` chains |
| Extensions | `import x from "./y.js"` | implicit extension omission |
| Environment | Node.js 22, Vercel serverless | Express, in-memory singletons |

If you find `package-lock.json` → delete it. If you find `yarn.lock` → delete it.

---

## Architecture Invariants

1. **`await connectDB()` is always the first line** of every Vercel Function handler
2. **Mongoose model guard** — always `mongoose.models.X || mongoose.model("X", schema)`
3. **Route order** — specific paths (`/occupied`, `/mias`, `/auto-finalizar`) BEFORE `/:id` catch-all
4. **`req.params.id` does not exist** in Vercel — parse from URL: `path.match(/^\/([^/]+)$/)?.[1]`
5. **`req.query` does not exist** — use `new URL(req.url, "http://localhost").searchParams`
6. **Emails are fire-and-forget** — `emailService.send(data).catch(() => {})` never `await`
7. **No transactions** on Atlas M0 — use simple find/update queries
8. **vercel.json rewrite** uses negative lookahead `/((?!api/).*)` — bare `/(.*) → /index.html` CDN-caches API paths

---

## API Response Format

```js
// Success
res.json({ appointment })              // singular
res.json({ appointments })             // array
res.status(201).json({ service })      // created

// Errors — Spanish, period at end, "mensaje" key always
res.status(400).json({ mensaje: "Mensaje descriptivo en español." })
res.status(401).json({ mensaje: "No autorizado." })
res.status(403).json({ mensaje: "Acceso denegado." })
res.status(404).json({ mensaje: "No encontrado." })
res.status(405).json({ mensaje: "Método no permitido." })
res.status(409).json({ mensaje: "Este horario ya no está disponible." })
res.status(500).json({ mensaje: "Error interno del servidor." })
```

**Exception:** `blocked-clients` controller returns `{ ok: true, data: [...] }` — do not "fix" this without checking all callers.

---

## Handler Template

```js
// api/[group]/[[...path]].js
import { connectDB } from "../../lib/mongoose.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import { getX, createX, updateX, deleteX } from "../../controllers/xController.js";

export default async function handler(req, res) {
  await connectDB();

  const path = req.url.replace(/^\/api\/group/, "").replace(/\?.*/, "");
  const id   = path.match(/^\/([^/]+)$/)?.[1];
  req.params = { id };

  if (req.method === "GET"    && !id) return getX(req, res);
  if (req.method === "POST"   && !id) return requireAdmin(req, res, () => createX(req, res));
  if (req.method === "PATCH"  && id)  return requireAdmin(req, res, () => updateX(req, res));
  if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => deleteX(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
```

---

## Controller Template

```js
export async function getX(req, res) {
  try {
    const item = await Model.findById(req.params.id).lean();
    if (!item) return res.status(404).json({ mensaje: "No encontrado." });
    res.json({ item });
  } catch {
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}
```

- `lean()` on all read-only queries
- `catch` takes no argument (avoids unused var lint)
- No `console.log` in production controllers

---

## Files — NEVER Modify

These files are frozen. Move only, never edit logic:

- `src/context/AuthContext.jsx`
- `vite.config.js`
- `index.html`
- `services/emailService.js`
- All `models/*.js` schemas (structure only — guard pattern is OK to add)

---

## Frontend Constraints

- SPA uses internal React state routing — all pages at `/`
- Navigation is via button clicks, not URL changes
- Tailwind CSS 4 — utility classes only, no inline `style=`
- React 19 — no Redux, no Zustand
- Mobile/desktop responsive: `md:hidden` and `hidden md:block` render components twice in DOM

---

## Testing Workflow

```bash
# Always-safe baseline
pnpm test:e2e:smoke

# Mutation tests (creates TEST QA FINAL data in prod)
pnpm test:e2e:validate

# Admin panel (requires credentials)
TEST_ADMIN_EMAIL=... TEST_ADMIN_PASSWORD=... \
  pnpm playwright test tests/validation/admin-panel.spec.ts

# Clean up test data after mutations
MONGO_URI=... pnpm test:cleanup
```

**Playwright gotchas:**
- `test.fail()` means "expect this test to fail" — use `test.skip(true, reason)` to abort mid-test
- `page.getByDisplayValue()` does not exist — use `expect(locator).toHaveValue("...")`
- Production returns 429 on repeated login attempts — always `expect([401, 429]).toContain(status)`
- `ServicePickerSection` renders twice (mobile + desktop) — use `.first()` / `.last()` based on viewport
- `getByRole()` skips hidden elements; CSS locators find all (including hidden DOM)

---

## Deployment Workflow

```bash
pnpm build              # verify build passes first
pnpm vercel deploy --prod
```

Vercel Hobby limit: 12 functions. Current count: 12 (exactly at limit). Do not add new api groups without removing an existing one or upgrading plan.

---

## Code Quality Rules

- No comments unless the WHY is non-obvious
- No docstrings or multi-line comment blocks
- No extra abstractions beyond what the task requires
- No defensive validation on internal code — only validate at system boundaries
- Variables: `PascalCase` models, `camelCase` everything else, `UPPER_SNAKE_CASE` constants
- File size: controllers ~150 lines max, handlers lean (routing only)

---

## Skill Discovery (Claude Code)

Before implementing anything:
1. Read `.claude/napkin.md` — apply silently
2. Check `.skills/global/registry.md` for matching skill
3. Check `.claude/workflows/` for applicable workflow
4. Reuse before implementing from scratch

Delegation:
- "Where is X?" → `cavecrew-investigator`
- Edit ≤2 files, scope obvious → `cavecrew-builder`
- Review diff/file → `cavecrew-reviewer`
- New feature / 3+ files → main thread
