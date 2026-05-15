#!/usr/bin/env bash
# Upload env vars to Vercel. Values read from .env — never echoed.
# Usage: bash scripts/upload-env.sh
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: .env not found at $ROOT"
  exit 1
fi

# Extract value — handles values containing = signs
get_val() {
  grep -m1 "^$1=" "$ENV_FILE" | cut -d= -f2-
}

# production/development: pipe via stdin
add_std() {
  local name=$1 env_target=$2
  local val=${3:-$(get_val "$name")}
  [ -z "$val" ] && { echo "  SKIP $name ($env_target)"; return; }
  printf '%s' "$val" | pnpm dlx vercel env add "$name" "$env_target" 2>&1 \
    | grep -vE "^(Retrieving|$)" | head -2
  echo "  ✅ $name → $env_target"
}

# preview: requires --value flag (different CLI path)
add_preview() {
  local name=$1
  local val=${2:-$(get_val "$name")}
  [ -z "$val" ] && { echo "  SKIP $name (preview)"; return; }
  pnpm dlx vercel env add "$name" preview --value "$val" --yes 2>&1 \
    | grep -vE "^(Retrieving|$)" | head -2
  echo "  ✅ $name → preview"
}

echo "→ Uploading to production + development..."
for target in production development; do
  echo ""
  echo "  [$target]"
  add_std MONGO_URI      "$target"
  add_std JWT_SECRET     "$target"
  add_std RESEND_API_KEY "$target"
  add_std ADMIN_EMAIL    "$target"
  add_std ADMIN_PASSWORD "$target"
  add_std EMAIL_FROM     "$target" "Blanca Ríos Estudio <noreply@blancariosestudio.com>"
done

add_std FRONTEND_URL production  "https://blancariosestudio.com"
add_std FRONTEND_URL development "http://localhost:5173"

echo ""
echo "→ Uploading to preview..."
add_preview MONGO_URI
add_preview JWT_SECRET
add_preview RESEND_API_KEY
add_preview ADMIN_EMAIL
add_preview ADMIN_PASSWORD
add_preview EMAIL_FROM "Blanca Ríos Estudio <noreply@blancariosestudio.com>"
add_preview FRONTEND_URL "https://blancariosestudio.com"

echo ""
echo "Done."
