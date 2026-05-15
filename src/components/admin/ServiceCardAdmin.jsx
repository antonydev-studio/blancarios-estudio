// src/components/admin/ServiceCardAdmin.jsx
//
// ÁTOMO — Tarjeta de servicio en modo administrador.
// Reutiliza el mismo lenguaje visual de ServicioPickerCard (border-2, rounded-3xl,
// font-display, crema) para que el panel admin sea coherente con lo que ve el cliente.
// Sin imagen — solo datos. Los controles de edición se muestran en hover.

import React from "react";

/**
 * @param {object}   props
 * @param {object}   props.servicio
 * @param {function} props.onEditar        — (id) => void
 * @param {function} props.onToggleActivo  — (id) => void
 */
export default function ServiceCardAdmin({ servicio, onEditar, onToggleActivo }) {
  const activo   = servicio.activo !== false;
  const tieneOferta = servicio.oferta && servicio.precioOferta != null;

  return (
    <div
      className={[
        "relative rounded-3xl border-2 transition-all duration-200 group bg-panel-oscuro",
        activo
          ? "border-panel-medio/80 hover:border-crema/40"
          : "border-panel-medio/40 opacity-60 hover:opacity-80 hover:border-panel-medio/70",
      ].join(" ")}
    >
      {/* ── Controles — visibles en hover ── */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200">
        {/* Editar */}
        <button
          type="button"
          onClick={() => onEditar(servicio.id)}
          aria-label="Editar servicio"
          className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-crema hover:border-crema/50 hover:bg-crema/10"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
        </button>

        {/* Toggle activo */}
        <button
          type="button"
          onClick={() => onToggleActivo(servicio.id)}
          aria-label={activo ? "Desactivar servicio" : "Activar servicio"}
          className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-blanco-suave hover:border-crema/50 hover:bg-crema/10"
          title={activo ? "Desactivar" : "Activar"}
        >
          {activo ? (
            /* ojo abierto = está visible, click para ocultar */
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            /* ojo tachado = oculto, click para mostrar */
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M3 3l18 18M10.477 10.477A3 3 0 0013.5 13.5M6.228 6.228A10.45 10.45 0 003 12c1.657 3.982 5.525 6.75 9 6.75a9.86 9.86 0 004.598-1.128M9.75 9.75A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .199-.02.394-.058.584M17.772 17.772A10.45 10.45 0 0021 12c-1.657-3.982-5.525-6.75-9-6.75a9.86 9.86 0 00-4.598 1.128" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Contenido — misma estructura que ServicioPickerCard ── */}
      <div className="px-5 py-5">

        {/* Encabezado: nombre */}
        <div className="mb-3">
          <h3 className="font-display text-base font-semibold text-blanco-suave leading-snug">
            {servicio.titulo ?? servicio.nombre}
          </h3>
          <span className={[
            "inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full border font-semibold",
            activo
              ? "border-estado-confirmada/50 text-estado-confirmada bg-estado-confirmada/10"
              : "border-estado-cancelada/50 text-estado-cancelada bg-estado-cancelada/10",
          ].join(" ")}>
            {activo ? "Activo" : "Inactivo"}
          </span>
        </div>

        {/* Descripción */}
        {servicio.descripcion && (
          <p className="text-xs text-blanco-suave/55 leading-relaxed mb-4">
            {servicio.descripcion}
          </p>
        )}

        {/* Precio + duración — igual que ServicioPickerCard */}
        <div className="flex items-center gap-3 text-xs border-t border-panel-medio/50 pt-3">
          <div className="flex items-baseline gap-1.5">
            {tieneOferta ? (
              <>
                <span className="text-crema font-semibold">${servicio.precioOferta}</span>
                <span className="text-texto-secundario line-through text-[11px]">${servicio.precio}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-crema/15 border border-crema/30 text-crema font-semibold">
                  OFERTA
                </span>
              </>
            ) : (
              <span className="text-crema font-semibold">${servicio.precio}</span>
            )}
          </div>
          <span className="text-blanco-suave/30">·</span>
          <span className="text-blanco-suave/50">{servicio.duracion} min</span>
        </div>

      </div>
    </div>
  );
}