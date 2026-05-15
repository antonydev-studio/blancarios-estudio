// src/components/sections/ServiciosSection.jsx
//
// SECCIÓN — grid de servicios.
// Recibe el array desde fuera: el día que el backend esté listo,
// HomePage le pasará los datos del fetch sin tocar este componente.

import React from "react";
import ServiceCard from "../ui/ServiceCard";

/**
 * @param {object}     props
 * @param {import("../../data/servicios").Servicio[]} props.servicios
 */
export default function ServiciosSection({ servicios }) {
  return (
    <section id="servicios" className="section-wrap pb-12 scroll-mt-header">
      <h2 className="section-title mb-1">
        Nuestros Servicios
      </h2>
      <p className="section-subtitle mb-7">
        Cada servicio incluye atención personalizada y productos premium.
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        {servicios.map((servicio) => (
          <ServiceCard key={servicio.id} {...servicio} />
        ))}
      </div>
    </section>
  );
}