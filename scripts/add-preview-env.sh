#!/usr/bin/env bash
# Add env vars to Vercel preview environment only.
# Run once — preview requires --value flag (different from prod/dev).
set -e

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"
get_val() { grep -m1 "^$1=" "$ENV_FILE" | cut -d= -f2-; }

add() {
  local name=$1 val=${2:-$(get_val "$1")}
  [ -z "$val" ] && { echo "  SKIP $name"; return; }
  pnpm dlx vercel env add "$name" preview --value "$val" --yes 2>&1 \
    | grep -vE "^(Retrieving|$)" | head -2
  echo "  ✅ $name → preview"
}

echo "→ Adding vars to preview environment..."
add MONGO_URI
add JWT_SECRET
add RESEND_API_KEY
add ADMIN_EMAIL
add ADMIN_PASSWORD
add EMAIL_FROM "Blanca Ríos Estudio <noreply@blancariosestudio.com>"
add FRONTEND_URL "https://blancariosestudio.com"
echo "Done."
