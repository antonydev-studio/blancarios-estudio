// src/components/ui/BaseDrawer.jsx

import React, { useEffect } from "react";

/**
 * Panel lateral deslizante (drawer) reutilizable.
 *
 * @param {boolean}     props.abierto   — controla visibilidad del drawer
 * @param {function}    props.onCerrar  — callback al cerrar (backdrop click, Escape, botón)
 * @param {string}      props.titulo    — texto del encabezado del drawer
 * @param {React.ReactNode} props.children — contenido del cuerpo del drawer
 */
export default function BaseDrawer({ abierto, onCerrar, titulo, children }) {
  useEffect(() => {
    if (!abierto) return;
    const onKey = (e) => {
      if (e.key === "Escape") onCerrar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abierto, onCerrar]);

  return (
    <div
      className={[
        "fixed inset-0 z-50 flex justify-end transition-opacity duration-300",
        abierto ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
      ].join(" ")}
      aria-hidden={!abierto}
    >
      <button
        type="button"
        className="absolute inset-0 bg-negro-suave/70 backdrop-blur-[2px] transition-opacity"
        onClick={onCerrar}
        aria-label="Cerrar panel"
      />
      <aside
        className={[
          "relative h-full w-full md:w-[520px] lg:w-[580px] bg-panel-oscuro border-l border-panel-medio shadow-2xl",
          "transform transition-transform duration-300 ease-out flex flex-col",
          abierto ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-panel-medio/80 shrink-0">
          <h2 className="font-display text-lg font-semibold text-blanco-suave">{titulo}</h2>
          <button
            type="button"
            onClick={onCerrar}
            className="btn-primary"
            aria-label="Cerrar"
          >
            Cerrar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))]">
          {children}
        </div>
      </aside>
    </div>
  );
}
