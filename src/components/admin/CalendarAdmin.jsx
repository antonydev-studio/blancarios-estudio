// src/components/admin/CalendarAdmin.jsx

import React, { useMemo } from "react";
import MonthCalendar from "../ui/MonthCalendar";
import { fechaISO, parseYMD } from "../../utils/slots";

export default function CalendarAdmin({
  mesActual,
  fechaSeleccionada,
  hoy,
  onCambiarMes,
  onSeleccionarFecha,
  diasBloqueadosStr = [],
  diasSemanaCerrados = [],
  citas = [],
}) {
  const diasBloqueados = useMemo(
    () => diasBloqueadosStr.map((s) => parseYMD(s)).filter(Boolean),
    [diasBloqueadosStr]
  );

  const conteoPorDia = useMemo(() => {
    const m = {};
    for (const c of citas) {
      m[c.fecha] = (m[c.fecha] || 0) + 1;
    }
    return m;
  }, [citas]);

  const renderDiaExtra = (fecha) => {
    const k = fechaISO(fecha);
    const n = conteoPorDia[k] || 0;
    if (n === 0) return null;
    return (
      <span className="flex gap-0.5 justify-center items-center mt-0.5">
        <span className="w-1.5 h-1.5 rounded-full bg-crema" title={`${n} cita(s)`} />
        {n > 1 && (
          <span className="text-[8px] leading-none text-texto-secundario">{n}</span>
        )}
      </span>
    );
  };

  return (
    <MonthCalendar
      mesActual={mesActual}
      fechaSeleccionada={fechaSeleccionada}
      hoy={hoy}
      onCambiarMes={onCambiarMes}
      onSeleccionarFecha={onSeleccionarFecha}
      diasBloqueados={diasBloqueados}
      diasSemanaCerrados={diasSemanaCerrados}
      renderDiaExtra={renderDiaExtra}
    />
  );
}
