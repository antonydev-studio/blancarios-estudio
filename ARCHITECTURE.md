# ARCHITECTURE.md — Barber BR (Blanca Ríos Estudio)

## Visión general

Aplicación MERN Stack de gestión integral para barbería. Permite a clientes agendar citas en línea y al administrador controlar toda la operación desde un panel dedicado.

**Stack:**
- Frontend: React 19 + Vite + Tailwind CSS 4
- Backend: Vercel Serverless Functions (Node.js)
- Base de datos: MongoDB Atlas M0 (Mongoose)
- Emails: Resend
- Auth: JWT + bcrypt + verificación por código de 6 dígitos
- Gestor de paquetes: **pnpm** — npm está PROHIBIDO en este proyecto
- Deploy: Vercel (frontend + backend unificados, $0/mes)

---

## AI-first development workflow

The project is intentionally optimized for:
- Claude Code
- Cursor
- MCP tooling
- AI-assisted refactors
- predictable architecture
- deterministic conventions

## Estructura de carpetas (Fullstack unificado — Opción 2)

```
barber-br/
│
├── api/                          # Vercel Serverless Functions (backend)
│   ├── auth/
│   │   └── [...path].js          # Maneja /api/auth/*
│   ├── appointments/
│   │   └── [...path].js          # Maneja /api/appointments/*
│   ├── services/
│   │   └── [...path].js
│   ├── config/
│   │   └── [...path].js
│   ├── users/
│   │   └── [...path].js
│   └── movements/
│       └── [...path].js
│
├── src/                          # Frontend React
│   ├── pages/
│   │   ├── HomePage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegistrationPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ScheduleAppointmentPage.jsx
│   │   ├── AppointmentHistoryPage.jsx
│   │   ├── AdminPage.jsx
│   │   └── NotFoundPage.jsx
│   ├── components/
│   │   ├── admin/                # Componentes del panel admin
│   │   ├── sections/             # Secciones de páginas
│   │   └── ui/                   # Átomos reutilizables (InputField, Toast, etc.)
│   ├── hooks/
│   │   ├── useAdminApi.js
│   │   ├── useAdminData.js
│   │   └── useHomepageContent.js
│   └── context/
│       └── AuthContext.jsx
│
├── models/                       # Esquemas Mongoose
│   ├── Appointment.js
│   ├── Config.js
│   ├── Movement.js
│   ├── Service.js
│   └── User.js
│
├── controllers/                  # Lógica de negocio pura
│   ├── appointmentController.js
│   ├── authController.js
│   ├── configController.js
│   ├── movementController.js
│   ├── serviceController.js
│   └── userController.js
│
├── middleware/
│   └── auth.js                   # requireAuth, requireAdmin
│
├── services/
│   └── emailService.js           # Resend: 5 tipos de email
│
├── utils/
│   ├── validators.js             # CORREO_REGEX, CONTRASENA_REGEX
│   ├── slots.js                  # Algoritmo de disponibilidad
│   └── passwordUtils.js
│
├── lib/
│   └── mongoose.js               # Conexión cacheada (patrón serverless obligatorio)
│
├── scripts/
│   └── createAdmin.js
│
├── public/
│
├── .env                          # No commitear
├── .env.example                  # Sí commitear
├── .gitignore
├── package.json                  # Un solo package.json para todo
├── pnpm-lock.yaml                # Commitear siempre
├── vercel.json
├── vite.config.js
├── index.html
├── ARCHITECTURE.md
├── ROADMAP.md
└── AGENTS.md
```

---

## Modelos de datos (MongoDB)

### User
```
nombre, telefono, correo (unique), contrasena (hashed bcrypt)
rol: "cliente" | "admin"
verificado: Boolean
codigoVerificacion: String (6 dígitos, expira 15 min)
listaNegraActiva: Boolean
notas: String
```

### Appointment
```
fecha: String "YYYY-MM-DD"
hora: String "HH:MM AM/PM"
servicios: [String]
duracion: Number (minutos)
precio: Number
estado: "pendiente" | "confirmada" | "finalizada" | "cancelada"
userId: ObjectId ref User (null para invitados)
clienteNombre, clienteTelefono, clienteCorreo: String
reagendada: Boolean (solo una vez)
notasAdmin: String
```

### Config (singleton — clave: "global")
```
horarioPorDia: Map { "0"-"6" → { cerrado, inicio, fin } }
diasBloqueados: [String]
horasBloqueadasPorDia: Map
diasAbiertosExcepcion: [String]
diasCerrados: [Number]
intervalo: Number (15 min, fijo)
bufferMinutos: Number (30 min)
heroImagen, serviciosHome, razonesHome
```

### Service
```
titulo, descripcion, imagen, precio, duracion, categoria
```

### Movement
```
tipo: "ingreso" | "egreso"
monto: Number, descripcion: String
fecha: "YYYY-MM-DD", hora: String
esAutomatico: Boolean
```

---

## API REST — Endpoints completos

### Auth `/api/auth`
| Método | Ruta | Acceso |
|--------|------|--------|
| POST | /registro | Público |
| POST | /verificar-codigo | Público |
| POST | /reenviar-codigo | Público |
| POST | /login | Público |
| POST | /olvide-contrasena | Público |
| POST | /verificar-recuperacion | Público |
| POST | /nueva-contrasena | Público |
| GET | /sesion | requireAuth |

### Appointments `/api/appointments`
| Método | Ruta | Acceso |
|--------|------|--------|
| POST | / | Público |
| GET | /occupied?fecha=YYYY-MM-DD | Público |
| GET | /mias | requireAuth |
| PATCH | /mias/:id | requireAuth |
| GET | / | requireAdmin |
| PATCH | /:id | requireAdmin |
| DELETE | /:id | requireAdmin |

### Services `/api/services`
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | / | Público |
| POST | / | requireAdmin |
| PATCH | /:id | requireAdmin |
| DELETE | /:id | requireAdmin |

### Config `/api/config`
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | / | Público |
| PATCH | / | requireAdmin |

### Users `/api/users`
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | / | requireAdmin |
| PATCH | /:id | requireAdmin |
| DELETE | /:id | requireAdmin |

### Movements `/api/movements`
| Método | Ruta | Acceso |
|--------|------|--------|
| GET | /?periodo=hoy\|semana\|mes | requireAdmin |
| POST | / | requireAdmin |
| DELETE | /:id | requireAdmin |

---

## Middleware de autenticación

```js
requireAuth   → verifica JWT en Authorization: Bearer <token>
requireAdmin  → requireAuth + valida rol === "admin"
// JWT payload: { id, rol, listaNegraActiva } — expira 7 días
```

---

## Algoritmo de disponibilidad

1. Consulta citas del día (estado !== "cancelada")
2. Convierte `"HH:MM AM/PM"` → minutos desde medianoche
3. Detecta conflicto: `nuevaInicio < existFin && existInicio < nuevaFin`
4. Conflicto → 409 | Lista negra → 403
5. Crea cita → notifica admin por email (async, no bloquea respuesta)

**Reglas cliente:** cancelar >1h antes · reagendar >3h antes · reagendar solo 1 vez

---

## Patrón conexión MongoDB para serverless

```js
// lib/mongoose.js — único punto de conexión, nunca llamar mongoose.connect() directamente
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

---

## Variables de entorno (raíz del proyecto)

```env
MONGO_URI=mongodb+srv://...
JWT_SECRET=cadena_aleatoria_minimo_32_chars
RESEND_API_KEY=re_xxxx
EMAIL_FROM=Blanca Ríos Estudio <noreply@blancariosestudio.com>
FRONTEND_URL=https://blancariosestudio.com
ADMIN_EMAIL=correo_de_blanca@gmail.com
ADMIN_PASSWORD=contraseña_admin_inicial
```

Variables `VITE_` son accesibles en el cliente. Las demás solo en serverless.

---

## vercel.json final

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Vercel detecta `/api` como Functions automáticamente.

---

## Desarrollo local

```bash
pnpm install
pnpm vercel dev    # frontend + functions en localhost:3000
```

## Runtime
- Node.js 22 LTS

"engines": {
  "node": ">=22"
}