// src/pages/AgendarCitaPage.jsx
// Catálogo y horarios desde el backend (/api/services, /api/config).

import React, { useState, useMemo, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useAdminData } from "../hooks/useAdminData";
import { generarSlots, parseYMD, fechaISO, getHorarioDia, horaAMinutos } from "../utils/slots";

import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import CalendarSection      from "../components/sections/CalendarSection";
import ServicePickerSection from "../components/sections/ServicePickerSection";
import ClientDataSection    from "../components/sections/ClientDataSection";

export default function AgendarCitaPage({ onVolverInicio, onLoginClick, onCitaConfirmada, citaAReagendar }) {
  const { usuario, getToken, recargarCitas, listaNegraActiva, logout } = useAuth();
  const { clientes } = useAdminData();
  const hoy = useMemo(() => new Date(), []);

  // ── Datos cargados desde el backend ────────────────────────────────────────
  const [servicios, setServicios] = useState([]);
  const [config, setConfig] = useState({});
  const [diasBloqueados, setDiasBloqueados] = useState([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/services").then((r) => r.json()),
      fetch("/api/config").then((r) => r.json()),
    ])
      .then(([servData, cfgData]) => {
        if (servData.services) {
          setServicios(
            servData.services.map((s) => ({ ...s, id: s._id, nombre: s.titulo }))
          );
        }
        if (cfgData.config) {
          setConfig(cfgData.config);
          setDiasBloqueados(cfgData.config.diasBloqueados ?? []);
        }
      })
      .catch((err) => console.error("Error cargando datos:", err));
  }, []);

  const serviciosVisibles = useMemo(
    () => servicios.filter((s) => s.activo !== false),
    [servicios]
  );

  const diasBloqueadosDates = useMemo(
    () => diasBloqueados.map((s) => parseYMD(s)).filter(Boolean),
    [diasBloqueados]
  );

  const bufferMin = config.bufferMinutos ?? 30;

  const [mesActual, setMesActual] = useState(
    () => new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);
  const [horaSeleccionada, setHoraSeleccionada] = useState("");
  const [serviciosSeleccionados, setServiciosSeleccionados] = useState([]);

  const todosLosSlots = useMemo(() => {
    const h = getHorarioDia(config, fechaSeleccionada.getDay());
    if (!h) return [];
    const activos  = serviciosVisibles.filter((s) => serviciosSeleccionados.includes(s.id));
    const duracion = activos.reduce((sum, s) => sum + s.duracion, 0);
    const conBuffer = duracion > 0 ? duracion + bufferMin : 0;
    return generarSlots(h.inicio, h.fin, 15, conBuffer);
  }, [config, fechaSeleccionada, serviciosVisibles, serviciosSeleccionados, bufferMin]);
  const horasBloqueadas = useMemo(() => {
    const mapa = config.horasBloqueadasPorDia ?? {};
    return mapa[fechaISO(fechaSeleccionada)] ?? [];
  }, [config.horasBloqueadasPorDia, fechaSeleccionada]);

  // ── Horas ya ocupadas por citas existentes ────────────────────────────────
  const [horasOcupadas,  setHorasOcupadas]  = useState([]);
  const [citasOcupadas,  setCitasOcupadas]  = useState([]);
  const [cargandoSlots,  setCargandoSlots]  = useState(true);

  useEffect(() => {
    const fechaStr = fechaISO(fechaSeleccionada);
    setCargandoSlots(true);
    fetch(`/api/appointments/occupied?fecha=${fechaStr}`)
      .then((r) => r.json())
      .then((data) => {
        setHorasOcupadas(data.horasOcupadas ?? []);
        setCitasOcupadas(data.citas ?? []);
      })
      .catch((err) => console.error("Error cargando horas ocupadas:", err))
      .finally(() => setCargandoSlots(false));
  }, [fechaSeleccionada]);

  // Pre-seleccionar servicios cuando se reagenda una cita existente
  useEffect(() => {
    if (!citaAReagendar || serviciosVisibles.length === 0) return;
    const ids = citaAReagendar.servicios
      .map((nombre) => serviciosVisibles.find((s) => s.nombre === nombre)?.id)
      .filter(Boolean);
    if (ids.length > 0) setServiciosSeleccionados(ids);
  }, [citaAReagendar, serviciosVisibles]);

  const [nombre, setNombre] = useState(() => usuario?.nombre ?? "");
  const [telefono, setTelefono] = useState(() => usuario?.telefono ?? "");
  const [correo, setCorreo] = useState(() => usuario?.correo ?? "");
  const correoBloqueado = false;

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const cambiarMes = (delta) =>
    setMesActual((p) => new Date(p.getFullYear(), p.getMonth() + delta, 1));

  const toggleServicio = (id) =>
    setServiciosSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!fechaSeleccionada || !horaSeleccionada) {
      setError("Por favor selecciona una fecha y hora.");
      return;
    }

    // ── Flujo de reagendado — PATCH en la misma cita ──────────────────────────
    if (citaAReagendar) {
      const citaId = citaAReagendar._id || citaAReagendar.id;
      setCargando(true);
      try {
        const res = await fetch(`/api/appointments/mias/${citaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
          body: JSON.stringify({
            fecha: fechaISO(fechaSeleccionada),
            hora: horaSeleccionada,
            reagendada: true,
          }),
        });
        if (res.status === 401) { logout(); return; }
        const data = await res.json();
        if (res.status === 409) {
          setError("Ese horario ya no está disponible. Elige otro.");
          return;
        }
        if (!res.ok) {
          setError(data.mensaje || "No se pudo reagendar la cita.");
          return;
        }
        recargarCitas();
        onCitaConfirmada?.();
      } catch {
        setError("No se pudo conectar con el servidor.");
      } finally {
        setCargando(false);
      }
      return;
    }

    // ── Flujo normal — validar y crear nueva cita ─────────────────────────────
    if (serviciosSeleccionados.length === 0) {
      setError("Por favor selecciona al menos un servicio.");
      return;
    }
    if (!nombre || !telefono) {
      setError("Por favor ingresa tu nombre y teléfono.");
      return;
    }
    if (telefono.replace(/\D/g, "").length !== 10) {
      setError("El teléfono debe tener 10 dígitos.");
      return;
    }

    // UX local — el backend valida esto también y responde 403 si está en lista negra.
    const enListaNegra =
      usuario?.id &&
      clientes.find((c) => c.id === usuario.id)?.listaNegraActiva;
    if (enListaNegra) {
      setError(
        "No puedes agendar citas en línea en este momento. Contacta directamente a la barbería."
      );
      return;
    }

    const serviciosActivos = serviciosVisibles.filter((s) =>
      serviciosSeleccionados.includes(s.id)
    );
    const totalDuracion = serviciosActivos.reduce((sum, s) => sum + s.duracion, 0);
    const totalPrecio = serviciosActivos.reduce(
      (sum, s) => sum + (s.oferta && s.precioOferta != null ? s.precioOferta : s.precio),
      0
    );

    const payload = {
      fecha: fechaISO(fechaSeleccionada),
      hora: horaSeleccionada,
      servicios: serviciosActivos.map((s) => s.nombre),
      duracion: totalDuracion,
      precio: totalPrecio,
      clienteNombre: nombre,
      clienteTelefono: telefono,
      clienteCorreo: correo,
      userId: usuario?.id ?? null,
    };

    setCargando(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 409) {
        setError("Ese horario ya fue tomado. Elige otro.");
        return;
      }
      if (!res.ok) {
        setError(data.mensaje || "No se pudo agendar la cita.");
        return;
      }
      onCitaConfirmada?.();
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor.");
    } finally {
      setCargando(false);
    }
  };

  const serviciosActivos = serviciosVisibles.filter((s) =>
    serviciosSeleccionados.includes(s.id)
  );
  const totalDuracion = serviciosActivos.reduce((sum, s) => sum + s.duracion, 0);
  const totalPrecio = serviciosActivos.reduce(
    (sum, s) => sum + (s.oferta && s.precioOferta != null ? s.precioOferta : s.precio),
    0
  );
  const duracionConBuffer = totalDuracion > 0 ? totalDuracion + bufferMin : 0;

  // Slots bloqueados por la duración + descanso de citas existentes (empalme hacia adelante)
  const slotsOcupadosPorRango = useMemo(() => {
    const set = new Set();
    for (const c of citasOcupadas) {
      const inicio = horaAMinutos(c.hora);
      const fin    = inicio + Math.max(c.duracion ?? 0, 1) + bufferMin;
      for (const slot of todosLosSlots) {
        const slotMin = horaAMinutos(slot);
        if (slotMin >= inicio && slotMin < fin) set.add(slot);
      }
    }
    return set;
  }, [citasOcupadas, todosLosSlots, bufferMin]);

  // Slots donde el nuevo servicio terminaría dentro de una cita existente (empalme hacia atrás)
  const slotsConEmpalme = useMemo(() => {
    if (!duracionConBuffer) return new Set();
    const ocupadasMin = citasOcupadas.map((c) => horaAMinutos(c.hora));
    const set = new Set();
    for (const slot of todosLosSlots) {
      const slotMin = horaAMinutos(slot);
      const slotFin = slotMin + duracionConBuffer;
      if (ocupadasMin.some((o) => slotMin < o && slotFin > o)) set.add(slot);
    }
    return set;
  }, [citasOcupadas, todosLosSlots, duracionConBuffer]);

  const todasBloqueadas = useMemo(
    () => [...new Set([...horasBloqueadas, ...horasOcupadas, ...slotsOcupadosPorRango, ...slotsConEmpalme])],
    [horasBloqueadas, horasOcupadas, slotsOcupadosPorRango, slotsConEmpalme]
  );

  const resumenListo =
    fechaSeleccionada && horaSeleccionada && serviciosActivos.length > 0;

  // Panel de servicios: informativo al reagendar, interactivo al crear
  const servicioPanel = citaAReagendar ? (
    <div>
      <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-2">
        Tu servicio
      </p>
      <p className="text-sm text-blanco-suave">
        {citaAReagendar.servicios.join(", ")}
      </p>
    </div>
  ) : (
    <ServicePickerSection
      servicios={serviciosVisibles}
      serviciosSeleccionados={serviciosSeleccionados}
      onToggle={toggleServicio}
    />
  );

  if (listaNegraActiva) {
    return (
      <div className="bg-fondo text-blanco-suave min-h-screen flex flex-col">
        <Navbar onInicio={onVolverInicio} modoAgendar={true} />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="card p-6 max-w-md w-full text-center space-y-4 border-estado-cancelada/30">
            <p className="text-estado-cancelada font-semibold">No puedes agendar citas en línea</p>
            <p className="text-sm text-texto-secundario">
              Contacta directamente a la barbería para más información.
            </p>
            <button type="button" onClick={onVolverInicio} className="btn-primary">
              Volver al inicio
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-fondo text-blanco-suave min-h-screen">
      <Navbar onInicio={onVolverInicio} modoAgendar={true} />

      <main className="section-wrap py-10">
        <div className="mb-10">
          <p className="brand-label mb-2">Blanca Ríos Estudio</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-blanco-suave mb-2">
            {citaAReagendar ? "Reagendar cita" : "Agendar Cita"}
          </h1>
          <p className="section-subtitle max-w-md">
            {citaAReagendar
              ? "Elige la nueva fecha y hora. Tu cita anterior quedará cancelada."
              : "Completa los tres pasos para reservar tu lugar."
            }
          </p>
          {usuario && (
            <p className="mt-2 text-[11px] text-crema/70 flex items-center gap-1.5">
              <svg
                className="w-3 h-3 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Tus datos están pre-rellenados. Puedes editarlos si lo necesitas.
            </p>
          )}
        </div>

        <div className="md:hidden mb-10">
          {servicioPanel}
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-start">
          <CalendarSection
            mesActual={mesActual}
            fechaSeleccionada={fechaSeleccionada}
            hoy={hoy}
            horaSeleccionada={horaSeleccionada}
            duracionTotal={totalDuracion}
            duracionConBuffer={duracionConBuffer}
            todosLosSlots={todosLosSlots}
            horasBloqueadas={todasBloqueadas}
            diasBloqueados={diasBloqueadosDates}
            diasSemanaCerrados={config.diasCerrados ?? []}
            cargandoSlots={cargandoSlots}
            onCambiarMes={cambiarMes}
            onSeleccionarFecha={setFechaSeleccionada}
            onSeleccionarHora={setHoraSeleccionada}
          />

          <div className="space-y-10">
            <div className="hidden md:block">
              {servicioPanel}
            </div>

            {resumenListo && (
              <div className="card p-4 border-crema/20">
                <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-2 font-medium">
                  Resumen de tu cita
                </p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-texto-secundario shrink-0">Servicio(s)</span>
                    <span className="text-blanco-suave font-medium text-right">
                      {serviciosActivos.map((s) => s.nombre).join(", ")}
                    </span>
                  </div>
                  {serviciosActivos.length > 1 && (
                    <div className="flex justify-between">
                      <span className="text-texto-secundario">Tiempo del servicio</span>
                      <span className="text-blanco-suave font-medium">{totalDuracion} min</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-texto-secundario">Fecha</span>
                    <span className="text-blanco-suave font-medium">
                      {fechaSeleccionada.toLocaleDateString("es-MX", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-texto-secundario">Hora inicio</span>
                    <span className="text-blanco-suave font-medium">{horaSeleccionada}</span>
                  </div>
                  <div className="flex justify-between border-t border-panel-medio/60 pt-2 mt-2">
                    <span className="text-texto-secundario">Total estimado</span>
                    <span className="text-crema font-semibold">${totalPrecio}</span>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-2xl border border-estado-cancelada/40 bg-estado-cancelada/10 px-4 py-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-estado-cancelada shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                  <p className="text-sm text-estado-cancelada">{error}</p>
                </div>
                <button type="button" onClick={() => setError("")} className="text-estado-cancelada/60 hover:text-estado-cancelada text-lg leading-none">×</button>
              </div>
            )}

            <ClientDataSection
              nombre={nombre}
              telefono={telefono}
              correo={correo}
              correoBloqueado={correoBloqueado}
              cargando={cargando}
              onNombreChange={setNombre}
              onTelefonoChange={setTelefono}
              onCorreoChange={setCorreo}
              onSubmit={manejarSubmit}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
