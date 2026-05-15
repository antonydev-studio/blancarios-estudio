// src/pages/admin/ReportsSection.jsx

import React, { useMemo, useState } from "react";
import AdminSectionHeader from "../../components/admin/AdminSectionHeader";
import AdminFilterChip from "../../components/admin/AdminFilterChip";
import MetricCard from "../../components/ui/MetricCard";
import BarChart from "../../components/ui/BarChart";

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// Convierte "02:00 PM" → "2 PM", "10:30 AM" → "10 AM", etc.
function obtenerHoraLabel(horaStr) {
  if (!horaStr) return "?";
  const partes = horaStr.split(" ");
  if (partes.length < 2) return horaStr;
  const [time, period] = partes;
  const hora = time.split(":")[0];
  return `${parseInt(hora, 10)} ${period}`;
}

function filtrarPorPeriodo(citas, periodo) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return citas.filter((c) => {
    const [y, m, d] = c.fecha.split("-").map(Number);
    const fecha = new Date(y, m - 1, d);
    if (periodo === "hoy") return fecha.getTime() === hoy.getTime();
    if (periodo === "semana") return fecha >= new Date(hoy.getTime() - 6 * 86400000);
    // mes = últimos 30 días
    return fecha >= new Date(hoy.getTime() - 29 * 86400000);
  });
}

const PERIODOS = [
  { key: "hoy",    label: "Hoy" },
  { key: "semana", label: "Semana" },
  { key: "mes",    label: "Mes" },
];

export default function ReportsSection({ citas }) {
  const [periodo, setPeriodo] = useState("hoy");

  const citasFiltradas = useMemo(
    () => filtrarPorPeriodo(citas, periodo),
    [citas, periodo]
  );

  // TODO backend: GET /api/reportes?periodo=${periodo}
  // Reemplazar este useMemo por un useEffect + fetch al endpoint
  const metricas = useMemo(() => {
    // Ingresos = solo citas con estado "finalizada" (ya atendidas y cobradas)
    const finalizadas = citasFiltradas.filter((c) => c.estado === "finalizada");
    const canceladas  = citasFiltradas.filter((c) => c.estado === "cancelada");
    const total       = citasFiltradas.length;
    const ingresos    = finalizadas.reduce((s, c) => s + c.precio, 0);
    return {
      total,
      ingresos,
      cancelaciones: total ? `${(canceladas.length / total * 100).toFixed(1)}%` : "—",
      ticket: finalizadas.length ? `$${(ingresos / finalizadas.length).toFixed(0)}` : "—",
    };
  }, [citasFiltradas]);

  // TODO backend: GET /api/reportes/servicios?periodo=${periodo}
  const porServicio = useMemo(() => {
    const m = {};
    for (const c of citasFiltradas) {
      const k = c.servicios[0] ?? "Otro";
      m[k] = (m[k] || 0) + 1;
    }
    const entries = Object.entries(m)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
    const maxVal = entries[0]?.value ?? 0;
    return entries.map((x) => ({
      ...x,
      color: x.value === maxVal ? "var(--color-crema)" : "var(--color-panel-medio)",
    }));
  }, [citasFiltradas]);

  // TODO backend: GET /api/reportes/dias?periodo=${periodo}
  const porDiaSemana = useMemo(() => {
    const m = [0, 0, 0, 0, 0, 0, 0];
    for (const c of citasFiltradas) {
      const [y, mo, d] = c.fecha.split("-").map(Number);
      const day = new Date(y, mo - 1, d).getDay();
      m[day] += 1;
    }
    const maxVal = Math.max(0, ...m);
    return m.map((value, i) => ({
      label: DIAS[i],
      value,
      color: maxVal > 0 && value === maxVal
        ? "var(--color-crema)"
        : "var(--color-panel-medio)",
    }));
  }, [citasFiltradas]);

  // TODO backend: GET /api/reportes/horas?periodo=${periodo}
  const horaPico = useMemo(() => {
    const m = {};
    for (const c of citasFiltradas) {
      const h = obtenerHoraLabel(c.hora);
      m[h] = (m[h] || 0) + 1;
    }
    return Object.entries(m)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [citasFiltradas]);

  // TODO backend: GET /api/reportes/ingresos?periodo=mes
  // Solo se calcula cuando periodo === "mes"
  const ingresosPorDia = useMemo(() => {
    if (periodo !== "mes") return [];
    const m = {};
    // Ingresos = solo citas con estado "finalizada" (ya atendidas y cobradas)
    for (const c of citasFiltradas.filter((x) => x.estado === "finalizada")) {
      m[c.fecha] = (m[c.fecha] || 0) + c.precio;
    }
    const entries = Object.entries(m)
      .map(([label, value]) => ({ label: label.slice(5), value })) // "MM-DD"
      .sort((a, b) => a.label.localeCompare(b.label));
    const maxVal = entries[0] ? Math.max(...entries.map((x) => x.value)) : 0;
    return entries.map((x) => ({
      ...x,
      color: x.value === maxVal ? "var(--color-crema)" : "var(--color-panel-medio)",
    }));
  }, [citasFiltradas, periodo]);

  return (
    <div className="space-y-8 sm:space-y-10">
      <AdminSectionHeader
        label="Analítica"
        title="Reportes"
        subtitle="Indicadores y tendencias de demanda por período."
      />

      {/* Filtro de período */}
      <div className="flex gap-2">
        {PERIODOS.map(({ key, label }) => (
          <AdminFilterChip
            key={key}
            selected={periodo === key}
            onClick={() => setPeriodo(key)}
          >
            {label}
          </AdminFilterChip>
        ))}
      </div>

      {/* Bloque 1 — Métricas principales */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Total citas" value={metricas.total} />
        <MetricCard
          label="Ingresos"
          value={`$${Math.round(metricas.ingresos)}`}
          valueClassName="text-crema"
        />
        <MetricCard label="Cancelaciones" value={metricas.cancelaciones} />
        <MetricCard
          label="Ticket promedio"
          value={metricas.ticket}
          valueClassName="text-crema"
        />
      </div>

      {/* Bloque 2 — Servicio más solicitado */}
      <BarChart
        title="Servicios más solicitados"
        data={porServicio}
        formatValue={(n) => `${n} citas`}
      />

      {/* Bloque 3 — Día más ocupado (oculto en "Hoy") */}
      {periodo !== "hoy" && (
        <BarChart
          title="Día más ocupado"
          data={porDiaSemana}
          formatValue={(n) => `${n} citas`}
        />
      )}

      {/* Bloque 4 — Hora pico */}
      <BarChart
        title="Hora pico"
        data={horaPico.map((x) => ({ ...x, color: "var(--color-crema)" }))}
        formatValue={(n) => `${n} citas`}
        horizontal
      />

      {/* Bloque 5 — Ingresos en el tiempo (solo "Mes") */}
      {periodo === "mes" && (
        <BarChart
          title="Ingresos por día (últimos 30 días)"
          data={ingresosPorDia}
          formatValue={(n) => `$${n}`}
        />
      )}
    </div>
  );
}
