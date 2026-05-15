# CLAUDE.md — Barber BR (Blanca Ríos Estudio)

Read AGENTS.md, ARCHITECTURE.md, and ROADMAP.md before ANY action.

---

## Stack

- React 19 + Vite + Tailwind CSS 4
- Vercel Serverless Functions (Node.js 22)
- MongoDB Atlas M0 + Mongoose
- JWT + bcrypt auth
- Resend email
- pnpm ONLY

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
1. Check `.skills/project/` for reusable recipes
2. Check `.claude/workflows/` for applicable workflows
3. Check `.claude/rules/` for relevant constraints
4. Reuse before implementing from scratch

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

## Local Dev

```bash
pnpm install
pnpm vercel dev    # localhost:3000 — frontend + functions unified
```
