// src/components/admin/NewAppointmentDrawer.jsx

import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import BaseDrawer from "../ui/BaseDrawer";
import InputField from "../ui/InputField";
import MonthCalendar from "../ui/MonthCalendar";
import TimeChip from "../ui/TimeChip";
import Toast from "../ui/Toast";
import ServicePickerSection from "../sections/ServicePickerSection";
import { generarSlots, fechaISO, parseYMD, getHorarioDia, horaAMinutos } from "../../utils/slots";

export default function NewAppointmentDrawer({
  abierto,
  onCerrar,
  onCitaCreada,
  setCitas,
  servicios,
  config,
  diasBloqueados = [],
}) {
  const { getToken, logout } = useAuth();

  const hoy = useMemo(() => new Date(), []);
  const [mes, setMes]   = useState(() => new Date(hoy.getFullYear(), hoy.getMonth(), 1));
  const [fecha, setFecha] = useState(() => hoy);
  const [hora, setHora]   = useState("");

  const [nombre,    setNombre]    = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [correo,    setCorreo]    = useState("");
  const [serviciosSel, setServiciosSel] = useState([]);

  const [errores, setErrores] = useState({});
  const [cargando, setCargando] = useState(false);
  const [toastError, setToastError] = useState("");

  const slots = useMemo(() => {
    const h = getHorarioDia(config, fecha.getDay());
    if (!h) return [];
    const activos   = servicios.filter((s) => serviciosSel.includes(s.id));
    const duracion  = activos.reduce((sum, s) => sum + s.duracion, 0);
    const conBuffer = duracion > 0 ? duracion + (config.bufferMinutos ?? 0) : 0;
    return generarSlots(h.inicio, h.fin, 15, conBuffer);
  }, [config, fecha, servicios, serviciosSel]);

  const diasBloqueadosDates = useMemo(
    () => diasBloqueados.map((s) => parseYMD(s)).filter(Boolean),
    [diasBloqueados]
  );

  const horasBloqueadas = useMemo(() => {
    const mapa = config.horasBloqueadasPorDia ?? {};
    return mapa[fechaISO(fecha)] ?? [];
  }, [config.horasBloqueadasPorDia, fecha]);

  const [horasOcupadas, setHorasOcupadas] = useState([]);
  const [citasOcupadas, setCitasOcupadas] = useState([]);

  useEffect(() => {
    fetch(`/api/appointments?action=occupied&fecha=${fechaISO(fecha)}`)
      .then((r) => r.json())
      .then((data) => {
        setHorasOcupadas(data.horasOcupadas ?? []);
        setCitasOcupadas(data.citas ?? []);
      })
      .catch((err) => console.error("Error cargando horas ocupadas:", err));
  }, [fecha]);

  const duracionConBuffer = useMemo(() => {
    const activos  = servicios.filter((s) => serviciosSel.includes(s.id));
    const duracion = activos.reduce((sum, s) => sum + s.duracion, 0);
    return duracion > 0 ? duracion + (config.bufferMinutos ?? 0) : 0;
  }, [servicios, serviciosSel, config.bufferMinutos]);

  // Forward: bloquea slots dentro del rango [inicio, inicio+duracion+buffer) de cada cita existente
  const slotsOcupadosPorRango = useMemo(() => {
    const set = new Set();
    for (const c of citasOcupadas) {
      const inicio = horaAMinutos(c.hora);
      const fin    = inicio + Math.max(c.duracion ?? 0, 1) + (config.bufferMinutos ?? 0);
      for (const slot of slots) {
        const slotMin = horaAMinutos(slot);
        if (slotMin >= inicio && slotMin < fin) set.add(slot);
      }
    }
    return set;
  }, [citasOcupadas, slots, config.bufferMinutos]);

  // Backward: bloquea slots donde el nuevo servicio terminaría dentro de una cita existente
  const slotsConEmpalme = useMemo(() => {
    if (!duracionConBuffer) return new Set();
    const ocupadasMin = citasOcupadas.map((c) => horaAMinutos(c.hora));
    const set = new Set();
    for (const slot of slots) {
      const slotMin = horaAMinutos(slot);
      const slotFin = slotMin + duracionConBuffer;
      if (ocupadasMin.some((o) => slotMin < o && slotFin > o)) set.add(slot);
    }
    return set;
  }, [citasOcupadas, slots, duracionConBuffer]);

  const toggleServicio = (id) => {
    setServiciosSel((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
    setErrores((prev) => ({ ...prev, servicios: undefined }));
  };

  const limpiar = () => {
    setNombre("");
    setTelefono("");
    setCorreo("");
    setServiciosSel([]);
    setHora("");
    setFecha(hoy);
    setMes(new Date(hoy.getFullYear(), hoy.getMonth(), 1));
    setErrores({});
  };

  const cerrar = () => {
    limpiar();
    onCerrar();
  };

  const guardar = async () => {
    const errs = {};
    if (!nombre.trim())       errs.nombre    = "El nombre es obligatorio";
    if (!telefono.trim())     errs.telefono  = "El teléfono es obligatorio";
    if (!hora)                errs.hora      = "Selecciona una hora";
    if (!fecha)               errs.fecha     = "Selecciona una fecha";
    if (serviciosSel.length === 0) errs.servicios = "Selecciona al menos un servicio";

    if (Object.keys(errs).length > 0) {
      setErrores(errs);
      return;
    }

    const seleccionados = servicios.filter((s) => serviciosSel.includes(s.id));
    const payload = {
      clienteNombre:   nombre.trim(),
      clienteTelefono: telefono.trim(),
      clienteCorreo:   correo.trim() || "",
      userId:          null,
      fecha:           fechaISO(fecha),
      hora,
      servicios:       seleccionados.map((s) => s.nombre ?? s.titulo),
      duracion:        seleccionados.reduce((acc, s) => acc + s.duracion, 0),
      precio:          seleccionados.reduce(
        (acc, s) => acc + (s.oferta && s.precioOferta != null ? s.precioOferta : s.precio),
        0
      ),
      estado: "pendiente",
    };

    setCargando(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (res.status === 409) {
        setErrores((prev) => ({ ...prev, hora: "Ese horario ya está ocupado" }));
        return;
      }
      if (!res.ok) {
        setToastError(data.mensaje || "No se pudo crear la cita. Intenta de nuevo.");
        setTimeout(() => setToastError(""), 4000);
        return;
      }
      const cita = { ...data.appointment, id: data.appointment._id };
      setCitas((prev) => [cita, ...prev]);
      cerrar();
      onCitaCreada?.();
    } catch (err) {
      console.error("Error al crear cita:", err);
      setToastError("No se pudo conectar con el servidor. Intenta de nuevo.");
      setTimeout(() => setToastError(""), 4000);
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
    <Toast mensaje={toastError} onCerrar={() => setToastError("")} />
    <BaseDrawer abierto={abierto} onCerrar={cerrar} titulo="Nueva cita">
      <div className="space-y-6">

        {/* Servicios */}
        <div className="border-t border-panel-medio/60 pt-4">
          <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-3">
            Servicios
          </p>
          {errores.servicios && (
            <p className="text-[11px] text-estado-cancelada/80 flex items-center gap-1 mb-2">
              <span aria-hidden="true">✕</span>{errores.servicios}
            </p>
          )}
          <ServicePickerSection
            servicios={servicios}
            serviciosSeleccionados={serviciosSel}
            onToggle={toggleServicio}
            mostrarEncabezado={false}
          />
        </div>

        {/* Fecha */}
        <div className="border-t border-panel-medio/60 pt-4">
          <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-3">
            Fecha
          </p>
          {errores.fecha && (
            <p className="text-[11px] text-estado-cancelada/80 flex items-center gap-1 mb-2">
              <span aria-hidden="true">✕</span>{errores.fecha}
            </p>
          )}
          <MonthCalendar
            compacto
            mesActual={mes}
            fechaSeleccionada={fecha}
            hoy={hoy}
            onCambiarMes={(d) =>
              setMes((p) => new Date(p.getFullYear(), p.getMonth() + d, 1))
            }
            onSeleccionarFecha={(f) => {
              setFecha(f);
              setErrores((prev) => ({ ...prev, fecha: undefined }));
            }}
            diasBloqueados={diasBloqueadosDates}
            diasSemanaCerrados={config.diasCerrados ?? []}
          />
        </div>

        {/* Hora */}
        <div className="border-t border-panel-medio/60 pt-4">
          <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-3">
            Hora
          </p>
          {errores.hora && (
            <p className="text-[11px] text-estado-cancelada/80 flex items-center gap-1 mb-2">
              <span aria-hidden="true">✕</span>{errores.hora}
            </p>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-1.5 pr-1 max-h-48 overflow-y-auto">
            {slots.map((h) => {
              const esHoy =
                fecha.getFullYear() === hoy.getFullYear() &&
                fecha.getMonth()    === hoy.getMonth()    &&
                fecha.getDate()     === hoy.getDate();
              const ahoraMin = esHoy ? (new Date().getHours() * 60 + new Date().getMinutes()) : -1;
              const esPasado  = esHoy && horaAMinutos(h) <= ahoraMin;
              const bloqueada = !esPasado && (horasBloqueadas.includes(h) || horasOcupadas.includes(h) || slotsOcupadosPorRango.has(h) || slotsConEmpalme.has(h));
              return (
                <TimeChip
                  key={h}
                  hora={h}
                  seleccionada={h === hora}
                  bloqueada={bloqueada}
                  pasado={esPasado}
                  onClick={esPasado || bloqueada ? undefined : () => {
                    setHora(h);
                    setErrores((prev) => ({ ...prev, hora: undefined }));
                  }}
                />
              );
            })}
          </div>
        </div>

        {/* Datos del cliente */}
        <div className="space-y-4">
          <p className="text-[11px] text-texto-secundario uppercase tracking-widest">
            Datos del cliente
          </p>
          <InputField
            id="nc-nombre"
            label="Nombre"
            placeholder="Nombre completo"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrores((prev) => ({ ...prev, nombre: undefined }));
            }}
            error={errores.nombre}
            required
          />
          <InputField
            id="nc-telefono"
            label="Teléfono"
            tipo="tel"
            placeholder="10 dígitos"
            value={telefono}
            onChange={(e) => {
              setTelefono(e.target.value);
              setErrores((prev) => ({ ...prev, telefono: undefined }));
            }}
            error={errores.telefono}
            required
          />
          <InputField
            id="nc-correo"
            label="Correo"
            tipo="email"
            placeholder="Opcional"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            opcional
          />
        </div>

        {/* CTA */}
        <div className="border-t border-panel-medio/40 pt-4">
          <button
            type="button"
            className="btn-primary w-full"
            onClick={guardar}
            disabled={cargando}
          >
            {cargando ? "Registrando…" : "Registrar cita"}
          </button>
        </div>

      </div>
    </BaseDrawer>
    </>
  );
}
