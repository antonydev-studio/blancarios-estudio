# Skill: API Testing (Local)

## Start local server

```bash
pnpm vercel dev    # localhost:3000
```

## Test endpoints with curl

```bash
# Public — no auth
curl http://localhost:3000/api/services
curl http://localhost:3000/api/config
curl "http://localhost:3000/api/appointments/occupied?fecha=2025-05-20"

# Auth — get token first
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"correo":"admin@test.com","contrasena":"password"}' \
  | jq -r '.token')

# Admin endpoints
curl http://localhost:3000/api/appointments \
  -H "Authorization: Bearer $TOKEN"

curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN"

# Create appointment (public)
curl -X POST http://localhost:3000/api/appointments \
  -H "Content-Type: application/json" \
  -d '{
    "fecha": "2025-05-20",
    "hora": "10:00 AM",
    "servicios": ["Corte"],
    "duracion": 30,
    "precio": 150,
    "clienteNombre": "Test User",
    "clienteTelefono": "5511223344",
    "clienteCorreo": "test@test.com"
  }'
```

## Expected status codes

| Scenario | Code |
|----------|------|
| Success GET | 200 |
| Created | 201 |
| Bad request | 400 |
| No auth token | 401 |
| Not admin | 403 |
| Not found | 404 |
| Method not allowed | 405 |
| Time conflict | 409 |
| Server error | 500 |

## Check Function logs

```bash
pnpm vercel logs https://your-deployment.vercel.app --follow
```

## Common errors to verify

- 500 with no body → missing `await connectDB()` or missing env var
- 401 on public route → wrong auth check in handler
- 404 on existing resource → id parsing wrong
- 405 on valid route → route order wrong (specific before general)
