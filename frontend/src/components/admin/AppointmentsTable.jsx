// src/components/admin/AppointmentsTable.jsx

import React from "react";
import InputField from "../ui/InputField";
import AdminFilterChip from "./AdminFilterChip";
import { AppointmentTableRow, AppointmentMobileCard } from "./AppointmentRow";

const filtros = [
  { id: "pendiente",  label: "Pendiente"  },
  { id: "finalizada", label: "Finalizada" },
  { id: "cancelada",  label: "Cancelada"  },
  { id: "todos",      label: "Todas"      },
];

export default function AppointmentsTable({
  busqueda,
  onBusquedaChange,
  filtroEstado,
  onFiltroEstado,
  citasFiltradas,
  onSeleccionar,
}) {
  // Ordenar por fecha ascendente (más próximas primero)
  const ordenadas = [...citasFiltradas].sort((a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora));

  return (
    <div className="space-y-4">

      {/* Búsqueda */}
      <InputField
        id="buscar-citas"
        label="Buscar cliente"
        placeholder="Nombre o teléfono"
        value={busqueda}
        onChange={(e) => onBusquedaChange(e.target.value)}
      />

      {/* Filtros de estado — scroll horizontal en móvil */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filtros.map((f) => (
          <AdminFilterChip
            key={f.id}
            selected={filtroEstado === f.id}
            onClick={() => onFiltroEstado(f.id)}
          >
            {f.label}
          </AdminFilterChip>
        ))}
      </div>

      {/* Tabla — solo desktop */}
      <div className="admin-table-wrap hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-panel-medio/60 bg-panel-oscuro">
            <tr className="text-[10px] uppercase tracking-widest text-texto-secundario">
              <th className="px-3 py-3">Cliente</th>
              <th className="px-3 py-3">Teléfono</th>
              <th className="px-3 py-3">Servicio</th>
              <th className="px-3 py-3">Fecha ↓</th>
              <th className="px-3 py-3">Hora</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {ordenadas.map((c) => (
              <AppointmentTableRow key={c.id} cita={c} onVer={onSeleccionar} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Cards — solo móvil */}
      <ul className="space-y-3 md:hidden">
        {ordenadas.map((c) => (
          <AppointmentMobileCard key={c.id} cita={c} onVer={onSeleccionar} />
        ))}
      </ul>

      {ordenadas.length === 0 && (
        <p className="py-10 text-center text-sm text-texto-secundario">
          Sin resultados.
        </p>
      )}
    </div>
  );
}
