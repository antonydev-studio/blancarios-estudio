// src/components/admin/AdminSidebar.jsx
//
// Navegación lateral del panel admin.
//
// Botones principales usan los mismos estilos que el resto de la app:
//   - "Agendar cita" → btn-primary (CTA dorado)
//   - "Sitio público" → btn-secondary (borde)
//   - "Salir"        → borde rojo cancelada
//
// Modos: sidebar fijo en desktop, drawer deslizable en móvil.

import React, { useEffect, useState } from "react";
import { ADMIN_NAV_ITEMS } from "./adminNavConfig";
import { AdminNavIcon } from "./AdminNavIcons";

// ── Sub-componentes ──────────────────────────────────────────────────────────

function SidebarNav({ seccionActiva, onSelect }) {
  return (
    <nav className="flex-1 p-3 space-y-0.5" aria-label="Navegación del panel">
      {ADMIN_NAV_ITEMS.map((item) => {
        const activo = seccionActiva === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={[
              "admin-nav-item border",
              activo
                ? "admin-nav-item-active"
                : "border-transparent text-texto-secundario hover:bg-panel-medio/40 hover:text-blanco-suave",
            ].join(" ")}
          >
            <AdminNavIcon name={item.icon} className="w-5 h-5 shrink-0" />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ usuario, onSalir, onVolverHome }) {
  return (
    <footer className="p-4 border-t border-panel-medio/60 space-y-3">

      {/* Info del usuario */}
      <div className="px-1 mb-1">
        <p className="text-xs font-semibold text-blanco-suave truncate">{usuario?.nombre}</p>
        <p className="text-caption truncate">{usuario?.correo}</p>
      </div>

      {/* Botones en grid 2 columnas — sin solapamiento */}
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onVolverHome}
          className="btn-primary w-full justify-center flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
          </svg>
          Sitio
        </button>

        <button
          type="button"
          onClick={onSalir}
          className="btn-danger w-full justify-center flex items-center gap-1.5"
        >
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
          Salir
        </button>
      </div>
    </footer>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export default function AdminSidebar({
  seccionActiva,
  onCambiarSeccion,
  usuario,
  onSalir,
  onVolverHome,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  // Bloquear scroll del body cuando el drawer está abierto
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const seleccionar = (id) => {
    onCambiarSeccion(id);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Móvil: barra superior sticky ── */}
      <div className="lg:hidden admin-mobile-header">

        {/* Hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Abrir navegación"
          className="btn-icon-admin border border-panel-medio/80 text-blanco-suave hover:border-crema/40 hover:text-crema"
        >
          <AdminNavIcon name="menu" className="w-5 h-5" />
        </button>

        {/* Título centrado */}
        <div className="min-w-0 flex-1 text-center">
          <p className="brand-label text-[9px]">Panel Admin</p>
          <p className="font-display text-sm font-semibold text-blanco-suave truncate">
            {ADMIN_NAV_ITEMS.find((i) => i.id === seccionActiva)?.label ?? "Panel"}
          </p>
        </div>

      </div>

      {/* ── Móvil: drawer deslizable ── */}
      <div
        className={[
          "lg:hidden fixed inset-0 z-40 transition-opacity duration-300",
          mobileOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
        aria-hidden={!mobileOpen}
      >
        {/* Overlay oscuro */}
        <button
          type="button"
          className="absolute inset-0 bg-negro-suave/80 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
          aria-label="Cerrar menú"
        />

        {/* Panel del drawer */}
        <aside
          className={[
            "absolute left-0 top-0 bottom-0 flex w-[min(20rem,92vw)] flex-col",
            "admin-sidebar-panel shadow-2xl transition-transform duration-300 ease-out",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          {/* Cabecera del drawer */}
          <div className="flex items-center justify-between gap-2 border-b border-panel-medio/60 p-4">
            <div className="min-w-0">
              <p className="brand-label text-[10px]">Panel Admin</p>
              <p className="font-display text-sm font-semibold text-blanco-suave">
                Administración
              </p>
            </div>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Cerrar"
              className="btn-icon-admin border border-panel-medio text-texto-secundario hover:border-crema/40 hover:text-blanco-suave"
            >
              <AdminNavIcon name="close" className="w-5 h-5" />
            </button>
          </div>

          <SidebarNav seccionActiva={seccionActiva} onSelect={seleccionar} />
          <SidebarFooter usuario={usuario} onSalir={onSalir} onVolverHome={onVolverHome} />
        </aside>
      </div>

      {/* ── Desktop: columna lateral fija ── */}
      <aside className="admin-sidebar-panel hidden lg:flex lg:w-[17rem] xl:w-[19rem] flex-col">

        {/* Identidad — centrada, con más respiración */}
        <div className="px-5 pt-8 pb-6 text-center border-b border-panel-medio/60">
          <p className="brand-label text-[10px] mb-2">Panel Admin</p>
          <p className="font-display text-lg font-semibold text-blanco-suave leading-tight">
            Administración
          </p>
          <p className="text-caption mt-1">Blanca Ríos Estudio</p>
        </div>

        {/* Nav ocupa el espacio disponible */}
        <SidebarNav seccionActiva={seccionActiva} onSelect={onCambiarSeccion} />

        {/* Footer pegado abajo */}
        <SidebarFooter usuario={usuario} onSalir={onSalir} onVolverHome={onVolverHome} />
      </aside>
    </>
  );
}