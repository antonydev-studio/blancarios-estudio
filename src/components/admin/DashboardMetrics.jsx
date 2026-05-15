// src/components/admin/DashboardMetrics.jsx

import React, { useMemo } from "react";
import MetricCard from "../ui/MetricCard";
import { generarMensajeCita, generarWaUrl } from "../../utils/whatsapp";

function hoyISO() {
  const t = new Date();
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function minutosDesdeMedianoche(horaStr) {
  const [time, period] = horaStr.split(" ");
  let [h, mm] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + mm;
}

export default function DashboardMetrics({ citas, hoyStr = hoyISO() }) {
  // Ingresos = solo citas con estado "finalizada" (ya atendidas y cobradas)
  const cajaDia = useMemo(
    () =>
      citas
        .filter((c) => c.fecha === hoyStr && c.estado === "finalizada")
        .reduce((s, c) => s + c.precio, 0),
    [citas, hoyStr]
  );

  const citasHoy = useMemo(
    () => citas.filter((c) => c.fecha === hoyStr),
    [citas, hoyStr]
  );

  const conteoEstado = useMemo(() => {
    const m = { pendiente: 0, finalizada: 0, cancelada: 0 };
    for (const c of citasHoy) {
      if (m[c.estado] != null) m[c.estado] += 1;
    }
    return m;
  }, [citasHoy]);

  const siguiente = useMemo(() => {
    const ahora = new Date();
    const minAhora = ahora.getHours() * 60 + ahora.getMinutes();
    const futuras = citasHoy
      .filter((c) => c.estado !== "cancelada")
      .map((c) => ({ c, m: minutosDesdeMedianoche(c.hora) }))
      .filter(({ m }) => m >= minAhora)
      .sort((a, b) => a.m - b.m);
    return futuras[0]?.c ?? null;
  }, [citasHoy]);

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-5">

      {/* Caja del día — ocupa las 2 columnas en móvil para destacar */}
      <div className="card rounded-3xl border-2 border-panel-medio/80 p-4 col-span-2 lg:col-span-1">
        <p className="text-[10px] text-texto-secundario uppercase tracking-widest mb-1 font-medium">
          Caja del día
        </p>
        <p className="font-display text-3xl font-bold text-crema">${cajaDia}</p>
      </div>

      {/* Citas hoy */}
      <div className="card rounded-3xl border-2 border-panel-medio/80 p-4">
        <p className="text-[10px] text-texto-secundario uppercase tracking-widest mb-3 font-medium">
          Citas hoy ({citasHoy.length})
        </p>
        <ul className="text-xs text-blanco-suave space-y-1.5">
          <li className="flex justify-between">
            <span className="text-texto-secundario">Pendiente</span>
            <span className="text-estado-pendiente font-semibold">{conteoEstado.pendiente}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-texto-secundario">Finalizada</span>
            <span className="text-blanco-suave font-semibold">{conteoEstado.finalizada}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-texto-secundario">Cancelada</span>
            <span className="text-estado-cancelada font-semibold">{conteoEstado.cancelada}</span>
          </li>
        </ul>
      </div>

      {/* Siguiente cita */}
      <div className="card rounded-3xl border-2 border-panel-medio/80 p-4 flex flex-col gap-2">
        <p className="text-[10px] text-texto-secundario uppercase tracking-widest font-medium">
          Siguiente cita
        </p>
        {siguiente ? (
          <>
            <div>
              <p className="font-display text-base font-semibold text-blanco-suave">{siguiente.hora}</p>
              <p className="text-xs text-texto-secundario truncate">{siguiente.clienteNombre}</p>
            </div>
            <a
              href={generarWaUrl(
              siguiente.clienteTelefono,
              generarMensajeCita(siguiente.clienteNombre, siguiente.hora)
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-whatsapp text-center mt-auto"
            >
              WhatsApp
            </a>
          </>
        ) : (
          <p className="text-xs text-texto-secundario mt-1">No hay más citas hoy.</p>
        )}
      </div>

    </div>
  );
}
