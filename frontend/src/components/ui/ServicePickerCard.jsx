// src/components/ui/ServicioPickerCard.jsx

import React from "react";

export default function ServicioPickerCard({
  nombre,
  titulo,
  descripcion,
  precio,
  duracion,
  oferta,
  precioOferta,
  seleccionado,
  onClick,
}) {
  const nombreMostrar = nombre ?? titulo;
  const precioMostrar = oferta && precioOferta != null ? precioOferta : precio;
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full block text-left rounded-3xl border-2 transition-all duration-200",
        seleccionado
          ? "bg-crema/9 border-crema shadow-[0_0_0_1px_rgba(201,169,110,0.15),0_6px_24px_rgba(201,169,110,0.10)]"
          : "bg-panel-oscuro border-panel-medio/80 hover:border-crema/40",
      ].join(" ")}
    >
      {/* Contenedor interno con padding — separado del borde */}
      <div className="px-5 py-4">

        {/* Fila: nombre + checkbox */}
        <div className="flex items-start gap-3">
          {/* Nombre — min-w-0 evita que desborde el flex */}
          <span className="font-display text-base font-semibold text-blanco-suave leading-snug flex-1 min-w-0 pr-1">
            {nombreMostrar}
          </span>

          {/* Checkbox — siempre al extremo derecho, nunca sale del borde */}
          <div
            className={[
              "mt-0.5 w-5 h-5 rounded-md border-2 shrink-0 flex items-center justify-center transition-all duration-200",
              seleccionado
                ? "border-crema bg-crema"
                : "border-texto-secundario/40 bg-transparent",
            ].join(" ")}
          >
            {seleccionado && (
              <svg
                className="w-3 h-3 text-negro-suave"
                viewBox="0 0 10 8"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="1,4 4,7 9,1" />
              </svg>
            )}
          </div>
        </div>

        {descripcion && (
          <p className="text-xs text-blanco-suave/55 leading-relaxed mt-2 mb-0 pr-8">
            {descripcion}
          </p>
        )}

        {/* Precio y duración */}
        <div
          className={[
            "flex items-center gap-3 text-xs border-t mt-3 pt-3 transition-colors duration-200",
            seleccionado ? "border-crema/20" : "border-panel-medio/50",
          ].join(" ")}
        >
          <span className="flex items-center gap-2 flex-wrap">
            {oferta && precioOferta != null ? (
              <>
                <span className="text-texto-secundario line-through">${precio}</span>
                <span className="text-crema font-semibold">${precioOferta}</span>
              </>
            ) : (
              <span className="text-crema font-semibold">${precioMostrar}</span>
            )}
          </span>
          <span className="text-blanco-suave/30">·</span>
          <span className="text-blanco-suave/50">{duracion} min</span>
        </div>

      </div>
    </button>
  );
}