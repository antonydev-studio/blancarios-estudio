// src/pages/admin/AvailabilitySection.jsx
//
// Sección unificada de disponibilidad — tres bloques en un scroll.
// Absorbe la lógica de ScheduleConfig y DayBlocker directamente.
// ScheduleConfig.jsx y DayBlocker.jsx ya no se importan.

import React, { useMemo, useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createAdminApi } from "../../hooks/useAdminApi";
import { useAdminData } from "../../hooks/useAdminData";
import AdminSectionHeader from "../../components/admin/AdminSectionHeader";
import MonthCalendar      from "../../components/ui/MonthCalendar";
import { fechaISO, parseYMD, generarSlots, getHorarioDia, horaAMinutos } from "../../utils/slots";

// ── Helpers ───────────────────────────────────────────────────────────────────

// Genera opciones 12h AM/PM para los selects de hora de apertura/cierre.
function opcionesHora(desde, hasta) {
  const result = [];
  for (let h = desde; h <= hasta; h++) {
    const period = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    result.push({ value: h, label: `${String(h12).padStart(2, "0")}:00 ${period}` });
  }
  return result;
}

// Comparación de fecha sin hora (igual que en MonthCalendar, pero local).
function esMismaFecha(a, b) {
  return (
    a && b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth()    === b.getMonth()    &&
    a.getDate()     === b.getDate()
  );
}

// ── Selector de hora custom ───────────────────────────────────────────────────

function HoraSelect({ value, opciones, onChange, disabled = false, className = "relative flex-1 min-w-0" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const etiqueta = opciones.find((o) => o.value === value)?.label ?? "—";

  return (
    <div ref={ref} className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOpen((v) => !v)}
        className={[
          "flex items-center justify-between gap-1 w-full",
          "border-2 border-panel-medio rounded-full text-blanco-suave font-semibold transition-colors",
          "px-2.5 py-2 text-xs",
          disabled ? "opacity-50 cursor-default" : "hover:bg-panel-medio/60",
          open ? "border-crema/50 text-crema" : "",
        ].join(" ")}
      >
        <span className="truncate">{etiqueta}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          viewBox="0 0 12 12" fill="none" stroke="currentColor"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <polyline points="2,4 6,8 10,4" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-full z-50 bg-panel-oscuro border-2 border-panel-medio rounded-2xl shadow-xl overflow-y-auto max-h-[50vh]">
          {opciones.map(({ value: v, label: lbl }) => (
            <button
              key={v}
              type="button"
              onClick={() => { onChange(v); setOpen(false); }}
              className={[
                "w-full text-left px-6 py-3 text-[0.8125rem] font-semibold transition-colors",
                v === value
                  ? "text-crema bg-crema/10"
                  : "text-blanco-suave hover:bg-panel-medio/50",
              ].join(" ")}
            >
              {lbl}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Constantes ────────────────────────────────────────────────────────────────

const DIAS_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

const OPCIONES_DESCANSO = [
  { value:  0, label: "Sin descanso" },
  { value:  5, label: "5 minutos" },
  { value: 10, label: "10 minutos" },
  { value: 15, label: "15 minutos" },
  { value: 30, label: "30 minutos" },
  { value: 45, label: "45 minutos" },
];

// ── Estilos de chip reutilizables ─────────────────────────────────────────────

const chipNeutro = "border-panel-medio text-texto-secundario hover:border-crema/30 hover:text-blanco-suave";
const chipBase   = "rounded-xl border text-xs font-medium transition-all duration-150";

// ── Componente ────────────────────────────────────────────────────────────────

export default function AvailabilitySection({
  diasBloqueados,
  setDiasBloqueados,
  config,
  setConfig,
}) {
  const { getToken } = useAuth();
  const api = React.useMemo(() => createAdminApi(getToken), [getToken]);
  const { citas } = useAdminData();

  const hoy = useMemo(() => new Date(), []);

  // ── Estado local ──────────────────────────────────────────────────────────
  const [mesActual, setMesActual] = useState(
    () => new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
  const [fechaSel,    setFechaSel]    = useState(() => hoy);

  // ── Derivados ─────────────────────────────────────────────────────────────
  const fechaSelStr = useMemo(() => fechaISO(fechaSel), [fechaSel]);

  const todosLosSlots = useMemo(() => {
    const diaSemana = fechaSel.getDay();
    const h = getHorarioDia(config, diaSemana);
    // Si el día está cerrado pero tiene excepción abierta, usar el horario
    // configurado para ese día ignorando el flag cerrado, con fallback 9-21.
    const diaConf = config.horarioPorDia?.[diaSemana];
    const inicio  = h?.inicio ?? diaConf?.inicio ?? 9;
    const fin     = h?.fin    ?? diaConf?.fin    ?? 21;
    return generarSlots(inicio, fin, 15);
  }, [config, fechaSel]);

  const horasBloqueadasDelDia = useMemo(() => {
    const mapa = config.horasBloqueadasPorDia ?? {};
    return new Set(mapa[fechaSelStr] ?? []);
  }, [config.horasBloqueadasPorDia, fechaSelStr]);

  // Horas ocupadas por citas activas en el día seleccionado.
  // Bloquea todos los slots dentro del rango [inicio, inicio+duracion+descanso).
  const horasConCita = useMemo(() => {
    const buffer = config.bufferMinutos ?? 0;
    const set = new Set();
    citas
      .filter((c) => c.fecha === fechaSelStr && c.estado !== "cancelada")
      .forEach((c) => {
        const inicio = horaAMinutos(c.hora);
        const fin    = inicio + Math.max(c.duracion ?? 0, 1) + buffer;
        for (const slot of todosLosSlots) {
          const slotMin = horaAMinutos(slot);
          if (slotMin >= inicio && slotMin < fin) set.add(slot);
        }
      });
    return set;
  }, [citas, fechaSelStr, todosLosSlots, config.bufferMinutos]);

  const hayCitasEseDia = useMemo(() => {
    return citas.some(
      (c) => c.fecha === fechaSelStr && c.estado !== "cancelada"
  );
}, [citas, fechaSelStr]);

  // Fechas de días cerrados por semana en el mes visible (±1 para navegación fluida),
  // excluyendo las que están en diasAbiertosExcepcion.
  const diasCerradosPorSemanaEfectivos = useMemo(() => {
    const cerrados = config.diasCerrados ?? [];
    const excepciones = new Set(config.diasAbiertosExcepcion ?? []);
    if (cerrados.length === 0) return [];
    const result = [];
    for (let delta = -1; delta <= 1; delta++) {
      const firstDay = new Date(mesActual.getFullYear(), mesActual.getMonth() + delta, 1);
      const lastDay  = new Date(mesActual.getFullYear(), mesActual.getMonth() + delta + 1, 0);
      const cur = new Date(firstDay);
      while (cur <= lastDay) {
        if (cerrados.includes(cur.getDay())) {
          const iso =
            `${cur.getFullYear()}-` +
            `${String(cur.getMonth() + 1).padStart(2, "0")}-` +
            `${String(cur.getDate()).padStart(2, "0")}`;
          if (!excepciones.has(iso)) result.push(iso);
        }
        cur.setDate(cur.getDate() + 1);
      }
    }
    return result;
  }, [mesActual, config.diasCerrados, config.diasAbiertosExcepcion]);

  // Unión de bloqueados explícitos + días cerrados por semana (sin excepciones).
  const diasBloqueadosEfectivosSet = useMemo(
    () => new Set([...diasBloqueados, ...diasCerradosPorSemanaEfectivos]),
    [diasBloqueados, diasCerradosPorSemanaEfectivos]
  );

  const diasBloqueadosEfectivosDates = useMemo(
    () => [...diasBloqueadosEfectivosSet].map((s) => parseYMD(s)).filter(Boolean),
    [diasBloqueadosEfectivosSet]
  );

  // Cuántas horas bloqueadas tiene cada día (para los dots del calendario).
  const horasBloqueadasCount = useMemo(() => {
    const mapa = config.horasBloqueadasPorDia ?? {};
    const result = {};
    for (const [d, horas] of Object.entries(mapa)) {
      if (horas.length > 0) result[d] = horas.length;
    }
    return result;
  }, [config.horasBloqueadasPorDia]);

  // Estado del día seleccionado
  const esDiaCerradoPorSemana   = (config.diasCerrados ?? []).includes(fechaSel.getDay());
  const esExcepcionAbierta       = (config.diasAbiertosExcepcion ?? []).includes(fechaSelStr);
  const diaExplicitamenteBloqueado = diasBloqueados.includes(fechaSelStr);
  const diaEfectivamenteBloqueado  = diasBloqueadosEfectivosSet.has(fechaSelStr);

  // "Jueves 10 de abril" — capitaliza solo la primera letra.
  const nombreDiaSeleccionado = (() => {
    const raw = fechaSel
      .toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })
      .replace(",", "");
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  })();

  // ── Handlers ──────────────────────────────────────────────────────────────

  const onToggleDiaCompleto = () => {
    if (esDiaCerradoPorSemana) {
      // Día de descanso: alternar excepción (abrirlo/cerrarlo como caso especial)
      const excs = new Set(config.diasAbiertosExcepcion ?? []);
      excs.has(fechaSelStr) ? excs.delete(fechaSelStr) : excs.add(fechaSelStr);
      const newExcs = [...excs].sort();
      setConfig((c) => ({ ...c, diasAbiertosExcepcion: newExcs }));
      api.updateConfig({ diasAbiertosExcepcion: newExcs }).catch(console.error);
    } else {
      // Día normal: alternar bloqueo explícito
      const newDias = diasBloqueados.includes(fechaSelStr)
        ? diasBloqueados.filter((x) => x !== fechaSelStr)
        : [...diasBloqueados, fechaSelStr].sort();
      setDiasBloqueados(newDias);
      api.updateConfig({ diasBloqueados: newDias }).catch(console.error);
    }
  };

  const onToggleHora = (hora) => {
    const mapa = { ...(config.horasBloqueadasPorDia ?? {}) };
    const set  = new Set(mapa[fechaSelStr] ?? []);
    set.has(hora) ? set.delete(hora) : set.add(hora);
    if (set.size === 0) {
      delete mapa[fechaSelStr];
    } else {
      mapa[fechaSelStr] = [...set].sort();
    }
    setConfig((prev) => ({ ...prev, horasBloqueadasPorDia: mapa }));
    api.updateConfig({ horasBloqueadasPorDia: mapa }).catch(console.error);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      <AdminSectionHeader
        label="Calendario"
        title="Disponibilidad"
        subtitle="Configura el descanso entre citas, horario de atención, días cerrados y bloqueos específicos."
      />

      {/* ── Bloque 1: Configuración rápida ──────────────────────────────── */}
      <div className="card p-5 sm:p-6 space-y-6">
        <h2 className="font-display text-lg font-semibold text-blanco-suave">
          Configuración de horario
        </h2>

        {/* Descanso entre citas */}
        <div>
          <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-2">
            Descanso entre citas
          </p>
          <HoraSelect
            className="relative w-full"
            value={config.bufferMinutos ?? 0}
            opciones={OPCIONES_DESCANSO}
            onChange={(val) => {
              setConfig((c) => ({ ...c, bufferMinutos: val }));
              api.updateConfig({ bufferMinutos: val }).catch(console.error);
            }}
          />
        </div>

        {/* Horario por día de la semana */}
        <div>
          <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-3">
            Horario por día
          </p>
          <div className="space-y-2">
            {DIAS_LABELS.map((label, d) => {
              const diaConfig = config.horarioPorDia?.[d] ?? { cerrado: false, inicio: 9, fin: 21 };
              const cerrado   = diaConfig.cerrado ?? false;
              const inicio    = diaConfig.inicio  ?? 9;
              const fin       = diaConfig.fin      ?? 21;

              const setDia = (patch) => {
                const newDiaConfig = { ...diaConfig, ...patch };
                const newDiasCerrados = (() => {
                  const next = new Set(config.diasCerrados ?? []);
                  if (patch.cerrado !== undefined) {
                    patch.cerrado ? next.add(d) : next.delete(d);
                  }
                  return [...next].sort();
                })();
                setConfig((c) => ({
                  ...c,
                  horarioPorDia: { ...c.horarioPorDia, [d]: newDiaConfig },
                  diasCerrados: newDiasCerrados,
                }));
                api.updateConfig({
                  horarioPorDia: { ...config.horarioPorDia, [d]: newDiaConfig },
                  diasCerrados: newDiasCerrados,
                }).catch(console.error);
              };

              return (
                <div key={d} className="flex items-center gap-3">
                  {/* Nombre del día */}
                  <span className="w-10 shrink-0 text-xs font-medium text-texto-secundario">
                    {label}
                  </span>

                  {/* Toggle cerrado/abierto */}
                  <button
                    type="button"
                    onClick={() => setDia({ cerrado: !cerrado })}
                    className={[
                      "relative w-10 h-5 rounded-full border shrink-0 transition-colors duration-200",
                      cerrado
                        ? "bg-panel-medio/40 border-panel-medio/60"
                        : "bg-crema/20 border-crema/50",
                    ].join(" ")}
                    aria-label={cerrado ? "Abrir día" : "Cerrar día"}
                  >
                    <span
                      className={[
                        "absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-200",
                        cerrado ? "translate-x-0 bg-texto-secundario" : "translate-x-5 bg-crema",
                      ].join(" ")}
                    />
                  </button>

                  {/* Selectores de hora custom — siempre visibles, incluso en días cerrados */}
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <HoraSelect
                      value={inicio}
                      opciones={opcionesHora(9, fin - 1)}
                      onChange={(v) => setDia({ inicio: v })}
                    />
                    <span className="text-texto-secundario text-xs shrink-0">→</span>
                    <HoraSelect
                      value={fin}
                      opciones={opcionesHora(inicio + 1, 21)}
                      onChange={(v) => setDia({ fin: v })}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Bloque 2: Calendario + bloqueo de días y horas ──────────────── */}
      <div className="card p-5 sm:p-6 space-y-5">
        <div>
          <h2 className="font-display text-lg font-semibold text-blanco-suave">
            Bloquear días y horas
          </h2>
          <p className="section-subtitle text-sm mt-1">
            Toca un día para seleccionarlo. Bloquea el día completo o elige horas específicas.
            Las horas en rojo no estarán disponibles para los clientes.
          </p>
        </div>

        {/* Calendario — clic selecciona, no bloquea (onToggleDiaBloqueado = setFechaSel) */}
        <MonthCalendar
          mesActual={mesActual}
          fechaSeleccionada={fechaSel}
          hoy={hoy}
          onCambiarMes={(d) =>
            setMesActual((p) => new Date(p.getFullYear(), p.getMonth() + d, 1))
          }
          onSeleccionarFecha={setFechaSel}
          diasBloqueados={diasBloqueadosEfectivosDates}
          diasSemanaCerrados={[]}
          modoMultiSelect
          onToggleDiaBloqueado={setFechaSel}
          renderDiaExtra={(fecha) => {
            const k = fechaISO(fecha);
            const n = horasBloqueadasCount[k];
            const seleccionado = esMismaFecha(fecha, fechaSel);
            if (!n && !seleccionado) return null;
            return (
              <span className="flex justify-center gap-0.5 mt-0.5">
                {seleccionado && (
                  <span className="w-1 h-1 rounded-full bg-crema shrink-0" />
                )}
                {n > 0 && (
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-estado-cancelada/70 shrink-0"
                    title={`${n} hora(s) bloqueada(s)`}
                  />
                )}
              </span>
            );
          }}
        />

        {/* Leyenda de colores */}
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {[
            { color: "bg-estado-confirmada/70", label: "Cita de cliente" },
            { color: "bg-estado-cancelada/70",  label: "Bloqueado manualmente" },
            { color: "bg-blanco-suave/30",       label: "Disponible" },
          ].map(({ color, label }) => (
            <span key={label} className="flex items-center gap-1.5 text-xs text-texto-secundario">
              <span className={`w-2 h-2 rounded-full shrink-0 ${color}`} />
              {label}
            </span>
          ))}
        </div>

        {/* Panel del día seleccionado — siempre visible */}
        <div className="border-t border-panel-medio/50 pt-5 space-y-4">

          {/* Encabezado del día + botón bloquear */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-blanco-suave">
              {nombreDiaSeleccionado}
            </p>
            <button
              type="button"
              onClick={onToggleDiaCompleto}
              className="btn-primary shrink-0"
            >
              {esDiaCerradoPorSemana && !esExcepcionAbierta
                ? "Trabajar este día"
                : esDiaCerradoPorSemana && esExcepcionAbierta
                ? "Bloquear día de descanso"
                : diaExplicitamenteBloqueado
                ? "Liberar día"
                : "Bloquear día"}
            </button>
          </div>

          {/* Día efectivamente bloqueado (descanso o bloqueo explícito sin excepción) */}
          {diaEfectivamenteBloqueado && !esExcepcionAbierta && !hayCitasEseDia ? (
            <div className="rounded-2xl border border-estado-cancelada/25 bg-estado-cancelada/8 px-4 py-6 text-center">
              <p className="text-sm text-estado-cancelada/80">
                {esDiaCerradoPorSemana
                  ? "Día de descanso — no disponible para clientes"
                  : "Día no disponible para clientes"}
              </p>
            </div>
          ) : (
            <>
            {diaEfectivamenteBloqueado && !esExcepcionAbierta && hayCitasEseDia && (
  <div className="rounded-xl border border-estado-cancelada/25 bg-estado-cancelada/8 px-4 py-3 text-center">
    <p className="text-sm text-estado-cancelada/80">
      ⚠️ Este día está bloqueado, pero tienes citas agendadas.
    </p>
  </div>
)}

              {/* Grid de horas — toggle bloqueada/libre al tocar */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {todosLosSlots.map((hora) => {
                  const conCita   = horasConCita.has(hora);
                  const bloqueada = !conCita && horasBloqueadasDelDia.has(hora);
                  return (
                    <button
                      key={hora}
                      type="button"
                      onClick={conCita ? undefined : () => onToggleHora(hora)}
                      title={conCita ? "Ocupada por cliente" : undefined}
                      className={[
                        "rounded-xl border px-2 py-2.5 text-xs font-medium min-h-[40px] transition-all duration-150",
                        conCita   ? "hora-slot-ocupada" :
                        bloqueada ? "hora-slot-bloqueada" :
                                    "hora-slot-libre",
                      ].join(" ")}
                    >
                      {hora}
                    </button>
                  );
                })}
              </div>

              {/* Contador de horas bloqueadas */}
              {horasBloqueadasDelDia.size > 0 && (
                <p className="text-[11px] text-texto-secundario">
                  {horasBloqueadasDelDia.size}{" "}
                  hora{horasBloqueadasDelDia.size !== 1 ? "s" : ""} bloqueada
                  {horasBloqueadasDelDia.size !== 1 ? "s" : ""} este día · toca para liberar
                </p>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
