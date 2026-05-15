// src/pages/NotFoundPage.jsx
//
// PÁGINA — 404: ruta no encontrada.

import React from "react";
import Navbar  from "../components/layout/Navbar";
import Footer  from "../components/layout/Footer";

export default function NotFoundPage({ onVolverInicio }) {
  return (
    <div className="min-h-screen bg-fondo flex flex-col">
      <Navbar onVolverInicio={onVolverInicio} />

      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-[8rem] leading-none font-display font-bold text-crema/20 select-none">
            404
          </p>
          <h1 className="text-2xl font-semibold text-blanco-suave mt-2 mb-2">
            Página no encontrada
          </h1>
          <p className="text-texto-secundario text-sm mb-8">
            La dirección que buscas no existe o fue movida.
          </p>
          <button
            type="button"
            onClick={onVolverInicio}
            className="btn-primary px-8"
          >
            Volver al inicio
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
}
