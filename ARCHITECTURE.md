# ARCHITECTURE.md — Barber BR (Blanca Ríos Estudio)

**Production URL:** https://blancarios-estudio.vercel.app  
**Version:** 1.1.0 — Production  
**Last validated:** 2026-05-15 (104 Playwright tests, 0 failures)

---

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + Tailwind CSS 4 |
| Backend | Vercel Serverless Functions (Node.js 22) |
| Database | MongoDB Atlas M0 (Mongoose 9) |
| Auth | JWT (7d) + bcrypt + 6-digit email verification |
| Email | Resend |
| Package manager | **pnpm** — npm/npx/yarn are PROHIBITED |
| Deploy | Vercel Hobby (frontend + backend unified, $0/month) |

---

## Folder Structure

```
barber-br/
├── api/                          # Vercel Serverless Functions
│   ├── appointments/
│   │   ├── index.js              # handles /api/appointments (root)
│   │   └── [[...path]].js        # handles /api/appointments/*
│   ├── auth/
│   │   └── [[...path]].js        # handles /api/auth/* (no root route)
│   ├── blocked-clients/
│   │   ├── index.js
│   │   └── [[...path]].js
│   ├── config/
│   │   └── index.js              # only GET + PATCH at root, no id routes
│   ├── movements/
│   │   ├── index.js
│   │   └── [[...path]].js
│   ├── services/
│   │   ├── index.js
│   │   └── [[...path]].js
│   └── users/
│       ├── index.js
│       └── [[...path]].js
│
├── src/                          # React SPA (internal state routing)
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegistrationPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ScheduleAppointmentPage.jsx
│   │   ├── AppointmentHistoryPage.jsx
│   │   ├── NotFoundPage.jsx
│   │   └── admin/
│   │       ├── AdminPage.jsx           # tab router
│   │       ├── DashboardSection.jsx
│   │       ├── AppointmentsSection.jsx
│   │       ├── ClientsSection.jsx
│   │       ├── AvailabilitySection.jsx
│   │       ├── BalanceSection.jsx
│   │       ├── CatalogSection.jsx
│   │       ├── BlockedClientsSection.jsx
│   │       ├── HomepageSection.jsx
│   │       └── ReportsSection.jsx
│   ├── components/
│   │   ├── admin/
│   │   ├── sections/
│   │   └── ui/
│   ├── hooks/
│   ├── context/
│   │   └── AuthContext.jsx
│   └── utils/
│       └── passwordUtils.js
│
├── controllers/                  # Business logic — one file per domain
│   ├── appointmentController.js
│   ├── authController.js
│   ├── blockedClientController.js
│   ├── configController.js
│   ├── movementController.js
│   ├── serviceController.js
│   └── userController.js
│
├── models/                       # Mongoose schemas — never bare mongoose.model()
│   ├── Appointment.js
│   ├── BlockedClient.js
│   ├── Config.js
│   ├── Movement.js
│   ├── Service.js
│   └── User.js
│
├── middleware/
│   └── auth.js                   # requireAuth, requireAdmin
│
├── services/
│   └── emailService.js           # Resend, 5 email types
│
├── utils/
│   ├── mexicoTime.js             # getMexicoToday() — UTC-6 fixed offset
│   ├── normalizePhone.js
│   ├── passwordUtils.js
│   ├── slots.js
│   └── validators.js             # CORREO_REGEX, CONTRASENA_REGEX
│
├── lib/
│   └── mongoose.js               # Cached connection — only connection point
│
├── scripts/
│   ├── cleanup-test-data.js      # Removes TEST QA FINAL data from prod
│   └── createAdmin.js
│
├── tests/                        # Playwright test suite
│   ├── smoke/                    # Non-destructive: homepage, services, nav, booking
│   ├── e2e/                      # Non-destructive: auth flows, booking form, admin form
│   ├── validation/               # Some WRITE: mutation tests, admin API, business logic
│   ├── fixtures/                 # Custom Playwright fixtures (loginPage, bookingPage)
│   ├── helpers/                  # Reusable navigation helpers
│   └── utils/                    # Test data generators, date utilities
│
├── public/
├── .env                          # NEVER commit
├── .env.example
├── package.json                  # Single package.json for everything
├── pnpm-lock.yaml                # Always commit
├── playwright.config.ts
├── vercel.json
├── vite.config.js
├── index.html
├── ARCHITECTURE.md
└── ROADMAP.md
```

**Vercel Hobby plan limit: 12 functions.** Current count: exactly 12 (7 groups × ~2 files).  
Adding new api groups risks hitting this limit.

---

## SPA Routing

The frontend uses **internal React state routing** — NOT URL-based routing.

- All pages live at `/`
- Navigation is driven by a `pagina` state variable in the root component
- Deep links work because vercel.json rewrites all non-API paths to `/index.html`
- Tests must navigate via button clicks, not `page.goto("/login")`

```json
// vercel.json — negative lookahead excludes /api/* from SPA rewrite
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

The bare `/(.*) → /index.html` pattern would cache-poison the CDN for API routes. The negative lookahead prevents this.

---

## Vercel Handler Pattern

Every `api/[group]/[[...path]].js` must follow this exact structure:

```js
import { connectDB } from "../../lib/mongoose.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import { getX, createX, updateX, deleteX } from "../../controllers/xController.js";

export default async function handler(req, res) {
  await connectDB();  // ALWAYS first

  const path = req.url.replace(/^\/api\/group/, "").replace(/\?.*/, "");
  const id   = path.match(/^\/([^/]+)$/)?.[1];
  req.params = { id };  // attach for controller compatibility

  // Specific routes BEFORE id catch-all
  if (req.method === "GET" && path === "/specific") return specificHandler(req, res);

  if (req.method === "GET"    && !id) return getX(req, res);
  if (req.method === "POST"   && !id) return requireAdmin(req, res, () => createX(req, res));
  if (req.method === "PATCH"  && id)  return requireAdmin(req, res, () => updateX(req, res));
  if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => deleteX(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
```

Query strings: `new URL(req.url, "http://localhost").searchParams.get("fecha")` — not `req.query`.

---

## MongoDB Cached Connection

```js
// lib/mongoose.js — only file that calls mongoose.connect()
import mongoose from "mongoose";
let cached = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

Model guard pattern (required to prevent "Cannot overwrite model" on warm invocations):

```js
export default mongoose.models.User || mongoose.model("User", schema);
```

**Atlas M0 constraints:** no replica set transactions, no `$lookup` on large collections, max 100 connections.

---

## Data Models

### User
```
nombre, telefono, correo (unique), contrasena (bcrypt hashed)
rol: "cliente" | "admin"
verificado: Boolean (false until email code confirmed)
codigoVerificacion: String (6-digit, expires 15 min)
codigoExpira: Date
listaNegraActiva: Boolean
notas: String
```

### Appointment
```
fecha: "YYYY-MM-DD"
hora: "H:MM AM/PM"  (e.g. "3:00 PM", "10:00 AM")
servicios: [String]  (service names)
duracion: Number (minutes, integer > 0)
precio: Number
estado: "pendiente" | "confirmada" | "finalizada" | "cancelada"
userId: ObjectId | null  (null for guest bookings)
clienteNombre, clienteTelefono, clienteCorreo: String
notasAdmin: String
reagendada: Boolean  (client can reschedule only once)
```

### Config (singleton — clave: "global")
```
horarioPorDia: Map { "0"–"6" → { inicio: Number, fin: Number, cerrado: Boolean } }
diasBloqueados: [String "YYYY-MM-DD"]
horasBloqueadasPorDia: Map { "YYYY-MM-DD" → [String "H:MM AM/PM"] }
diasAbiertosExcepcion: [String "YYYY-MM-DD"]
intervalo: Number (15, fixed)
bufferMinutos: Number (default 30)
heroImagen: String
serviciosHome: [ObjectId]
razonesHome: [Object]
```

### Service
```
titulo, descripcion, imagen
precio: Number
duracion: Number (min 5 minutes)
categoria: String
activo: Boolean
oferta: Boolean
precioOferta: Number
```

### Movement
```
tipo: "ingreso" | "egreso"
monto: Number
descripcion: String
fecha: "YYYY-MM-DD"
hora: String
esAutomatico: Boolean  (true when auto-created on appointment finalization)
citaId: ObjectId | null
```

### BlockedClient
```
telefono: String (unique, normalized)
motivo: String
activo: Boolean
creadoPor: ObjectId
```

---

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Access |
|--------|------|--------|
| POST | /registro | Public |
| POST | /verificar-codigo | Public |
| POST | /reenviar-codigo | Public |
| POST | /login | Public — rate-limited (20/15min) |
| POST | /olvide-contrasena | Public |
| POST | /verificar-recuperacion | Public |
| POST | /nueva-contrasena | Public |
| GET | /me | requireAuth |

### Appointments — `/api/appointments`
| Method | Path | Access |
|--------|------|--------|
| POST | / | **Public** — any visitor can book |
| GET | /occupied?fecha=YYYY-MM-DD | Public |
| GET | /mias | requireAuth |
| GET | /auto-finalizar | requireAdmin |
| PATCH | /mias/:id | requireAuth (own only) |
| GET | / | requireAdmin |
| PATCH | /:id | requireAdmin |
| DELETE | /:id | requireAdmin |

Route order is critical: `/occupied`, `/mias`, `/auto-finalizar` must be checked BEFORE `/:id` to prevent shadowing.

### Services — `/api/services`
| Method | Path | Access |
|--------|------|--------|
| GET | / | Public |
| POST | / | requireAdmin |
| PATCH | /:id | requireAdmin |
| DELETE | /:id | requireAdmin |

### Config — `/api/config`
| Method | Path | Access |
|--------|------|--------|
| GET | / | Public |
| PATCH | / | requireAdmin |

### Users — `/api/users`
| Method | Path | Access |
|--------|------|--------|
| GET | / | requireAdmin |
| PATCH | /:id | requireAdmin |
| DELETE | /:id | requireAdmin |

### Movements — `/api/movements`
| Method | Path | Access |
|--------|------|--------|
| GET | /?periodo=hoy\|semana\|mes | requireAdmin |
| POST | / | requireAdmin |
| DELETE | /:id | requireAdmin |

### Blocked Clients — `/api/blocked-clients`
| Method | Path | Access |
|--------|------|--------|
| GET | / | requireAdmin |
| POST | / | requireAdmin |
| PATCH | /:id | requireAdmin (toggle activo) |
| DELETE | /:id | requireAdmin |

**Note:** blocked-clients controller returns `{ ok: true, data: [...] }` — this deviates from the standard `{ blockedClients }` convention. All other endpoints follow the standard.

---

## API Response Standards

```js
// Success
res.json({ appointment })          // singular resource
res.json({ appointments })         // array
res.status(201).json({ service })  // created

// Errors — always Spanish, always period at end, always "mensaje" key
res.status(400).json({ mensaje: "Faltan campos requeridos." })
res.status(401).json({ mensaje: "No autorizado." })
res.status(403).json({ mensaje: "Acceso denegado." })
res.status(404).json({ mensaje: "No encontrado." })
res.status(405).json({ mensaje: "Método no permitido." })
res.status(409).json({ mensaje: "Este horario ya no está disponible." })
res.status(500).json({ mensaje: "Error interno del servidor." })
```

---

## Authentication Flow

1. `POST /api/auth/registro` → creates User (verificado: false), sends 6-digit code via Resend
   - If Resend fails in production: user is deleted, 500 returned (no orphaned unverified users)
2. `POST /api/auth/verificar-codigo` → sets verificado: true, returns JWT
3. `POST /api/auth/login` → unverified users get 403 with `{ requiereVerificacion: true, correo }`
4. JWT payload: `{ id, rol, listaNegraActiva }`, 7-day expiry
5. All protected routes: `Authorization: Bearer <token>` header

---

## Booking Conflict Algorithm

```js
function hayConflicto(citasDelDia, nuevaInicio, nuevaFin, bufferMin, excluirId) {
  return citasDelDia.some((c) => {
    const existInicio = horaAMinutos(c.hora);
    const existFin    = existInicio + c.duracion;
    return nuevaInicio < (existFin + bufferMin) && existInicio < (nuevaFin + bufferMin);
  });
}
```

Each appointment occupies `[start, end + buffer)`. Two bookings conflict if their padded windows overlap.

Config-driven guards (in order):
1. `diasBloqueados` → 400 "El negocio está cerrado ese día."
2. `diasAbiertosExcepcion` → overrides cerrado weekday
3. `horarioPorDia[dayOfWeek].cerrado` → 400 "El negocio está cerrado ese día."
4. Outside `inicio`/`fin` hours → 400 "La cita es antes del horario de apertura."
5. `horasBloqueadasPorDia[fecha]` → 400 "Este horario no está disponible."
6. `hayConflicto()` → 409 "Este horario ya no está disponible."
7. Phone in BlockedClient (activo: true) → 403

---

## Mexico Timezone

Mexico City is permanently UTC-6 since 2023 (no daylight saving).  
All date comparisons use `getMexicoToday()` from `utils/mexicoTime.js` to prevent "past date" false positives from UTC offset.

---

## Email Notifications (Resend)

All emails are fire-and-forget — never await in handlers:

```js
enviarNotificacionAdmin(appointment).catch((err) =>
  console.error("Error:", err.message)
);
```

Email types: verification code, password recovery code, new booking (admin), cancellation (client), rescheduling (client).

---

## Environment Variables

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=minimum-32-char-random-string
RESEND_API_KEY=re_xxxx
EMAIL_FROM=Blanca Ríos Estudio <noreply@blancariosestudio.com>
FRONTEND_URL=https://blancariosestudio.com
ADMIN_EMAIL=blancariosestudio@gmail.com
ADMIN_PASSWORD=...
```

`VITE_` prefix = accessible in client bundle. All others = server-only.

---

## Development Workflow

```bash
pnpm install
pnpm vercel dev        # localhost:3000 — frontend + functions unified
pnpm build             # Vite production build only
pnpm test:e2e:smoke    # non-destructive tests (safe)
pnpm test:e2e:validate # mutation tests (creates test data)
pnpm test:cleanup      # remove TEST QA FINAL data from prod DB
```

Local dev requires `.env.local` with all environment variables. Vercel CLI reads it automatically.

---

## Deployment

```bash
pnpm vercel deploy --prod
```

Vercel auto-detects `api/` as Functions. No explicit function configuration needed in vercel.json.

---

## Testing Infrastructure

| Suite | Location | Mutates DB | Notes |
|-------|----------|-----------|-------|
| Smoke | `tests/smoke/` | No | Homepage, nav, services, booking page |
| E2E | `tests/e2e/` | No | Auth forms, booking flow, protected routes |
| Auth validation | `tests/validation/auth-flow.spec.ts` | Minimal | Registration validation, login errors |
| Booking mutation | `tests/validation/booking-mutation.spec.ts` | **Yes** | Creates real appointments |
| Admin panel | `tests/validation/admin-panel.spec.ts` | **Yes (CRUD)** | Requires `TEST_ADMIN_EMAIL` + `TEST_ADMIN_PASSWORD` env vars |
| Business logic | `tests/validation/business-logic.spec.ts` | Some | Conflict/buffer tests create appointments |

Run after mutation tests: `MONGO_URI=... pnpm test:cleanup`

All mutation test data uses `"TEST QA FINAL"` marker and `playwright-*@example.invalid` emails for safe bulk deletion.
