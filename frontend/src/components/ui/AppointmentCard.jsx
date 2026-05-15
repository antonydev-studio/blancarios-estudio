// src/components/ui/CitaCard.jsx
//
// ÁTOMO — Tarjeta de cita del historial del cliente.
// Sin precio visible (decisión de producto).
// Responsive: compacto en móvil, más aire en tablet/desktop (sm:p-6, sm:text-lg).

import React from "react";
import StatusBadge from "./StatusBadge";

function formatearFecha(fechaStr) {
  const [year, month, day] = fechaStr.split("-").map(Number);
  const fecha = new Date(year, month - 1, day);
  return fecha.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function IconReloj() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor"
      strokeWidth="1.8" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3" />
    </svg>
  );
}

function IconCalendario() {
  return (
    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor"
      strokeWidth="1.8" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path strokeLinecap="round" d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

export default function CitaCard({ cita, esPróxima = false, acciones }) {
  const fechaFormateada = formatearFecha(cita.fecha);

  return (
    <article
      className={[
        "card rounded-3xl border-2 border-panel-medio/80 p-5 sm:p-6 transition-all duration-200",
        esPróxima
          ? "border-crema/30 shadow-[0_0_0_1px_rgba(201,169,110,0.08),0_4px_24px_rgba(201,169,110,0.08)]"
          : "hover:border-panel-medio/80",
      ].join(" ")}
    >
      {/* ── Cabecera: fecha + badge ── */}
      <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
        <div className="min-w-0">
          {esPróxima && (
            <p className="brand-label mb-1.5">Próxima cita</p>
          )}
          <p className="font-display text-base sm:text-lg font-semibold text-blanco-suave capitalize leading-snug">
            {fechaFormateada}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-crema/80 mt-1.5">
            <IconCalendario />
            {cita.hora}
          </p>
        </div>
        <StatusBadge estado={cita.estado} />
      </div>

      <div className="border-t border-panel-medio/50 mb-4 sm:mb-5" />

      {/* ── Servicios ── */}
      <div className="mb-4 sm:mb-5">
        <p className="text-[10px] text-texto-secundario uppercase tracking-widest mb-2 sm:mb-3 font-medium">
          Servicios
        </p>
        <div className="flex flex-wrap gap-2">
          {cita.servicios.map((s) => (
            <span
              key={s}
              className="text-xs text-blanco-suave/80 bg-panel-medio/40 border border-panel-medio/60 px-3 py-1 rounded-full"
            >
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* ── Footer: duración + conteo de servicios ── */}
      <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-panel-medio/40">
        <span className="flex items-center gap-1.5 text-xs text-texto-secundario">
          <IconReloj />
          {cita.duracion} min
        </span>
        {cita.servicios.length > 1 && (
          <span className="text-xs text-texto-secundario">
            {cita.servicios.length} servicios
          </span>
        )}
      </div>

      {acciones != null && (
        <div className="mt-4 pt-4 border-t border-panel-medio/40">{acciones}</div>
      )}
    </article>
  );
}