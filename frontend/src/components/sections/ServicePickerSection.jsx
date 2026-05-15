// src/components/sections/ServicioPickerSection.jsx

import React, { useState } from "react";
import ServicePickerCard from "../ui/ServicePickerCard";

export default function ServicioPickerSection({
  servicios,
  serviciosSeleccionados,
  onToggle,
  modoSingle = false,
  servicioSeleccionadoId = null,
  onSelectSingle,
  mostrarEncabezado = true,
}) {
  const [abierto, setAbierto] = useState(false);

  if (modoSingle) {
    return (
      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {servicios
          .filter((s) => s.activo !== false)
          .map((servicio) => (
            <ServicePickerCard
              key={servicio.id}
              {...servicio}
              nombre={servicio.nombre ?? servicio.titulo}
              seleccionado={servicioSeleccionadoId === servicio.id}
              onClick={() => onSelectSingle?.(servicio.id)}
            />
          ))}
      </div>
    );
  }

  const visibles = servicios.filter((s) => s.activo !== false);

  const duracionTotal = visibles
    .filter((s) => serviciosSeleccionados.includes(s.id))
    .reduce((acc, s) => acc + s.duracion, 0);

  const precioTotal = visibles
    .filter((s) => serviciosSeleccionados.includes(s.id))
    .reduce((acc, s) => acc + (s.oferta && s.precioOferta != null ? s.precioOferta : s.precio), 0);

  const haySeleccion = serviciosSeleccionados.length > 0;

  return (
    <section>

      {/* Encabezado del paso */}
      {mostrarEncabezado && (
        <div className="flex items-center gap-3 mb-4">
          <span className="w-6 h-6 rounded-full bg-crema/15 border border-crema/40 flex items-center justify-center text-[10px] font-bold text-crema shrink-0">
            1
          </span>
          <h2 className="text-sm font-semibold text-blanco-suave">
            Selecciona tu Servicio
          </h2>
        </div>
      )}

      {/* Contenedor único — un solo borde rodea todo */}
      <div
        className={[
          "rounded-3xl border-2 overflow-hidden transition-all duration-200 bg-panel-oscuro",
          haySeleccion ? "border-crema/50" : "border-panel-medio/80",
        ].join(" ")}
      >
        {/* Header / botón acordeón */}
        <button
          type="button"
          onClick={() => setAbierto((v) => !v)}
          className="w-full block text-left"
        >
          <div className="px-6 py-5 flex items-center justify-between gap-3">
            <div className="min-w-0">
              {haySeleccion ? (
                <>
                  <p className="text-sm font-semibold text-blanco-suave leading-snug">
                    {serviciosSeleccionados.length === 1
                      ? (() => {
                          const s = visibles.find((x) => x.id === serviciosSeleccionados[0]);
                          return s?.nombre ?? s?.titulo;
                        })()
                      : `${serviciosSeleccionados.length} servicios seleccionados`}
                  </p>
                  <p className="text-[11px] text-texto-secundario mt-1">
                    {duracionTotal} min · <span className="text-crema font-medium">${precioTotal}</span>
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-blanco-suave">
                    Selecciona tu servicio
                  </p>
                  <p className="text-[11px] text-texto-secundario mt-1">
                    Presiona para ver los disponibles
                  </p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {haySeleccion && (
                <span className="text-[10px] font-semibold text-crema bg-crema/10 border border-crema/30 px-2.5 py-1 rounded-full">
                  {serviciosSeleccionados.length}
                </span>
              )}
              <svg
                className={`w-4 h-4 text-texto-secundario transition-transform duration-300 ${abierto ? "rotate-180" : ""}`}
                viewBox="0 0 12 12" fill="none" stroke="currentColor"
                strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              >
                <polyline points="2,4 6,8 10,4" />
              </svg>
            </div>
          </div>
        </button>

        {/* Panel desplegable — dentro del mismo contenedor */}
        {abierto && (
          <div className="border-t border-panel-medio/60 px-4 pb-5 pt-4 space-y-3">
            {visibles.map((servicio) => (
              <ServicePickerCard
                key={servicio.id}
                {...servicio}
                nombre={servicio.nombre ?? servicio.titulo}
                seleccionado={serviciosSeleccionados.includes(servicio.id)}
                onClick={() => onToggle(servicio.id)}
              />
            ))}

            {haySeleccion && (
              <div className="rounded-xl border border-crema/20 bg-crema/5 px-4 py-3 flex items-center justify-between">
                <div className="text-[11px] text-texto-secundario">
                  Duración estimada
                  <span className="ml-2 text-blanco-suave font-semibold">{duracionTotal} min</span>
                </div>
                <div className="text-[11px] text-texto-secundario">
                  Total <span className="ml-2 text-crema font-semibold">${precioTotal}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="w-full text-center text-[11px] text-texto-secundario hover:text-blanco-suave transition-colors pt-1"
            >
              Cerrar ↑
            </button>
          </div>
        )}
      </div>

    </section>
  );
}