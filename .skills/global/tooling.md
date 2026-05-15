# Global Tooling — Available in this Project

## CLI tools (use via pnpm dlx)

| Tool | Command | Purpose |
|------|---------|---------|
| Vercel CLI | `pnpm vercel dev` | local dev server (frontend + functions) |
| Vercel CLI | `pnpm vercel deploy --prod` | production deploy |
| Vercel CLI | `pnpm vercel logs` | view function logs |
| Vercel CLI | `pnpm vercel env pull` | pull env vars from Vercel to `.env` |

## Dev workflow

```bash
# Start local dev
pnpm install
pnpm vercel dev

# Test specific endpoint
curl http://localhost:3000/api/services
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@test.com","contrasena":"pass"}'

# Deploy preview
pnpm vercel deploy

# Deploy production
pnpm vercel deploy --prod

# View logs
pnpm vercel logs <deployment-url>
```

## Linting / formatting

```bash
pnpm run lint      # ESLint via Vite config
```

## Useful grep patterns for migration

```bash
# Find any npm/npx usage
grep -r "npm\|npx\|yarn" . --include="*.json" --include="*.md" --include="*.sh"

# Find any require() usage
grep -r "require(" . --include="*.js" --exclude-dir=node_modules

# Find Railway URLs
grep -r "railway" . --include="*.js" --include="*.jsx" --include="*.env*"

# Find missing .js extensions in imports
grep -r "from '\.\." . --include="*.js" | grep -v "\.js'"
```
