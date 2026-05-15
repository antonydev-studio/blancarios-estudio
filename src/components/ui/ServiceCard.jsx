// src/components/ui/ServiceCard.jsx
//
// ÁTOMO — unidad más pequeña y reutilizable del sistema.
// Una sola responsabilidad: mostrar UN servicio.
// Se usa en HomePage y también en AgendarCitaPage (selección de servicio).

import React from "react";

/**
 * @param {object}  props
 * @param {string}  props.titulo
 * @param {string}  props.descripcion
 * @param {string}  props.imagen
 * @param {number}  [props.precio]     — opcional, se muestra si existe
 * @param {number}  [props.duracion]   — en minutos, opcional
 */
export default function ServiceCard({
  titulo,
  descripcion,
  imagen,
  precio,
  duracion,
  oferta,
  precioOferta,
}) {
  return (
    <article className="card overflow-hidden group">
      {/* Imagen con zoom en hover — solo CSS, sin JS */}
      <div className="overflow-hidden h-40">
        <img
          src={imagen}
          alt={titulo}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="p-4">
        <h4 className="font-display text-sm font-semibold mb-1 text-blanco-suave">
          {titulo}
        </h4>

        <p className="text-[12px] text-texto-secundario leading-relaxed mb-3">
          {descripcion}
        </p>

      </div>
    </article>
  );
}