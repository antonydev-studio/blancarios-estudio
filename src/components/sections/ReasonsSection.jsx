// src/components/sections/RazonesSection.jsx

import React from "react";
import ReasonCard from "../ui/ReasonCard";

/**
 * @param {object} props
 * @param {Array}  props.razones
 */
export default function RazonesSection({ razones }) {
  return (
    <section id="por-que" className="section-wrap py-12 scroll-mt-header">
      <h2 className="section-title mb-2">
        ¿Por qué elegirnos?
      </h2>
      <p className="section-subtitle max-w-lg mb-8">
        Combinamos técnicas tradicionales con estilos modernos, usando solo
        los mejores productos para que te veas y te sientas increíble.
      </p>

      <div className="grid md:grid-cols-3 gap-5">
        {razones.map((razon) => (
          <ReasonCard key={razon.id} {...razon} />
        ))}
      </div>
    </section>
  );
}