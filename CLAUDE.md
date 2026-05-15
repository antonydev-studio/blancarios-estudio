# CLAUDE.md — Barber BR (Blanca Ríos Estudio)

Read AGENTS.md, ARCHITECTURE.md, and ROADMAP.md before ANY action.

---

## Global Skills — Always Active

These skills are installed globally and fire automatically:

| Skill | Behavior |
|-------|----------|
| **napkin** | Read `.claude/napkin.md` FIRST every session. Apply silently. Update it with new reusable findings. |
| **caveman** | Terse output. Drop articles/fillers. Fragments OK. Active every response. |
| **commit-suggest** | Append `git commit -m "..."` at end of every response with file changes. |
| **cavecrew** | Delegate to subagents to save context. See delegation rules below. |

### Cavecrew Delegation — When to Use

| Task | Agent |
|------|-------|
| "Where is X defined / what calls Y" | `cavecrew-investigator` |
| Surgical edit ≤2 files, scope obvious | `cavecrew-builder` |
| Review diff, file, or branch for bugs | `cavecrew-reviewer` |
| New feature / 3+ files / cross-cutting | Main thread |

**Why:** cavecrew output is ~60% smaller than vanilla agents — main context lasts longer.

---

## Stack

- React 19 + Vite + Tailwind CSS 4
- Vercel Serverless Functions (Node.js 22)
- MongoDB Atlas M0 + Mongoose
- JWT + bcrypt auth
- Resend email
- **pnpm ONLY**

---

## Absolute Rules

1. **pnpm only** — `npm`, `npx`, `yarn`, `bun` PROHIBITED
2. **ES Modules only** — `import/export`; `require()` PROHIBITED
3. **async/await only** — no callbacks, no `.then()` chains
4. **No comments** unless WHY is non-obvious
5. **No extra abstractions** — implement exactly what is asked
6. **API responses** — follow format in AGENTS.md exactly
7. **Serverless-safe** — no in-memory state, always `await connectDB()`

---

## Skill Discovery Protocol

Before ANY implementation:
1. **Read `.claude/napkin.md`** — apply critical project knowledge
2. **Check `.skills/global/registry.md`** — find matching skill
3. **Load skill file** — follow recipe exactly
4. **Check `.claude/workflows/`** — find applicable workflow
5. **Reuse before implementing from scratch**

---

## Active Rules

| File | Scope |
|------|-------|
| `.claude/rules/architecture.md` | structural constraints |
| `.claude/rules/pnpm.md` | package manager enforcement |
| `.claude/rules/vercel.md` | serverless/Vercel constraints |
| `.claude/rules/react.md` | React 19 conventions |
| `.claude/rules/mongodb.md` | DB patterns |
| `.claude/rules/api-standards.md` | response format |
| `.claude/rules/code-quality.md` | quality standards |
| `.claude/rules/performance.md` | perf constraints |

---

## Active Workflows

| File | Use when |
|------|----------|
| `.claude/workflows/feature.md` | adding new feature |
| `.claude/workflows/endpoint-migration.md` | migrating Express → Vercel |
| `.claude/workflows/refactor.md` | refactoring existing code |
| `.claude/workflows/debug.md` | diagnosing bugs |
| `.claude/workflows/deploy.md` | deploying to Vercel |
| `.claude/workflows/production-checklist.md` | pre-deploy validation |

---

## Project Skills Registry

`.skills/global/registry.md` — master index of all available project skills.

Critical skills for v1.1 migration:
- `.skills/migrations/express-to-vercel.md` — **start here for Parte 2**
- `.skills/project/vercel-handler.md` — handler template
- `.skills/project/api-route-pattern.md` — route ordering rules
- `.skills/project/mongodb-connection.md` — cached connection pattern
- `.skills/project/appointment-conflict.md` — conflict algorithm

---

## Local Dev

```bash
pnpm install
pnpm vercel dev    # localhost:3000 — frontend + functions unified
```
