// src/components/sections/TestimonioSection.jsx
//
// Por ahora muestra un testimonio estático.
// Futuro: recibir props.testimonios[] y mapearlos con TestimonioCard.

import React from "react";

export default function TestimonioSection() {
  return (
    <section className="section-wrap py-12">
      <h2 className="section-title text-center mb-8">
        Lo que dicen nuestros clientes
      </h2>

      {/* TODO: map() sobre props.testimonios cuando venga del backend */}
      <blockquote className="card max-w-2xl mx-auto px-8 py-10 text-center">
        <p className="text-sm section-subtitle italic leading-relaxed mb-4">
          "El mejor corte que he tenido en años. La atención al detalle es
          increíble y el ambiente es genial. Volveré sin duda."
        </p>
        <footer className="text-sm font-semibold text-blanco-suave">
          — Carlos M.
        </footer>
      </blockquote>
    </section>
  );
}