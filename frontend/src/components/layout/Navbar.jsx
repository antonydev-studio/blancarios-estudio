// src/components/layout/Navbar.jsx
//
// Modos:
//   normal        — logo + nav links + botones auth (HomePage)
//   modoAgendar   — logo + "← Volver"               (AgendarCitaPage)
//   modoAuth      — logo + botón crema con labelAuth  (Login, Registro, OlvideContrasena)
//   modoHistorial — logo + "Agendar cita"             (HistorialCitasPage)
//
// Lógica del lado derecho según estado de sesión (modo normal):
//
//   Sin sesión  →  "Iniciar Sesión" (secondary)  +  "Agendar cita" (crema)
//   Cliente     →  "Historial"      (ghost)       +  "Agendar cita" (crema)
//   Admin       →  "Panel de control" (crema)
//
// Razón del cambio:
//   Cuando la administradora recarga la página, el navbar la detecta como
//   admin y le ofrece volver al panel directamente. "Cerrar sesión" sigue
//   viviendo en el sidebar del AdminPage — único lugar con contexto real
//   para esa acción — y no se duplica aquí.

import React from "react";
import { useAuth } from "../../context/AuthContext";

export default function Navbar({
  onInicio,
  onServicios,
  onResenas,
  onContacto,
  onAgendar,
  onLogin,
  onHistorial,
  onLogout,
  onAdmin,
  paginaActiva  = "inicio",
  modoAgendar   = false,
  modoAuth      = false,
  labelAuth     = "← Volver",
  modoHistorial = false,
}) {
  const { usuario, listaNegraActiva } = useAuth();
  const estaLogueado = !!usuario;
  const esAdmin      = usuario?.rol === "admin";

  const linkClass = (pagina) =>
    pagina === paginaActiva ? "nav-link-active" : "btn-ghost";

  // ── Logo ─────────────────────────────────────────────────────────────────
  const Logo = (
    <button
      type="button"
      onClick={onInicio}
      className="flex flex-col leading-none hover:opacity-80 transition-opacity"
    >
      <span className="font-display italic text-base text-blanco-suave">
        Blanca Ríos
      </span>
      <span className="brand-label block">Estudio</span>
    </button>
  );

  // ── Modo Agendar ──────────────────────────────────────────────────────────
  if (modoAgendar) {
    return (
      <header className="navbar">
        <div className="navbar-inner">
          {Logo}
          <button type="button" onClick={onInicio} className="btn-primary">
            ← Volver
          </button>
        </div>
      </header>
    );
  }

  // ── Modo Auth (login, registro, olvide contraseña) ────────────────────────
  if (modoAuth) {
    return (
      <header className="navbar">
        <div className="navbar-inner">
          {Logo}
          <button type="button" onClick={onInicio} className="btn-primary">
            {labelAuth}
          </button>
        </div>
      </header>
    );
  }

  // ── Modo Historial — logo + "Agendar cita" solo ───────────────────────────
  if (modoHistorial) {
    return (
      <header className="navbar">
        <div className="navbar-inner">
          {Logo}
          <button type="button" onClick={onAgendar} className="btn-primary">
            Agendar cita
          </button>
        </div>
      </header>
    );
  }

  // ── Modo Normal ───────────────────────────────────────────────────────────
  return (
    <header className="navbar">
      <div className="navbar-inner">

        {Logo}

        {/* Links de navegación — ocultos en móvil */}
        <nav className="hidden md:flex items-center gap-7 text-sm">
          <button type="button" onClick={onInicio} className={linkClass("inicio")}>
            Inicio
          </button>
          {onServicios && (
            <button type="button" onClick={onServicios} className={linkClass("servicios")}>
              Servicios
            </button>
          )}
          {onResenas && (
            <button type="button" onClick={onResenas} className={linkClass("resenas")}>
              Reseñas
            </button>
          )}
          {onContacto && (
            <button type="button" onClick={onContacto} className={linkClass("contacto")}>
              Contacto
            </button>
          )}
          {/* Historial — solo para clientes autenticados */}
          {estaLogueado && !esAdmin && onHistorial && (
            <button type="button" onClick={onHistorial} className={linkClass("historial")}>
              Historial
            </button>
          )}
        </nav>

        {/* ── Acciones del lado derecho ── */}
        <div className="flex items-center gap-3">

          {!estaLogueado && (
            // Sin sesión: Login + Agendar
            <>
              {onLogin && (
                <button
                  type="button"
                  onClick={onLogin}
                  className="btn-secondary"
                >
                  Iniciar Sesión
                </button>
              )}
              {onAgendar && !listaNegraActiva && (
                <button
                  type="button"
                  onClick={onAgendar}
                  className="btn-primary"
                >
                  Agendar cita
                </button>
              )}
            </>
          )}

          {estaLogueado && esAdmin && (
            // Admin: un solo CTA — volver al panel
            // "Cerrar sesión" vive exclusivamente en el sidebar del AdminPage
            <button
              type="button"
              onClick={onAdmin}
              className="btn-primary flex items-center gap-2"
            >
              <svg
                className="w-3.5 h-3.5 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 5h6v6H4V5zm10 0h6v6h-6V5zM4 15h6v6H4v-6zm10 0h6v6h-6v-6z"
                />
              </svg>
              Panel de control
            </button>
          )}

          {estaLogueado && !esAdmin && (
            // Cliente: Historial (ghost) + Agendar cita
            // "Cerrar sesión" vive en AppointmentHistoryPage — evita cierres accidentales
            <>
              <button
                type="button"
                onClick={onHistorial}
                className="btn-secondary"
              >
                Historial
              </button>
              {onAgendar && !listaNegraActiva && (
                <button
                  type="button"
                  onClick={onAgendar}
                  className="btn-primary"
                >
                  Agendar cita
                </button>
              )}
            </>
          )}

        </div>

      </div>
    </header>
  );
}