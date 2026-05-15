// src/components/admin/AppointmentDrawer.jsx

import React, { useMemo, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { createAdminApi } from "../../hooks/useAdminApi";
import BaseDrawer from "../ui/BaseDrawer";
import StatusBadge        from "../ui/StatusBadge";
import MonthCalendar      from "../ui/MonthCalendar";
import TimeChip           from "../ui/TimeChip";
import Toast              from "../ui/Toast";
import ServicePickerSection from "../sections/ServicePickerSection";
import { generarSlots, fechaISO, parseYMD, getHorarioDia, horaAMinutos } from "../../utils/slots";
import { generarMensajeCita, generarWaUrl } from "../../utils/whatsapp";

export default function AppointmentDrawer({
  abierto,
  onCerrar,
  citaId,
  citas,
  setCitas,
  servicios,
  config,
  diasBloqueados = [],
}) {
  const { getToken } = useAuth();
  const api = React.useMemo(() => createAdminApi(getToken), [getToken]);

  const cita = citas?.find((x) => x.id === citaId) ?? null;
  const [reprogAbierta, setReprogAbierta] = useState(false);
  const hoy = useMemo(() => new Date(), []);
  const [mesRep, setMesRep] = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [fechaRep, setFechaRep] = useState(() => hoy);
  const [horaRep, setHoraRep] = useState("");
  // IDs de servicios seleccionados en edición — inicializa desde la cita actual
  const [serviciosSel, setServiciosSel] = useState([]);
  // Duración "en vuelo": se adelanta a cita.duracion para manejar toggles rápidos consecutivos
  const duracionPendienteRef = useRef(null);

  const duracionSel = useMemo(() => {
    const activos = servicios.filter((s) => serviciosSel.includes(s.id));
    return activos.reduce((sum, s) => sum + s.duracion, 0);
  }, [servicios, serviciosSel]);

  const slots = useMemo(() => {
    const h = getHorarioDia(config, fechaRep.getDay());
    if (!h) return [];
    const conBuffer = duracionSel > 0 ? duracionSel + (config.bufferMinutos ?? 0) : 0;
    return generarSlots(h.inicio, h.fin, 15, conBuffer);
  }, [config, fechaRep, duracionSel]);

  const diasBloq = useMemo(
    () => diasBloqueados.map((s) => parseYMD(s)).filter(Boolean),
    [diasBloqueados]
  );

  const horasBloqueadas = useMemo(() => {
    const mapa = config.horasBloqueadasPorDia ?? {};
    return mapa[fechaISO(fechaRep)] ?? [];
  }, [config.horasBloqueadasPorDia, fechaRep]);

  // Horas ocupadas por otras citas activas en el día seleccionado.
  // Excluye la cita actual. Aplica dos checks:
  //   Forward: bloquear slots dentro del rango [inicio, inicio+duracion) de cada cita existente.
  //   Backward: bloquear slots donde el nuevo servicio terminaría dentro de una cita existente.
  const horasOcupadasPorCita = useMemo(() => {
    const set   = new Set();
    const otras = (citas ?? []).filter(
      (c) => c.fecha === fechaISO(fechaRep) && c.estado !== "cancelada" && c.id !== citaId
    );
    const buffer = config.bufferMinutos ?? 0;
    // Forward: bloquear slots dentro de [inicio, inicio+duracion+descanso)
    for (const c of otras) {
      const inicio = horaAMinutos(c.hora);
      const fin    = inicio + Math.max(c.duracion ?? 0, 1) + buffer;
      for (const slot of slots) {
        const slotMin = horaAMinutos(slot);
        if (slotMin >= inicio && slotMin < fin) set.add(slot);
      }
    }
    // Backward: bloquear slots donde duracion+descanso invade el inicio de otra cita
    if (duracionSel > 0) {
      const ocupadasMin = otras.map((c) => horaAMinutos(c.hora));
      for (const slot of slots) {
        const slotMin = horaAMinutos(slot);
        const slotFin = slotMin + duracionSel + buffer;
        if (ocupadasMin.some((o) => slotMin < o && slotFin > o)) set.add(slot);
      }
    }
    return set;
  }, [citas, fechaRep, citaId, slots, duracionSel, config.bufferMinutos]);

  const [toastError, setToastError] = useState("");

  const mostrarToastError = (msg) => {
    setToastError(msg);
    setTimeout(() => setToastError(""), 4000);
  };

  // Cada vez que se abre una cita distinta, reinicia la selección y el ref de duración
  React.useEffect(() => {
    if (!cita) return;
    const ids = cita.servicios
      .map((nombre) => servicios.find((s) => (s.nombre ?? s.titulo) === nombre)?.id)
      .filter(Boolean);
    setServiciosSel(ids.length > 0 ? ids : [servicios[0]?.id].filter(Boolean));
    duracionPendienteRef.current = null;
  }, [cita?.id, servicios.length]);

  if (!cita) return null;

  const actualizar = async (patch) => {
    try {
      await api.updateAppointment(cita.id, patch);
      setCitas((prev) =>
        prev.map((x) => (x.id === cita.id ? { ...x, ...patch } : x))
      );
    } catch (err) {
      console.error("Error al actualizar cita:", err);
      mostrarToastError("No se pudo actualizar la cita. Intenta de nuevo.");
    }
  };

  const eliminarCita = async () => {
    try {
      await api.deleteAppointment(cita.id);
      setCitas((prev) => prev.filter((x) => x.id !== cita.id));
      onCerrar();
    } catch (err) {
      console.error("Error al eliminar cita:", err);
      mostrarToastError("No se pudo eliminar la cita. Intenta de nuevo.");
    }
  };

  const toggleServicio = (id) => {
    const estaSeleccionado = serviciosSel.includes(id);

    const nextIds = estaSeleccionado
      ? serviciosSel.filter((x) => x !== id)
      : [...serviciosSel, id];

    const seleccionados = servicios.filter((s) => nextIds.includes(s.id));
    const nuevaDuracion = seleccionados.reduce((acc, s) => acc + s.duracion, 0);

    // baseRef: usa la duración "en vuelo" del ref si existe, si no la de la cita guardada.
    // Esto resuelve el caso de dos toggles rápidos (remove A + add B del mismo peso)
    // donde cita.duracion en el estado local aún no se actualizó tras el primer toggle.
    const baseRef = duracionPendienteRef.current ?? cita.duracion ?? 0;

    // Validar solo al AGREGAR y cuando la nueva duración supera la base de referencia.
    if (!estaSeleccionado && nuevaDuracion > baseRef) {
      const buffer       = config.bufferMinutos ?? 0;
      const inicioActual = horaAMinutos(cita.hora);

      // Siguiente cita activa del mismo día que empiece después de la hora actual
      const siguienteCita = (citas ?? [])
        .filter(
          (c) =>
            c.fecha === cita.fecha &&
            c.estado !== "cancelada" &&
            c.id !== cita.id &&
            horaAMinutos(c.hora) > inicioActual
        )
        .sort((a, b) => horaAMinutos(a.hora) - horaAMinutos(b.hora))[0] ?? null;

      // Check 1 — espacio hasta la siguiente cita (incluye buffer entre citas)
      if (siguienteCita && inicioActual + nuevaDuracion + buffer > horaAMinutos(siguienteCita.hora)) {
        mostrarToastError("Este servicio no cabe en el horario actual. Reprograma la cita primero.");
        return;
      }

      // Check 2 — cierre del día (sin buffer: el servicio en sí no puede salirse del horario)
      const [year, month, day] = cita.fecha.split("-").map(Number);
      const horario = getHorarioDia(config, new Date(year, month - 1, day).getDay());
      if (horario && inicioActual + nuevaDuracion > horario.fin * 60) {
        mostrarToastError("Este servicio no cabe en el horario actual. Reprograma la cita primero.");
        return;
      }
    }

    if (!estaSeleccionado) duracionPendienteRef.current = nuevaDuracion;
    setServiciosSel(nextIds);
    // No persistir selección vacía — el admin debe elegir un nuevo servicio primero
    if (nextIds.length === 0) return;
    actualizar({
      servicios: seleccionados.map((s) => s.nombre ?? s.titulo),
      duracion:  nuevaDuracion,
      precio:    seleccionados.reduce(
        (acc, s) => acc + (s.oferta && s.precioOferta != null ? s.precioOferta : s.precio),
        0
      ),
    });
  };

  const aplicarReprogramar = (hora) => {
    if (!fechaRep || !hora) return;
    actualizar({
      fecha: fechaISO(fechaRep),
      hora,
    });
    setReprogAbierta(false);
  };

  const wa = () => {
  const mensaje = generarMensajeCita(cita.clienteNombre, cita.hora);
  const url = generarWaUrl(cita.clienteTelefono, mensaje);
  window.open(url, "_blank");
};


  return (
    <>
    <BaseDrawer abierto={abierto} onCerrar={onCerrar} titulo="Detalle de cita">
      <div className="space-y-6">
        <div className="border-t border-panel-medio/60 pt-4">
          <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-3">
            Servicios
          </p>
          <ServicePickerSection
            servicios={servicios}
            serviciosSeleccionados={serviciosSel}
            onToggle={toggleServicio}
            mostrarEncabezado={false}
          />
        </div>

        <div className="border-t border-panel-medio/60 pt-4 space-y-3">
          <p className="text-[11px] text-texto-secundario uppercase tracking-widest">
            Reprogramar cita
          </p>
          <button
            type="button"
            onClick={() => setReprogAbierta((v) => !v)}
            className="btn-secondary w-full flex items-center justify-between"
          >
            <span>Seleccionar nueva fecha y hora</span>
            <svg
              className={`w-4 h-4 transition-transform duration-150 ${reprogAbierta ? "rotate-180" : ""}`}
              viewBox="0 0 12 12" fill="none" stroke="currentColor"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <polyline points="2,4 6,8 10,4" />
            </svg>
          </button>

          {reprogAbierta && (
            <div className="border border-panel-medio/60 rounded-xl p-3 space-y-3">
              <MonthCalendar
                compacto
                mesActual={mesRep}
                fechaSeleccionada={fechaRep}
                hoy={hoy}
                onCambiarMes={(d) =>
                  setMesRep((p) => new Date(p.getFullYear(), p.getMonth() + d, 1))
                }
                onSeleccionarFecha={setFechaRep}
                diasBloqueados={diasBloq}
                diasSemanaCerrados={config.diasCerrados ?? []}
              />
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 pr-1 max-h-48 overflow-y-auto">
                {(() => {
                  const mismoDia = fechaISO(fechaRep) === cita.fecha;
                  return slots.map((h) => {
                    const esHoraActual = mismoDia && h === cita.hora;
                    const bloqueada    = !esHoraActual && (horasBloqueadas.includes(h) || horasOcupadasPorCita.has(h));
                    return (
                      <TimeChip
                        key={h}
                        hora={h}
                        seleccionada={h === horaRep}
                        esHoraActual={esHoraActual}
                        bloqueada={bloqueada}
                        onClick={bloqueada || esHoraActual ? undefined : () => {
                          setHoraRep(h);
                          aplicarReprogramar(h);
                        }}
                      />
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-panel-medio/60 pt-4">
          <div className="flex items-center justify-between gap-2 mb-2">
            <h3 className="font-display text-lg text-blanco-suave">{cita.clienteNombre}</h3>
            <StatusBadge estado={cita.estado} />
          </div>
          <a
            href={`tel:${cita.clienteTelefono}`}
            className="text-sm text-crema hover:underline"
          >
            {cita.clienteTelefono}
          </a>
          <p className="text-xs text-texto-secundario mt-2">
            {cita.fecha} · {cita.hora}
          </p>
          <p className="text-sm text-blanco-suave mt-2">{cita.servicios.join(", ")}</p>
          <p className="text-crema font-semibold mt-1">${cita.precio}</p>
        </div>

        <div className="border-t border-panel-medio/60 pt-4 space-y-3">
          {/* Selector de estado */}
          <div>
            <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-3">
              Estado de la cita
            </p>
            <div className="flex flex-wrap gap-2">
              {["pendiente", "cancelada", "finalizada"].map((valor) => {
                const label = valor.charAt(0).toUpperCase() + valor.slice(1);
                const activo = cita.estado === valor;
                const claseActivo = valor === "finalizada"
                  ? "bg-estado-confirmada/20 border border-estado-confirmada/50 text-estado-confirmada rounded-full px-2 py-3 flex-1 text-sm font-medium"
                  : "btn-primary flex-1 px-2";
                return (
                  <button
                    key={valor}
                    type="button"
                    onClick={() => actualizar({ estado: valor })}
                    className={
                      activo
                        ? claseActivo
                        : "border border-panel-medio/60 text-texto-secundario rounded-full px-2 py-3 flex-1 text-sm font-medium"
                    }
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            className="btn-whatsapp w-full text-white"
            onClick={wa}
          >
            WhatsApp al cliente
          </button>
        </div>

        <div className="border-t border-panel-medio/40 pt-4 mt-2">
          <button
            type="button"
            className="btn-danger w-full"
            onClick={() => {
              if (window.confirm("¿Eliminar esta cita? Esta acción no se puede deshacer.")) {
                eliminarCita();
              }
            }}
          >
            Eliminar cita
          </button>
        </div>
      </div>
    </BaseDrawer>
    <Toast mensaje={toastError} posicion="top" onCerrar={() => setToastError("")} />
    </>
  );
}
