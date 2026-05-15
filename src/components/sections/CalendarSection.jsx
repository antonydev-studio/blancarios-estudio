// src/components/sections/CalendarioSection.jsx
//
// SECCIÓN — Paso 2 del flujo de agendado.
// Lógica de slots:
//   - todosLosSlots: todos los horarios posibles (9:00 AM–9:00 PM cada 15 min)
//   - horasBloqueadas: slots ocupados por citas existentes (vendrá del backend)
//   - duracionConBuffer: duración real + buffer de limpieza → define el rango visual
//   - horasDisponibles = todosLosSlots - horasBloqueadas
//
import React, { useMemo } from "react";
import MonthCalendar from "../ui/MonthCalendar";
import TimeChip      from "../ui/TimeChip";

// Convierte "02:30 PM" → minutos desde medianoche (870)
function horaAMinutos(horaStr) {
  const [time, period] = horaStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

// Convierte minutos desde medianoche → "02:30 PM"
function minutosAHora(min) {
  const h      = Math.floor(min / 60);
  const m      = min % 60;
  const period = h < 12 ? "AM" : "PM";
  const h12    = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${String(h12).padStart(2,"0")}:${String(m).padStart(2,"0")} ${period}`;
}

/**
 * @param {object}   props
 * @param {Date}     props.mesActual
 * @param {Date}     props.fechaSeleccionada
 * @param {Date}     props.hoy
 * @param {string}   props.horaSeleccionada       — "09:00 AM" | ""
 * @param {number}   props.duracionTotal           — minutos del servicio (para mostrar al cliente)
 * @param {number}   props.duracionConBuffer        — duracion + buffer (para colorear el rango)
 * @param {string[]} props.todosLosSlots            — todos los slots posibles generados en AgendarCitaPage
 * @param {string[]} props.horasBloqueadas          — slots ocupados (citas existentes + horas bloqueadas por admin)
 * @param {function} props.onCambiarMes
 * @param {function} props.onSeleccionarFecha
 * @param {function} props.onSeleccionarHora
 */
export default function CalendarioSection({
  mesActual,
  fechaSeleccionada,
  hoy,
  horaSeleccionada,
  duracionTotal      = 0,
  duracionConBuffer  = 0,
  todosLosSlots      = [],
  horasBloqueadas    = [],
  diasBloqueados     = [],
  diasSemanaCerrados = [],
  cargandoSlots      = false,
  onCambiarMes,
  onSeleccionarFecha,
  onSeleccionarHora,
}) {
  const horasBloqueadasSet = useMemo(
    () => new Set(horasBloqueadas),
    [horasBloqueadas]
  );

  const esHoy = useMemo(
    () =>
      fechaSeleccionada.getFullYear() === hoy.getFullYear() &&
      fechaSeleccionada.getMonth()    === hoy.getMonth()    &&
      fechaSeleccionada.getDate()     === hoy.getDate(),
    [fechaSeleccionada, hoy]
  );

  const ahoraMin = useMemo(() => {
    if (!esHoy) return -1;
    const n = new Date();
    return n.getHours() * 60 + n.getMinutes();
  }, [esHoy]);

  // Calcula rango visual (usa duracionConBuffer para proteger el tiempo de Blanca)
  const { horasEnRango, horaFin } = useMemo(() => {
    if (!horaSeleccionada || duracionConBuffer <= 0)
      return { horasEnRango: new Set(), horaFin: null };

    const inicioMin = horaAMinutos(horaSeleccionada);
    const finMin    = inicioMin + duracionConBuffer;

    const rango = new Set(
      todosLosSlots.filter((h) => {
        const hMin = horaAMinutos(h);
        return hMin > inicioMin && hMin < finMin;
      })
    );

    // horaFin = inicio + duracionTotal (lo que ve el cliente, sin buffer)
    const finClienteMin = inicioMin + duracionTotal;
    return {
      horasEnRango: rango,
      horaFin: minutosAHora(finClienteMin),
    };
  }, [horaSeleccionada, duracionTotal, duracionConBuffer, todosLosSlots]);

  return (
    <section>
      {/* Encabezado del paso */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-6 h-6 rounded-full bg-crema/15 border border-crema/40 flex items-center justify-center text-[10px] font-bold text-crema shrink-0">
          2
        </span>
        <h2 className="text-sm font-semibold text-blanco-suave">
          Elige Fecha y Hora
        </h2>
      </div>

      {/* Calendario */}
      <MonthCalendar
        mesActual={mesActual}
        fechaSeleccionada={fechaSeleccionada}
        hoy={hoy}
        onCambiarMes={onCambiarMes}
        onSeleccionarFecha={onSeleccionarFecha}
        diasBloqueados={diasBloqueados}
        diasSemanaCerrados={diasSemanaCerrados}
      />

      {/* Aviso de cortesía */}
      <div className="mt-4 rounded-2xl border border-panel-medio/60 bg-panel-oscuro px-4 py-3 space-y-2">
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-crema shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-xs text-blanco-suave/70">
            Nuestros servicios incluyen <span className="text-blanco-suave font-medium">bebida de cortesía</span> de bienvenida.
          </p>
        </div>
        <div className="border-t border-panel-medio/50" />
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-crema shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-xs text-blanco-suave/70">
            Llega <span className="text-blanco-suave font-medium">5 min antes</span> de tu cita.
          </p>
        </div>
        <div className="border-t border-panel-medio/50" />
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 text-crema shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-xs text-blanco-suave/70">
            Citas no atendidas en los primeros <span className="text-blanco-suave font-medium">5 min</span> serán canceladas.
          </p>
        </div>
      </div>

      {/* ── Selector de hora — siempre visible ──────────────────────────── */}
      <div className="mt-5">

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-3">
          <p className="text-[11px] font-medium text-texto-secundario uppercase tracking-widest">
            Hora de inicio
          </p>
          {horasEnRango.size > 0 && (
            <p className="text-[10px] text-crema/70 flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 rounded-sm bg-crema/20 border border-crema/40" />
              Tiempo reservado
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {todosLosSlots.map((hora) => {
            const esPasado  = esHoy && horaAMinutos(hora) <= ahoraMin;
            const bloqueada = !esPasado && (cargandoSlots || horasBloqueadasSet.has(hora));
            return (
              <TimeChip
                key={hora}
                hora={hora}
                seleccionada={hora === horaSeleccionada}
                enRango={!esPasado && !bloqueada && horasEnRango.has(hora)}
                bloqueada={bloqueada}
                pasado={esPasado}
                onClick={esPasado || bloqueada ? undefined : () => onSeleccionarHora(hora)}
              />
            );
          })}
        </div>

        {horaSeleccionada && duracionTotal > 0 && horaFin && (
          <div className="mt-3 flex items-center gap-3 px-1 text-xs text-texto-secundario">
            <span className="text-crema font-semibold">{horaSeleccionada}</span>
            <span>→</span>
            <span className="text-blanco-suave">{horaFin}</span>
            <span className="ml-auto text-texto-secundario">
              {duracionTotal >= 60
                ? `${Math.floor(duracionTotal / 60)}h${duracionTotal % 60 > 0 ? ` ${duracionTotal % 60}min` : ""}`
                : `${duracionTotal} min`}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}