# Global Skill Registry — Barber BR

## How to use

1. Find matching skill in this registry
2. Load the skill file — follow the recipe
3. Use `find-skills` skill (installed globally) before implementing anything new

**Skill search:**
```bash
pnpm dlx skills find "query"
```

---

## Community Skills — `.agents/skills/` (auto-active for Claude Code + Cursor)

| Skill | Source | Installs | Use when |
|-------|--------|----------|----------|
| `vercel-functions` | vercel/vercel-plugin (official) | 277 | ANY work in `api/**/*.js` files |
| `mongoose-mongodb` | pluginagentmarketplace | 505 | Mongoose schemas, queries, connections |

**⚠️ vercel-functions skill conflict:** it expects named exports (`GET`, `POST`) — this project uses `export default function handler`. Override: follow `.skills/project/vercel-handler.md` pattern instead.

---

## Global Skills — `~/.agents/skills/` (always active machine-wide)

| Skill | Source | Use when |
|-------|--------|----------|
| `vercel-react-best-practices` | vercel-labs (official) | writing/reviewing React components |
| `pnpm` | Anthony Fu | any pnpm commands, workspace config |
| `tailwind-design-system` | community | building Tailwind UI |
| `web-design-guidelines` | vercel-labs | UI/UX review, accessibility |
| `find-skills` | community | discovering new community skills |

**Skill discovery protocol:**
1. Before implementing — run `pnpm dlx skills find "task keyword"`
2. Check install count: prefer 1K+, official sources
3. Verify skill doesn't conflict with project conventions
4. Install with `pnpm dlx skills add owner/repo@skill -y`

---

## Skipped community skills — WHY

| Skill | Reason skipped |
|-------|---------------|
| `yaklang/hack-skills@api-auth-and-jwt-abuse` | security research, not dev |
| `auth0/agent-skills@express-oauth2-jwt-bearer` | Express-based, not compatible |
| `mongodb/agent-skills` (official) | installed in wrong dir; project skill covers it better |
| `andrelandgraf/fullstackrecipes@nextjs-on-vercel` | Next.js-specific, not applicable |

---

## Project Skills — `.skills/project/`

| Skill | Use when |
|-------|----------|
| `vercel-handler.md` | creating `api/*/[...path].js` — handler template |
| `mongodb-connection.md` | writing `lib/mongoose.js` — cached connection |
| `api-route-pattern.md` | route ordering inside handler |
| `appointment-conflict.md` | time-slot conflict detection |
| `auth-flow.md` | auth endpoints, JWT, middleware |
| `react-component.md` | creating React component or hook |
| `tailwind-patterns.md` | Tailwind CSS 4 utility patterns |
| `async-patterns.md` | async controller or service function |
| `pnpm-workflow.md` | pnpm CLI operations |

---

## Migration Skills — `.skills/migrations/`

| Skill | Use when |
|-------|----------|
| `express-to-vercel.md` | **Start here for Parte 2** — Express → Vercel |

---

## Backend Skills — `.skills/backend/`

| Skill | Use when |
|-------|----------|
| `serverless-patterns.md` | serverless-safe code patterns |
| `mongodb-patterns.md` | Mongoose query optimization |

---

## Frontend Skills — `.skills/frontend/`

| Skill | Use when |
|-------|----------|
| `react-patterns.md` | React 19 component patterns |

---

## DevOps Skills — `.skills/devops/`

| Skill | Use when |
|-------|----------|
| `vercel-deploy.md` | deploying to Vercel |
| `env-management.md` | managing env vars |

---

## Testing Skills — `.skills/testing/`

| Skill | Use when |
|-------|----------|
| `api-testing.md` | testing API endpoints with curl |

---

## Performance Skills — `.skills/performance/`

| Skill | Use when |
|-------|----------|
| `performance-audit.md` | auditing slow pages or API responses |
