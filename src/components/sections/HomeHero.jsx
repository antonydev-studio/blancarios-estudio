// src/components/sections/HomeHero.jsx

import React from "react";

// TEMPORAL: URL externa hasta tener la foto real de la barbería.
// Cuando tengas hero-barberia.jpg en /public/, cambia la constante:
// const HERO_IMG = "/hero-barberia.jpg";
const HERO_IMG = "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1400&q=80";

export default function HomeHero({ onAgendar, heroImg }) {
  const imagenFondo = heroImg || HERO_IMG;
  return (
    <section id="inicio" className="section-wrap pt-8 pb-10 scroll-mt-header">
      <div className="relative rounded-2xl overflow-hidden h-[260px] md:h-[310px]">

        {/* Fondo difuminado */}
        <div className="absolute inset-0">
          <div
            className="w-full h-full bg-cover bg-center scale-105"
            style={{
              backgroundImage: `url('${imagenFondo}')`,
              filter: "blur(2px)",
            }}
          />
        </div>

        {/* Overlay oscuro + toque dorado */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 hero-overlay-gradient" />

        {/* Contenido */}
        <div className="relative h-full flex flex-col items-center justify-center text-center px-6">
          <p className="brand-label mb-3 tracking-[0.35em]">
            Blanca Ríos Estudio
          </p>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-blanco-suave leading-tight max-w-2xl">
          Mas que un servicio, una experiencia
          </h1>

          <button
            type="button"
            onClick={onAgendar}
            className="btn-primary btn-primary-hero mt-6"
          >
            Agendar cita
          </button>
        </div>

      </div>
    </section>
  );
}