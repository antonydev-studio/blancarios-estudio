// src/components/ui/RazonCard.jsx
//
// ÁTOMO — tarjeta de "razón para elegirnos".
// Separada de ServiceCard porque aunque visualmente parecida,
// tiene estructura diferente (sin imagen) y puede cambiar independientemente.

import React from "react";

/**
 * @param {object} props
 * @param {string} props.titulo
 * @param {string} props.texto
 */
export default function RazonCard({ titulo, texto }) {
  return (
    <div className="card p-5">
      {/* Acento dorado — identidad visual de Blanca Ríos */}
      <div className="w-6 h-0.5 bg-crema mb-4 rounded-full" />

      <h3 className="font-semibold text-sm text-blanco-suave mb-2">
        {titulo}
      </h3>

      <p className="text-[12px] text-texto-secundario leading-relaxed">
        {texto}
      </p>
    </div>
  );
}