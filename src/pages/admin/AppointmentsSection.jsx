// src/pages/admin/AppointmentsSection.jsx

import React, { useMemo, useState } from "react";
import AdminSectionHeader from "../../components/admin/AdminSectionHeader";
import AppointmentsTable from "../../components/admin/AppointmentsTable";
import AppointmentDrawer from "../../components/admin/AppointmentDrawer";
import NewAppointmentDrawer from "../../components/admin/NewAppointmentDrawer";

export default function AppointmentsSection({ citas, setCitas, servicios, config, diasBloqueados = [], onCitaCreada }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("pendiente");
  const [citaSeleccionadaId, setCitaSeleccionadaId] = useState(null);
  const [nuevaAbierta, setNuevaAbierta] = useState(false);

  const citasFiltradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return citas.filter((c) => {
      const okEstado = filtroEstado === "todos" || c.estado === filtroEstado;
      if (!okEstado) return false;
      if (!q) return true;
      const n = (c.clienteNombre ?? "").toLowerCase();
      const t = String(c.clienteTelefono ?? "").replace(/\D/g, "");
      const qn = q.replace(/\D/g, "");
      return n.includes(q) || (qn && t.includes(qn));
    });
  }, [citas, busqueda, filtroEstado]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <AdminSectionHeader
          noMargin
          label="Agenda"
          title="Gestión de citas"
          subtitle="Busca, filtra y abre el detalle para check-in o reprogramar."
        />
        <button
          type="button"
          className="btn-primary shrink-0 flex items-center gap-2"
          onClick={() => setNuevaAbierta(true)}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nueva cita
        </button>
      </div>
      <AppointmentsTable
        busqueda={busqueda}
        onBusquedaChange={setBusqueda}
        filtroEstado={filtroEstado}
        onFiltroEstado={setFiltroEstado}
        citasFiltradas={citasFiltradas}
        onSeleccionar={(c) => setCitaSeleccionadaId(c.id)}
      />

      <NewAppointmentDrawer
        abierto={nuevaAbierta}
        onCerrar={() => setNuevaAbierta(false)}
        onCitaCreada={onCitaCreada}
        setCitas={setCitas}
        servicios={servicios}
        config={config}
        diasBloqueados={diasBloqueados}
      />

      <AppointmentDrawer
        abierto={citaSeleccionadaId != null}
        onCerrar={() => setCitaSeleccionadaId(null)}
        citaId={citaSeleccionadaId}
        citas={citas}
        setCitas={setCitas}
        servicios={servicios}
        config={config}
        diasBloqueados={diasBloqueados}
      />
    </div>
  );
}
