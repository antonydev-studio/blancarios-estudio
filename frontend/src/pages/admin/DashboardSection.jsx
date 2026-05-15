// src/pages/admin/DashboardSection.jsx

import React, { useMemo, useState } from "react";
import AdminSectionHeader from "../../components/admin/AdminSectionHeader";
import DashboardMetrics from "../../components/admin/DashboardMetrics";
import CalendarAdmin from "../../components/admin/CalendarAdmin";
import DayAppointmentsPanel from "../../components/admin/DayAppointmentsPanel";

export default function DashboardSection({ citas, diasBloqueados, config = {} }) {
  const hoy = useMemo(() => new Date(), []);
  const [mesActual, setMesActual] = useState(
    () => new Date(hoy.getFullYear(), hoy.getMonth(), 1)
  );
  const [fechaSeleccionada, setFechaSeleccionada] = useState(() => hoy);

  const cambiarMes = (delta) =>
    setMesActual((p) => new Date(p.getFullYear(), p.getMonth() + delta, 1));

  const hoyStr = useMemo(() => {
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, "0");
    const d = String(hoy.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, [hoy]);

  return (
    <div>
      <AdminSectionHeader
        label="Operaciones"
        title="Panel de control"
        subtitle="Resumen del día, calendario y citas por fecha."
      />

      <DashboardMetrics citas={citas} hoyStr={hoyStr} />

      {/* Móvil: calendario arriba, citas debajo en columna completa
          Desktop xl: lado a lado */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] xl:items-start">
        <CalendarAdmin
          mesActual={mesActual}
          fechaSeleccionada={fechaSeleccionada}
          hoy={hoy}
          onCambiarMes={cambiarMes}
          onSeleccionarFecha={setFechaSeleccionada}
          diasBloqueadosStr={diasBloqueados}
          diasSemanaCerrados={config.diasCerrados ?? []}
          citas={citas}
        />
        <DayAppointmentsPanel fecha={fechaSeleccionada} citas={citas} />
      </div>
    </div>
  );
}
