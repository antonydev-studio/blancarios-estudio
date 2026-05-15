// src/components/admin/DayAppointmentsPanel.jsx — citas del día seleccionado

import React from "react";
import StatusBadge from "../ui/StatusBadge";
import { fechaISO, horaAMinutos } from "../../utils/slots";

export default function DayAppointmentsPanel({ fecha, citas }) {
  const key = fechaISO(fecha);
  const delDia = citas
    .filter((c) => c.fecha === key)
    .sort((a, b) => horaAMinutos(a.hora) - horaAMinutos(b.hora));

  return (
    <div className="card p-4 sm:p-5 xl:sticky xl:top-6">

      <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-4 font-medium">
        Citas del día — {fecha.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
      </p>

      {delDia.length === 0 ? (
        <div className="rounded-xl border border-panel-medio/50 px-4 py-10 text-center">
          <p className="text-texto-secundario text-sm">No hay citas para esta fecha.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {delDia.map((c) => (
            <li
              key={c.id}
              className="rounded-xl border border-panel-medio/60 bg-panel-medio/20 p-3 sm:p-4"
            >
              {/* Fila superior: hora + badge */}
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-sm font-semibold text-crema">{c.hora}</span>
                <StatusBadge estado={c.estado} />
              </div>
              {/* Cliente */}
              <p className="text-sm font-medium text-blanco-suave truncate">{c.clienteNombre}</p>
              {/* Servicios */}
              <p className="text-xs text-texto-secundario mt-0.5 truncate">{c.servicios.join(", ")}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
