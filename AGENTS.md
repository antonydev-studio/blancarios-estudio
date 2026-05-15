# AGENTS.md — Instrucciones para Claude Code y Cursor

Lee ARCHITECTURE.md y ROADMAP.md antes de cualquier acción.

---

## Reglas absolutas — no negociables

### pnpm es el único gestor de paquetes permitido
- ✅ `pnpm install` `pnpm add` `pnpm run` `pnpm dlx`
- ❌ `npm` `npx` `yarn` — PROHIBIDOS absolutamente
- Si encuentras `package-lock.json` → eliminarlo
- Si encuentras `yarn.lock` → eliminarlo
- Si encuentras `npm run` en algún script → reemplazarlo con `pnpm`
- Si encuentras `npx` → reemplazarlo con `pnpm dlx`

### Skills y herramientas globales
Antes de comenzar cualquier tarea, busca y activa todas las skills, extensiones, MCP servers y herramientas globales disponibles en el entorno. Instala con `pnpm dlx` cualquier herramienta CLI que pueda acelerar el trabajo (scaffolding, codemods, linters, formatters). 

## AI-first development workflow

The project is intentionally optimized for:
- Claude Code
- Cursor
- MCP tooling
- AI-assisted refactors
- predictable architecture
- deterministic conventions

### ES Modules obligatorio
- `import/export` siempre
- `require()` / `module.exports` → PROHIBIDOS
- `package.json` debe tener `"type": "module"`

---

## Tarea activa: Refactor v1.1

Dos partes en orden estricto:

### Parte 1 — Restructura de carpetas
Reorganizar de estructura separada (backend/ + frontend/) a estructura unificada Opción 2.

Mapeo exacto:
```
backend/src/controllers/  →  controllers/
backend/src/models/       →  models/
backend/src/middleware/   →  middleware/
backend/src/services/     →  services/
backend/src/utils/        →  utils/
backend/src/lib/          →  lib/
backend/src/scripts/      →  scripts/
frontend/src/             →  src/
frontend/public/          →  public/
frontend/index.html       →  index.html
frontend/vite.config.js   →  vite.config.js
frontend/vercel.json      →  vercel.json
```

Después de mover archivos:
1. Crear `package.json` unificado en raíz con `pnpm`
2. Eliminar `backend/package.json` y `frontend/package.json`
3. Eliminar `backend/package-lock.json` y `frontend/package-lock.json`
4. Eliminar ambas carpetas `node_modules/`
5. Correr `pnpm install` en raíz
6. Verificar que todos los imports relativos siguen siendo válidos

### Parte 2 — Migración a Vercel Functions
Orden de ejecución:

1. `lib/mongoose.js` — conexión cacheada (ver patrón en ARCHITECTURE.md)
2. `api/config/[...path].js` — más simple, solo GET y PATCH
3. `api/services/[...path].js`
4. `api/auth/[...path].js` — 8 endpoints, el más complejo
5. `api/appointments/[...path].js` — cuidado con orden de rutas: `/occupied` antes de `/:id`
6. `api/movements/[...path].js`
7. `api/users/[...path].js`
8. Actualizar `vercel.json`
9. Eliminar `express-rate-limit` de dependencias
10. `pnpm install` para limpiar lockfile

---

## Convenciones de código

### Nombrado
- Modelos: PascalCase (`Appointment.js`)
- Controllers, utils, services: camelCase (`appointmentController.js`)
- Componentes React: PascalCase (`AppointmentCard.jsx`)
- Hooks: `use` + PascalCase (`useAdminApi.js`)
- Constantes globales: UPPER_SNAKE_CASE (`CORREO_REGEX`)

### Respuestas API — mantener formato existente
```js
res.json({ appointment })                              // éxito singular
res.json({ appointments })                             // éxito array
res.status(201).json({ service })                      // creación
res.status(400).json({ mensaje: "En español." })       // error
res.status(401).json({ mensaje: "No autorizado." })
res.status(404).json({ mensaje: "No encontrado." })
res.status(500).json({ mensaje: "Error interno." })
```

### Async
- `async/await` siempre en controllers
- `try/catch` en cada handler
- Emails: fire-and-forget con `.catch()` para no bloquear respuesta

---

## Lo que NO tocar

- ❌ Lógica dentro de los controllers (solo mover, no modificar)
- ❌ Esquemas de los modelos Mongoose
- ❌ `emailService.js` (solo mover de carpeta)
- ❌ Archivos `.jsx` del frontend
- ❌ `AuthContext.jsx`
- ❌ `vite.config.js` (solo mover de carpeta)

---

## Estructura de un handler serverless

```js
// api/[grupo]/[...path].js
import { connectDB } from "../../lib/mongoose.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import { getServices, createService, updateService, deleteService } from "../../controllers/serviceController.js";

export default async function handler(req, res) {
  await connectDB();

  const path = req.url.replace(/^\/api\/services/, "").replace(/\?.*/, "");
  const id   = path.match(/^\/([^/]+)$/)?.[1];

  if (req.method === "GET" && !id)          return getServices(req, res);
  if (req.method === "POST" && !id)         return requireAdmin(req, res, () => createService(req, res));
  if (req.method === "PATCH" && id)         return requireAdmin(req, res, () => updateService(req, res));
  if (req.method === "DELETE" && id)        return requireAdmin(req, res, () => deleteService(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
```

---

## Variables de entorno disponibles

```
MONGO_URI
JWT_SECRET
RESEND_API_KEY
EMAIL_FROM
FRONTEND_URL=https://blancariosestudio.com
ADMIN_EMAIL
ADMIN_PASSWORD
```

---

## Cómo probar localmente

```bash
pnpm install
pnpm dlx vercel dev    # localhost:3000 — frontend + functions juntos
```

---

## Reporte de avance por paso

Después de cada paso completado, reportar:
- ✅ Qué se completó
- 🧪 Qué se probó y resultado
- ⚠️ Problemas encontrados y resolución
- ➡️ Siguiente paso

---

## Criterio de éxito final

- [ ] Estructura de carpetas coincide exactamente con ARCHITECTURE.md
- [ ] Un solo `package.json` en raíz, cero `package-lock.json` en el repo
- [ ] `pnpm-lock.yaml` presente y commitado
- [ ] Todos los endpoints responden igual que en Railway
- [ ] Flujo completo: registro → verificación → login → agendar → admin gestiona
- [ ] Emails funcionando (verificación + notificaciones)
- [ ] Sin referencias a Railway en ningún archivo
- [ ] Sin `express-rate-limit` en el proyecto
- [ ] Sin `npm`, `npx` o `yarn` en scripts ni documentación
- [ ] `pnpm vercel dev` levanta todo sin errores

# AI Skill Discovery System

Before starting ANY task, all AI agents MUST:

1. Analyze the task type
2. Search for globally available skills
3. Activate relevant skills automatically
4. Reuse existing workflows before creating new ones
5. Prefer established tooling over manual implementation

This applies to:
- Claude Code
- Cursor
- future AI agents
- MCP-enabled environments

---

# Mandatory Skill Discovery

Agents MUST use available skill discovery tools such as:
- find_skill
- skill search
- MCP discovery
- global workflow registries
- shared automation systems

before implementing solutions manually.

---

# Required Skill Categories

Depending on the task, agents should automatically search for and activate skills related to:

## Architecture
- system design
- fullstack architecture
- serverless architecture
- Vercel optimization
- monorepo restructuring

## Frontend
- React optimization
- Tailwind patterns
- accessibility
- responsive UI
- animation systems
- form architecture

## Backend
- Vercel Functions
- MongoDB optimization
- JWT auth
- API architecture
- caching strategies
- async patterns

## Infrastructure
- pnpm workflows
- CI/CD
- deployment optimization
- environment management
- build optimization

## Code Quality
- linting
- formatting
- static analysis
- refactoring
- dead code cleanup
- import optimization

## Performance
- React render optimization
- bundle optimization
- lazy loading
- caching
- database performance

## DX (Developer Experience)
- codemods
- scaffolding
- automation
- CLI tooling
- hot reload optimization
- workspace optimization

## Testing
- unit testing
- integration testing
- endpoint testing
- E2E workflows

---

# Skill Reuse Priority

Agents MUST prioritize:
1. existing global skills
2. existing workflows
3. existing automations
4. existing tooling
5. existing codemods

before writing custom implementations.

---

# Premium Engineering Goal

The goal is to make the project:
- faster to develop
- more maintainable
- AI-native
- automation-friendly
- production-grade
- architecturally consistent

Agents should actively look for ways to:
- reduce repetitive work
- automate migrations
- improve developer experience
- improve code quality
- improve deployment reliability
- improve maintainability

---

# Tooling Philosophy

Use tools aggressively when they:
- accelerate development
- improve consistency
- reduce manual work
- improve architecture quality
- reduce future maintenance cost

Avoid tools when they:
- introduce unnecessary complexity
- add heavy runtime dependencies
- reduce maintainability
- conflict with project conventions

---

# Shared Skill Synchronization

Claude Code and Cursor MUST behave consistently.

Both environments should:
- follow the same architecture rules
- use the same conventions
- activate the same skill categories
- reuse the same workflows
- preserve the same project standards