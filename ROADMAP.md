# ROADMAP.md — Barber BR (Blanca Ríos Estudio)

## Estado actual

**Versión:** 1.1.0 — Refactor en progreso
**Frontend:** ✅ Live en Vercel → `blancariosestudio.com`
**Backend:** ✅ Live en Railway (temporal, migrando)
**Base de datos:** ✅ MongoDB Atlas M0
**Gestor de paquetes:** pnpm (npm prohibido)

---

## ✅ Completado — v1.0 (en producción)
- [ ] Add strict .npmrc configuration

engine-strict=true
auto-install-peers=true
strict-peer-dependencies=false

### Autenticación
- [x] Registro con verificación por código de 6 dígitos
- [x] Login con JWT (7 días)
- [x] Recuperación de contraseña en 3 pasos
- [x] Reenvío de código de verificación
- [x] Protección de rutas por rol (requireAuth, requireAdmin)

### Portal del cliente
- [x] Agendamiento sin cuenta y con cuenta
- [x] Vinculación automática de citas por teléfono al registrarse
- [x] Historial personal de citas
- [x] Cancelación (>1h anticipación)
- [x] Reagendamiento (>3h anticipación, solo una vez)
- [x] Detección de lista negra

### Panel de administración
- [x] Dashboard con métricas del día
- [x] Calendario visual de citas
- [x] Gestión de citas (confirmar, finalizar, cancelar, notas)
- [x] Catálogo de servicios CRUD
- [x] Horarios por día de la semana
- [x] Bloqueo de días y horas específicas
- [x] Días abiertos por excepción
- [x] Gestión de clientes (notas, lista negra)
- [x] Balance de movimientos financieros
- [x] Reportes por período
- [x] Editor de contenido homepage

### Backend
- [x] API REST 6 grupos de rutas
- [x] Algoritmo de conflictos de horarios
- [x] Notificaciones email (nueva cita, cancelación, reagendamiento)
- [x] CORS configurado para producción
  
---

## 🔄 En progreso — v1.1 (Refactor)

### 1. Fullstack architecture restructure
Migrar de estructura separada `backend/` + `frontend/` a estructura unificada Opción 2.

```
ANTES                          DESPUÉS
backend/src/controllers/   →   controllers/
backend/src/models/        →   models/
backend/src/middleware/    →   middleware/
backend/src/services/      →   services/
backend/src/utils/         →   utils/
frontend/src/              →   src/
frontend/public/           →   public/
frontend/vercel.json       →   vercel.json (raíz)
frontend/vite.config.js    →   vite.config.js (raíz)
backend/package.json       →   eliminado
frontend/package.json      →   package.json (raíz, único)
```

- [ ] Crear estructura de carpetas nueva en raíz
- [ ] Mover y reorganizar todos los archivos
- [ ] Crear `package.json` unificado con pnpm
- [ ] Eliminar `package.json` de backend y frontend
- [ ] Eliminar cualquier `package-lock.json` — reemplazar con `pnpm-lock.yaml`
- [ ] Eliminar `node_modules` duplicados
- [ ] Crear `pnpm-workspace.yaml` si aplica
- [ ] Verificar imports después de mover archivos

### 2. Migración a Vercel Functions
Estrategia: blue-green — nuevo backend en URL temporal, misma DB, cambio de URL al final.

- [ ] Crear `lib/mongoose.js` con conexión cacheada
- [ ] Crear `api/config/[...path].js`
- [ ] Crear `api/services/[...path].js`
- [ ] Crear `api/auth/[...path].js`
- [ ] Crear `api/appointments/[...path].js`
- [ ] Crear `api/movements/[...path].js`
- [ ] Crear `api/users/[...path].js`
- [ ] Eliminar `express-rate-limit` de dependencias
- [ ] Actualizar `vercel.json`
- [ ] Testing completo antes de cortar Railway
- [ ] Apagar Railway

### 3. Limpieza pnpm
- [ ] Asegurar que no existe ningún `npm` en scripts, documentación ni CI
- [ ] `pnpm-lock.yaml` commitado en raíz
- [ ] `.npmrc` con `engine-strict=true` si aplica
- [ ] Scripts en `package.json` usando `pnpm` o sin gestor explícito

---

## 📋 Backlog — v1.2+

- [ ] Email de confirmación al cliente cuando admin confirma su cita
- [ ] Recordatorio automático 24h antes (Vercel Cron Jobs)
- [ ] PWA — service worker (manifest.json ya existe)
- [ ] Export de reportes a PDF
- [ ] Tests unitarios para algoritmo de slots
- [ ] Seed script para datos de prueba

---

## Historial de versiones

| Versión | Estado | Descripción |
|---------|--------|-------------|
| 1.0.0 | ✅ Producción | Primera versión completa |
| 1.1.0 | 🔄 En progreso | Refactor estructura + migración Vercel Functions + pnpm |
| 1.2.0 | 📋 Backlog | Features adicionales |