// src/components/ui/CalendarioMes.jsx
//
// ÁTOMO — grid de calendario puro.
// Solo sabe dibujar un mes. No conoce "citas" ni "disponibilidad".
// Recibe todo por props: datos, estado activo, callbacks.
// Reutilizable: admin dashboard, reschedule, cualquier picker de fecha.

import React from "react";

const NOMBRES_DIA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const NOMBRES_MES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];

/**
 * Genera el array de días del mes (con nulls al inicio para alinear la semana).
 * @param {Date} fechaBase
 * @returns {(Date|null)[]}
 */
function generarDiasDelMes(fechaBase) {
  const year  = fechaBase.getFullYear();
  const month = fechaBase.getMonth();
  const primerDia  = new Date(year, month, 1);
  const ultimoDia  = new Date(year, month + 1, 0);
  const inicioGrid = primerDia.getDay(); // 0=Dom
  const totalDias  = ultimoDia.getDate();

  const dias = [];
  for (let i = 0; i < inicioGrid; i++) dias.push(null);
  for (let d = 1; d <= totalDias; d++) dias.push(new Date(year, month, d));
  return dias;
}

function esMismaFecha(a, b) {
  return (
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

/**
 * @param {object}   props
 * @param {Date}     props.mesActual           — primer día del mes a mostrar
 * @param {Date}     props.fechaSeleccionada
 * @param {Date}     props.hoy
 * @param {function} props.onCambiarMes        — (delta: -1|1) => void
 * @param {function} props.onSeleccionarFecha  — (fecha: Date) => void
 * @param {Date[]}   [props.diasBloqueados]    — futuro: días sin disponibilidad
 */
export default function CalendarioMes({
  mesActual,
  fechaSeleccionada,
  hoy,
  onCambiarMes,
  onSeleccionarFecha,
  diasBloqueados = [],
  diasSemanaCerrados = [],
  modoMultiSelect = false,
  onToggleDiaBloqueado,
  compacto = false,
  renderDiaExtra,
}) {
  const diasMes = generarDiasDelMes(mesActual);
  const titulo  = `${NOMBRES_MES[mesActual.getMonth()]} ${mesActual.getFullYear()}`;

  return (
    <div className={compacto ? "card p-3" : "card p-5"}>
      {/* ── Encabezado con navegación de mes ── */}
      <div className="flex items-center justify-between mb-5">
        <button
          type="button"
          onClick={() => onCambiarMes(-1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-panel-medio
                     text-texto-secundario hover:text-blanco-suave hover:border-crema/50 transition-all text-xs"
        >
          ‹
        </button>

        <span className="font-display text-sm font-semibold text-blanco-suave">
          {titulo}
        </span>

        <button
          type="button"
          onClick={() => onCambiarMes(1)}
          className="w-7 h-7 flex items-center justify-center rounded-lg border border-panel-medio
                     text-texto-secundario hover:text-blanco-suave hover:border-crema/50 transition-all text-xs"
        >
          ›
        </button>
      </div>

      {/* ── Nombres de días ── */}
      <div className="grid grid-cols-7 mb-1">
        {NOMBRES_DIA.map((d) => (
          <div
            key={d}
            className="h-7 flex items-center justify-center text-[10px] text-texto-secundario font-medium"
          >
            {d}
          </div>
        ))}
      </div>

      {/* ── Grid de días ── */}
      <div className="grid grid-cols-7 gap-1 text-xs">
        {diasMes.map((fecha, i) => {
          if (!fecha) return <div key={`v-${i}`} className="h-8" />;

          const seleccionado = esMismaFecha(fecha, fechaSeleccionada);
          const esHoy        = esMismaFecha(fecha, hoy);
          const bloqueado    = diasBloqueados.some((d) => esMismaFecha(d, fecha));
          const cerradoSemana = diasSemanaCerrados.includes(fecha.getDay());
          const esPasado     = fecha < new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

          if (modoMultiSelect) {
            const styleBloque = bloqueado
              ? { backgroundColor: "rgba(139,32,32,0.35)", color: "var(--color-blanco-suave)" }
              : {};
            return (
              <button
                key={fecha.toISOString()}
                type="button"
                disabled={esPasado || cerradoSemana}
                onClick={() => onToggleDiaBloqueado?.(fecha)}
                style={styleBloque}
                className={[
                  "h-auto min-h-[2.25rem] py-0.5 w-full rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150 text-xs font-semibold",
                  esPasado
                    ? "text-texto-secundario/25 cursor-not-allowed"
                    : bloqueado
                    ? "border border-estado-cancelada/30 hover:opacity-90"
                    : esHoy
                    ? "border border-crema text-crema hover:bg-crema/10"
                    : "text-blanco-suave hover:bg-panel-medio/80",
                ].join(" ")}
              >
                <span>{fecha.getDate()}</span>
                {renderDiaExtra?.(fecha)}
              </button>
            );
          }

          return (
            <button
              key={fecha.toISOString()}
              type="button"
              disabled={bloqueado || esPasado || cerradoSemana}
              onClick={() => onSeleccionarFecha(fecha)}
              style={seleccionado ? { backgroundColor: "var(--color-crema)", color: "var(--color-negro-suave)" } : {}}
              className={[
                "h-9 w-full rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all duration-150 text-xs font-semibold",
                esPasado
                  ? "text-texto-secundario/25 cursor-not-allowed"
                  : bloqueado || cerradoSemana
                  ? "!bg-red-900/40 !text-red-300 border !border-red-800/50 cursor-not-allowed"
                  : seleccionado
                  ? "shadow-[0_2px_12px_rgba(201,169,110,0.45)] scale-105"
                  : esHoy
                  ? "border border-crema text-crema hover:bg-crema/10"
                  : "text-blanco-suave hover:bg-panel-medio/80",
              ].join(" ")}
            >
              <span>{fecha.getDate()}</span>
              {renderDiaExtra?.(fecha)}
            </button>
          );
        })}
      </div>
    </div>
  );
}