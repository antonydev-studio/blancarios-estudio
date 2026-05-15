// src/components/ui/MetricCard.jsx

import React from "react";

/**
 * Tarjeta de métrica para el dashboard de admin.
 *
 * @param {string}  props.label                   — etiqueta descriptiva de la métrica
 * @param {*}       props.value                   — valor principal a mostrar
 * @param {string}  [props.valueClassName]        — clase Tailwind para colorear el valor (default: "text-blanco-suave")
 * @param {{positivo: boolean, valor: number}} [props.trend] — flecha de tendencia opcional
 */
export default function MetricCard({
  label,
  value,
  valueClassName = "text-blanco-suave",
  trend,
}) {
  return (
    <div className="card p-4 sm:p-5">
      <p className="text-[10px] text-texto-secundario uppercase tracking-widest mb-1 font-medium">
        {label}
      </p>
      <div className="flex items-baseline gap-2 flex-wrap">
        <p className={`font-display text-2xl font-bold ${valueClassName}`}>{value}</p>
        {trend != null && (
          <span
            className={
              trend.positivo ? "text-estado-confirmada text-sm" : "text-estado-cancelada text-sm"
            }
            aria-hidden
          >
            {trend.positivo ? "↑" : "↓"} {Math.abs(trend.valor)}%
          </span>
        )}
      </div>
    </div>
  );
}
