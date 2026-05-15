# Workflow: Debug

## Diagnose first

1. Read the error message exactly
2. Identify layer: frontend / api handler / controller / middleware / model
3. Read the specific file before guessing

## Common issues — check first

### 500 from Vercel Function
- Missing `await connectDB()` at top of handler
- `.env` variable not set in Vercel dashboard
- Import path wrong (missing `.js` extension)
- Mongoose model not exported correctly

### 401 Unauthorized
- Token not sent in `Authorization: Bearer <token>`
- JWT_SECRET mismatch between environments
- Token expired (7-day TTL)

### 404 Not Found
- Route order wrong — specific route shadowed by catch-all
- `id` parsing wrong — check `path.match(/^\/([^/]+)$/)?.[1]`
- MongoDB document genuinely missing — check Atlas

### CORS errors
- `FRONTEND_URL` env var wrong or missing
- Request going to wrong base URL in frontend

### MongoDB connection timeout
- `MONGO_URI` wrong or network access not whitelisted in Atlas
- Missing `bufferCommands: false` in mongoose options

## Debug steps

1. `pnpm vercel dev` locally with `.env` populated
2. Check Vercel Function logs: `pnpm vercel logs <deployment-url>`
3. Test endpoint directly: `curl -X GET http://localhost:3000/api/services`
4. Check Atlas → Collections to confirm data exists
