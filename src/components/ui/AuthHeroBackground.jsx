// src/components/ui/AuthHeroBackground.jsx
//
// ÁTOMO — Fondo de imagen difuminada con overlay oscuro.
// Reutilizable en: LoginPage, RegistroPage, y cualquier página de auth.
//
// Props:
//   src   — URL de la imagen (puede ser import local o URL externa)
//   alt   — texto alternativo (accesibilidad)

import React from "react";

// TEMPORAL: imagen de Unsplash hasta tener fotos reales de la barbería.
// Para cambiar: importa tu imagen y pásala como prop src.
const DEFAULT_IMG =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1400&q=80";

export default function AuthHeroBackground({ src = DEFAULT_IMG, alt = "Blanca Ríos Estudio" }) {
  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {/* Imagen difuminada */}
      <div
        role="img"
        aria-label={alt}
        className="w-full h-full bg-cover bg-center scale-105"
        style={{
          backgroundImage: `url('${src}')`,
          filter: "blur(3px)",
        }}
      />
      {/* Overlay oscuro */}
      <div className="absolute inset-0 bg-black/60" />
      {/* Toque dorado sutil — identidad Blanca Ríos */}
      <div className="absolute inset-0 hero-overlay-gradient" />
    </div>
  );
}