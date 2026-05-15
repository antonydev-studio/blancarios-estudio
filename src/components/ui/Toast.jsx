// src/components/ui/Toast.jsx

import React from "react";

export default function Toast({ mensaje, tipo = "error", posicion = "bottom", onCerrar }) {
  if (!mensaje) return null;

  const color =
    tipo === "error"
      ? "border-estado-cancelada/40 bg-estado-cancelada/10 text-estado-cancelada"
      : "border-estado-confirmada/40 bg-estado-confirmada/10 text-estado-confirmada";

  // 🔥 NUEVAS POSICIONES (no rompe las existentes)
  let posicionClases = "bottom-6";

  if (posicion === "top") {
    posicionClases = "top-6";
  }

  if (posicion === "center") {
    posicionClases = "top-1/2 -translate-y-1/2";
  }

  return (
    <div
      className={`fixed ${posicionClases} left-1/2 -translate-x-1/2 z-50
                  w-[min(92vw,460px)] card border px-5 py-4
                  flex items-center justify-between gap-4
                  shadow-2xl backdrop-blur-md
                  ${color}`}
      role="alert"
    >
      <p className="text-base font-semibold">{mensaje}</p>

      <button
        type="button"
        onClick={onCerrar}
        className="text-lg leading-none shrink-0 opacity-70 hover:opacity-100"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}