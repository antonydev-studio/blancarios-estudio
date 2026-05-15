# Barber BR — Sistema de Gestión para Barbería

Plataforma completa para gestión de citas, clientes y servicios de una barbería.  
Incluye panel de administración y portal de cliente con historial y reagendado.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express |
| Base de datos | MongoDB Atlas (Mongoose) |
| Auth | JWT + bcrypt, verificación por correo |

## Estructura del proyecto

```
BARBER-BR/
├── backend/      # API REST en Express
└── frontend/     # SPA en React + Vite
```

## Correr el proyecto localmente

### 1. Backend

```bash
cd backend
cp .env.example .env   # completar las variables (ver abajo)
npm install
npm run dev            # puerto 5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev            # puerto 5173
```

El frontend usa el proxy de Vite (`/api → localhost:5000`).  
No requiere configuración adicional para desarrollo local.

## Variables de entorno — backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<usuario>:<password>@<cluster>.mongodb.net/<db>
JWT_SECRET=una_clave_secreta_larga
EMAIL_USER=correo@gmail.com      # para envío de códigos de verificación
EMAIL_PASS=contraseña_de_app     # app password de Gmail
FRONTEND_URL=https://tu-dominio.vercel.app
```

> En desarrollo, si `EMAIL_USER`/`EMAIL_PASS` están vacíos los códigos de verificación  
> se imprimen en la consola del backend (`[DEV] Código de verificación para ...`).

## Funcionalidades principales

**Portal del cliente**
- Registro con verificación por correo
- Agendar citas (con o sin cuenta)
- Historial de citas, reagendado y cancelación
- Recuperación de contraseña

**Panel de administración**
- Dashboard con métricas del día
- Gestión de citas (confirmar, finalizar, cancelar)
- Catálogo de servicios
- Configuración de horarios y días bloqueados
- Clientes con notas y lista negra
- Balance de movimientos
- Reportes por período
