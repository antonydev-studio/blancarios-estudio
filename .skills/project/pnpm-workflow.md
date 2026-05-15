# Skill: pnpm Workflow

## Daily commands

```bash
pnpm install              # install all deps from pnpm-lock.yaml
pnpm add <pkg>            # add runtime dependency
pnpm add -D <pkg>         # add dev dependency
pnpm remove <pkg>         # remove dependency
pnpm vercel dev           # local dev (frontend + functions)
pnpm vercel deploy        # preview deploy
pnpm vercel deploy --prod # production deploy
```

## Adding a package

```bash
pnpm add mongoose jsonwebtoken bcryptjs resend
pnpm add -D vite @vitejs/plugin-react tailwindcss
```

## Cleanup after migration

```bash
# Remove Express deps
pnpm remove express express-rate-limit cors nodemon

# Verify lockfile
cat pnpm-lock.yaml | grep "express"  # should return nothing

# Full reinstall
rm -rf node_modules
pnpm install
```

## Check for forbidden package managers

```bash
# Find any npm/npx/yarn usage
grep -rn "npm \|npx \|yarn " . \
  --include="*.json" \
  --include="*.md" \
  --include="*.sh" \
  --exclude-dir=node_modules \
  --exclude-dir=.git
```

## Package.json structure (root)

```json
{
  "name": "barber-br",
  "version": "1.1.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22" },
  "packageManager": "pnpm@10",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```
