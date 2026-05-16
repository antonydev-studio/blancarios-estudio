// src/pages/admin/AdminPage.jsx

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useAdminData } from "../../hooks/useAdminData";
import AdminSidebar from "../../components/admin/AdminSidebar";
import DashboardSection from "./DashboardSection";
import AppointmentsSection from "./AppointmentsSection";
import CatalogSection from "./CatalogSection";
import AvailabilitySection from "./AvailabilitySection";
import ClientsSection from "./ClientsSection";
import ReportsSection from "./ReportsSection";
import BalanceSection from "./BalanceSection";
import HomepageSection from "./HomepageSection";
import BlockedClientsSection from "./BlockedClientsSection";

export default function AdminPage({ onLogout, onVolverHome, onCitaCreada }) {
  const { usuario, getToken, logout } = useAuth();
  const {
    citas,
    setCitas,
    servicios,
    setServicios,
    clientes,
    setClientes,
    diasBloqueados,
    setDiasBloqueados,
    movimientos,
    setMovimientos,
    config,
    setConfig,
    errorCarga,
    recargarTodo,
  } = useAdminData();

  const [seccionActiva, setSeccionActiva] = useState("dashboard");

  // Auto-finalizar citas pasadas al cargar el panel
  useEffect(() => {
    fetch("/api/appointments/auto-finalizar", {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
      .then((r) => {
        if (r.status === 401) { logout(); return null; }
        return r.json();
      })
      .then((data) => {
        if (!data) return;
        if (data.finalizadas > 0) recargarTodo();
      })
      .catch((err) => console.error("Error en auto-finalizar:", err));
  }, []);

  const contenido = (() => {
    switch (seccionActiva) {
      case "homepage":
        return <HomepageSection config={config} setConfig={setConfig} />;
      case "dashboard":
        return <DashboardSection citas={citas} diasBloqueados={diasBloqueados} config={config} />;
      case "citas":
        return (
          <AppointmentsSection
            citas={citas}
            setCitas={setCitas}
            servicios={servicios}
            config={config}
            diasBloqueados={diasBloqueados}
            onCitaCreada={onCitaCreada}
          />
        );
      case "catalogo":
        return <CatalogSection servicios={servicios} setServicios={setServicios} />;
      case "calendario":
        return (
          <AvailabilitySection
            diasBloqueados={diasBloqueados}
            setDiasBloqueados={setDiasBloqueados}
            config={config}
            setConfig={setConfig}
          />
        );
      case "clientes":
        return (
          <ClientsSection clientes={clientes} setClientes={setClientes} citas={citas} setCitas={setCitas} />
        );
      case "bloqueados":
        return <BlockedClientsSection />;
      case "reportes":
        return <ReportsSection citas={citas} servicios={servicios} />;
      case "balance":
        return (
          <BalanceSection
            citas={citas}
            movimientos={movimientos}
            setMovimientos={setMovimientos}
          />
        );
      default:
        return <DashboardSection citas={citas} diasBloqueados={diasBloqueados} config={config} />;
    }
  })();

  return (
    <div className="relative flex min-h-[100dvh] min-h-screen flex-col bg-fondo text-blanco-suave lg:flex-row">
      <AdminSidebar
        seccionActiva={seccionActiva}
        onCambiarSeccion={setSeccionActiva}
        usuario={usuario}
        onSalir={onLogout}
        onVolverHome={onVolverHome}
      />
      <div className="admin-main w-full flex-1 lg:min-h-0">
        <main className="section-wrap mx-auto max-w-6xl px-4 py-6 sm:px-4 sm:py-8 lg:py-10">
          {errorCarga && (
            <div className="mb-6 rounded-2xl border border-estado-cancelada/40 bg-estado-cancelada/10 px-4 py-3 flex items-center gap-3">
              <svg className="w-4 h-4 text-estado-cancelada shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
              <p className="text-sm text-estado-cancelada">{errorCarga}</p>
            </div>
          )}
          {contenido}
        </main>
      </div>
    </div>
  );
}
