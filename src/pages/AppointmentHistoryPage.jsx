// src/pages/HistorialCitasPage.jsx
//
// PÁGINA — Historial de citas del cliente autenticado.

import React, { useMemo, useState } from "react";
import Navbar     from "../components/layout/Navbar";
import Footer     from "../components/layout/Footer";
import AppointmentCard from "../components/ui/AppointmentCard";
import MetricCard from "../components/ui/MetricCard";
import { useAuth }   from "../context/AuthContext";
import { esFutura }  from "../utils/slots";

// ── Sub-componente: estado vacío ──────────────────────────────────────────────
function SinHistorial({ onAgendar }) {
  return (
    <div className="card p-8 text-center">
      <p className="text-texto-secundario text-sm mb-4">
        Todavía no tienes citas anteriores.
      </p>
      <button
        type="button"
        onClick={onAgendar}
        className="btn-primary"
      >
        Agendar primera cita
      </button>
    </div>
  );
}

// ── Helper: "10:00 AM" + "2025-04-21" → Date ─────────────────────────────────
function parsearCitaDateTime(fecha, hora) {
  const partes = hora.trim().split(" ");
  const period = partes[1];
  const [h, m] = partes[0].split(":").map(Number);
  let h24 = h;
  if (period === "PM" && h !== 12) h24 += 12;
  if (period === "AM" && h === 12) h24 = 0;
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(year, month - 1, day, h24, m);
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function HistorialCitasPage({ onVolverInicio, onAgendar, onLogout, onReagendar }) {
  const { usuario, citas, citasCargando, citasError, recargarCitas, logout, getToken } = useAuth();

  const [erroresCitas, setErroresCitas] = useState({}); // { [citaId]: string }
  const [enviando,     setEnviando]     = useState(false);

  const manejarLogout = () => {
    logout();
    onLogout?.();
  };

  // ── Cancelar cita ─────────────────────────────────────────────────────────
  const cancelarCita = async (cita) => {
    const diffHoras = (parsearCitaDateTime(cita.fecha, cita.hora) - new Date()) / 3_600_000;
    if (diffHoras < 1) {
      setErroresCitas((p) => ({ ...p, [cita._id]: "Ya no es posible cancelar esta cita en línea. Contacta directamente a Blanca Ríos Estudio." }));
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch(`/api/appointments/mias/${cita._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ estado: "cancelada" }),
      });
      if (res.status === 401) { logout(); return; }
      const data = await res.json();
      if (!res.ok) { setErroresCitas((p) => ({ ...p, [cita._id]: data.mensaje })); return; }
      recargarCitas();
    } catch {
      setErroresCitas((p) => ({ ...p, [cita._id]: "No se pudo conectar con el servidor." }));
    } finally {
      setEnviando(false);
    }
  };

  const { proximas, pasadas, totalVisitas } = useMemo(() => {
    const ordenadas = [...citas].sort(
      (a, b) => new Date(b.fecha) - new Date(a.fecha)
    );
    const prox = ordenadas.filter((c) => esFutura(c.fecha, c.hora) && c.estado !== "cancelada");
    const pas  = ordenadas.filter((c) => !esFutura(c.fecha, c.hora) || c.estado === "cancelada");
    const visitas = citas.filter((c) => c.estado !== "cancelada").length;
    return { proximas: prox, pasadas: pas, totalVisitas: visitas };
  }, [citas]);

  return (
    <div className="bg-fondo text-blanco-suave min-h-screen flex flex-col">

      <Navbar
        onInicio={onVolverInicio}
        onAgendar={onAgendar}
        modoHistorial={true}
      />

      <main className="section-wrap flex-1 py-10">

        {/* Encabezado */}
        <div className="mb-8">
          <p className="brand-label mb-2">Blanca Ríos Estudio</p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-blanco-suave mb-1">
            Hola, {usuario?.nombre?.split(" ")[0]} 👋
          </h1>
          <p className="section-subtitle text-sm">
            Aquí tienes el registro completo de tus visitas.
          </p>
        </div>

        {/* Métricas */}
        <div className="mb-10 grid grid-cols-2 gap-4 max-w-sm">
          <MetricCard label="Visitas totales" value={totalVisitas} />
          <MetricCard label="Próximas" value={proximas.length} />
        </div>

        {/* ── Estados: cargando / error / contenido ── */}
        {citasCargando ? (
          <div className="flex items-center gap-3 py-10 text-texto-secundario text-sm">
            <span className="w-4 h-4 rounded-full border-2 border-texto-secundario/30 border-t-crema animate-spin" />
            Cargando tus citas…
          </div>

        ) : citasError ? (
          <div className="max-w-2xl card p-6 border-estado-cancelada/30 text-center space-y-3">
            <p className="text-sm text-estado-cancelada/90">{citasError}</p>
            <button
              type="button"
              onClick={recargarCitas}
              className="btn-secondary text-xs"
            >
              Reintentar
            </button>
          </div>

        ) : (
          <div className="max-w-2xl space-y-10">

            {/* Próximas citas con acciones de reagendar / cancelar */}
            {proximas.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-texto-secundario uppercase tracking-widest mb-4">
                  Próximas citas
                </h2>
                <div className="space-y-4">
                  {proximas.map((cita) => {
                    const errorCita = erroresCitas[cita._id];
                    return (
                      <AppointmentCard
                        key={cita._id || cita.id}
                        cita={cita}
                        esPróxima={true}
                        acciones={
                          <div className="space-y-3">
                            {errorCita && (
                              <p className="text-xs text-estado-cancelada/90">{errorCita}</p>
                            )}
                            <div className="space-y-2">
                              {cita.reagendada && (
                                <p className="text-xs text-texto-secundario">
                                  Esta cita ya fue reagendada una vez.
                                </p>
                              )}
                              <div className="flex gap-2">
                                {!cita.reagendada && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setErroresCitas((p) => { const n = { ...p }; delete n[cita._id]; return n; });
                                      onReagendar?.(cita);
                                    }}
                                    className="btn-secondary flex-1"
                                  >
                                    Reagendar
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={enviando}
                                  onClick={() => cancelarCita(cita)}
                                  className={`btn-danger ${cita.reagendada ? "w-full" : "flex-1"}`}
                                >
                                  Cancelar cita
                                </button>
                              </div>
                            </div>
                          </div>
                        }
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Pasadas o estado vacío */}
            <div>
              <h2 className="text-xs font-semibold text-texto-secundario uppercase tracking-widest mb-4">
                {pasadas.length > 0 ? "Visitas anteriores" : "Sin historial aún"}
              </h2>
              {pasadas.length > 0
                ? (
                  <div className="space-y-4">
                    {pasadas.map((cita) => (
                      <AppointmentCard key={cita.id} cita={cita} />
                    ))}
                  </div>
                )
                : <SinHistorial onAgendar={onAgendar} />
              }
            </div>

            {/* CTA agendar */}
            {citas.length > 0 && (
              <div className="pt-4 border-t border-panel-medio/50 flex items-center justify-between gap-4 flex-wrap">
                <p className="text-sm text-texto-secundario">
                  ¿Listo para tu próxima visita?
                </p>
                <button
                  type="button"
                  onClick={onAgendar}
                  className="btn-primary btn-primary-hero"
                >
                  Agendar nueva cita
                </button>
              </div>
            )}

            {/* Cerrar sesión — al final, discreto */}
            <div className="pt-6 border-t border-panel-medio/30 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-blanco-suave">{usuario?.nombre}</p>
                <p className="text-[11px] text-texto-secundario">{usuario?.correo}</p>
              </div>
              <button
                type="button"
                onClick={manejarLogout}
                className="btn-danger"
              >
                Cerrar sesión
              </button>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
