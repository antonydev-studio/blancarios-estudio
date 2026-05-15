// src/components/ui/HoraChip.jsx
//
// ÁTOMO — botón de hora individual.
// Estados:
//   seleccionada — hora de INICIO (fondo crema sólido garantizado con style)
//   enRango      — hora cubierta por la duración (tinte crema tenue)
//   bloqueada    — no disponible

import React from "react";

/**
 * Chip de selección de hora en la grilla de horarios.
 *
 * @param {string}   props.hora          — texto de la hora, ej. "10:00"
 * @param {boolean}  props.seleccionada  — true cuando es la hora de inicio elegida
 * @param {boolean}  [props.enRango]     — true cuando cae dentro del rango de duración del servicio
 * @param {boolean}  [props.bloqueada]   — true cuando la hora no está disponible
 * @param {function} props.onClick       — callback al seleccionar
 */
export default function HoraChip({
  hora,
  seleccionada,
  enRango = false,
  bloqueada = false,
  pasado = false,
  esHoraActual = false,
  onClick,
}) {
  const baseClass = "rounded-xl text-sm border transition-all duration-150 font-medium px-3 h-10 w-full";

  const style =
    pasado
      ? { background: "transparent", color: "rgba(255,255,255,0.2)", borderColor: "rgba(46,42,37,0.4)", opacity: 0.4 }
      : esHoraActual
      ? { background: "rgba(201,169,110,0.15)", color: "var(--color-crema)", borderColor: "rgba(201,169,110,0.6)" }
      : bloqueada
      ? { background: "rgba(139,32,32,0.6)", color: "#f87171", borderColor: "rgba(139,32,32,0.5)" }
      : seleccionada
      ? { background: "var(--color-crema)", color: "var(--color-negro-suave)", borderColor: "var(--color-crema)" }
      : enRango
      ? { background: "rgba(201,169,110,0.15)", color: "var(--color-crema)", borderColor: "rgba(201,169,110,0.4)" }
      : { background: "transparent", color: "var(--color-blanco-suave)", borderColor: "rgba(46,42,37,1)" };

  const cls = [
    baseClass,
    pasado || bloqueada || esHoraActual
      ? "cursor-not-allowed"
      : seleccionada || enRango
      ? ""
      : "text-blanco-suave hover:border-crema/40",
  ].join(" ");

  return (
    <button
      type="button"
      disabled={pasado || bloqueada || esHoraActual}
      onClick={onClick}
      className={cls}
      style={style}
    >
      {hora}
    </button>
  );
}