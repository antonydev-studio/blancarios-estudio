// src/components/ui/BadgeEstado.jsx

import React from "react";

/**
 * Badge de estado de cita con color semántico.
 *
 * @param {'pendiente'|'confirmada'|'cancelada'|'finalizada'} props.estado
 */
export default function BadgeEstado({ estado }) {
  const config = {
    pendiente: {
      label: "Pendiente",
      cls: "bg-estado-pendiente/15 text-estado-pendiente border-estado-pendiente/30",
      dot: "bg-estado-pendiente",
    },
    confirmada: {
      label: "Confirmada",
      cls: "bg-estado-confirmada/15 text-estado-confirmada border-estado-confirmada/30",
      dot: "bg-estado-confirmada",
    },
    cancelada: {
      label: "Cancelada",
      cls: "bg-estado-cancelada/15 text-estado-cancelada border-estado-cancelada/30",
      dot: "bg-estado-cancelada",
    },
    finalizada: {
      label: "Finalizada",
      cls: "bg-estado-confirmada/15 text-estado-confirmada border-estado-confirmada/30",
      dot: "bg-estado-confirmada",
    },
  };

  const c = config[estado] ?? config.pendiente;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${c.cls}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}
