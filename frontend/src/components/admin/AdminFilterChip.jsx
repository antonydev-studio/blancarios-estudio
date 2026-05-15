// src/components/admin/AdminFilterChip.jsx
//
// Tamaño FIJO: w-24 h-10 para que todos los chips sean exactamente iguales
// sin importar la longitud del texto — la fila se ve uniforme y estética.

import React from "react";

export default function AdminFilterChip({ children, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex w-24 h-10 items-center justify-center rounded-full border",
        "text-xs font-semibold transition-all duration-150",
        selected
          ? "chip-filter-selected"
          : "border-panel-medio/80 bg-panel-oscuro text-texto-secundario hover:border-crema/40 hover:text-blanco-suave",
      ].join(" ")}
    >
      {children}
    </button>
  );
}