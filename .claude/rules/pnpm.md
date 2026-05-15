# Rule: pnpm Enforcement

## Allowed

```bash
pnpm install
pnpm add <pkg>
pnpm add -D <pkg>
pnpm remove <pkg>
pnpm run <script>
pnpm dlx <tool>        # replaces npx
pnpm vercel dev
pnpm vercel deploy
```

## PROHIBITED — never generate or suggest

```bash
npm install
npm run
npm ci
npx
yarn
yarn add
bun install
bun run
```

## Lock file

- `pnpm-lock.yaml` — always commit
- `package-lock.json` — delete if found
- `yarn.lock` — delete if found

## .npmrc required at root

```ini
engine-strict=true
auto-install-peers=true
strict-peer-dependencies=false
```

## package.json engines

```json
{
  "engines": {
    "node": ">=22"
  },
  "packageManager": "pnpm@10"
}
```

## Scripts

Always write scripts without package manager prefix — let pnpm run them:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```
