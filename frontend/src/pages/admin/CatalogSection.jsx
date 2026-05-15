// src/pages/admin/CatalogSection.jsx
//
// SECCIÓN — Catálogo de servicios del panel admin.
// Reutiliza ServiceCardAdmin (sin imagen, datos compactos) para mantener
// la coherencia visual con ServicioPickerCard que ven los clientes.
// El grid usa el mismo patrón que ServiciosSection de la homepage.

import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createAdminApi } from "../../hooks/useAdminApi";
import AdminSectionHeader from "../../components/admin/AdminSectionHeader";
import ServiceCardAdmin from "../../components/admin/ServiceCardAdmin";
import ServiceFormDrawer from "../../components/admin/ServiceFormDrawer";
import Toast from "../../components/ui/Toast";

export default function CatalogSection({ servicios, setServicios }) {
  const { getToken } = useAuth();
  const api = React.useMemo(() => createAdminApi(getToken), [getToken]);

  const [drawerAbierto, setDrawerAbierto] = useState(false);
  const [borrador, setBorrador] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [toastError, setToastError] = useState("");

  const mostrarToastError = (msg) => {
    setToastError(msg);
    setTimeout(() => setToastError(""), 4000);
  };

  const activos = servicios.filter((s) => s.activo !== false).length;

  const abrirNuevo = () => {
    setBorrador(null);
    setDrawerAbierto(true);
  };

  const onGuardar = async (s) => {
    const payload = {
      titulo:       s.titulo,
      descripcion:  s.descripcion,
      imagen:       s.imagen,
      precio:       s.precio,
      duracion:     s.duracion,
      categoria:    s.categoria,
      oferta:       s.oferta,
      precioOferta: s.precioOferta,
      activo:       s.activo,
    };
    setCargando(true);
    try {
      const esExistente = s.id && servicios.some((x) => x.id === s.id);
      if (esExistente) {
        const data = await api.updateService(s.id, payload);
        const updated = { ...data.service, id: data.service._id, nombre: data.service.titulo };
        setServicios((prev) => prev.map((x) => (x.id === s.id ? updated : x)));
      } else {
        const data = await api.createService(payload);
        const created = { ...data.service, id: data.service._id, nombre: data.service.titulo };
        setServicios((prev) => [...prev, created]);
      }
    } catch (err) {
      console.error("Error al guardar servicio:", err);
      mostrarToastError("No se pudo guardar el servicio. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const onEliminar = async (id) => {
    setCargando(true);
    try {
      await api.deleteService(id);
      setServicios((prev) => prev.filter((x) => x.id !== id));
    } catch (err) {
      console.error("Error al eliminar servicio:", err);
      mostrarToastError("No se pudo eliminar el servicio. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const toggleActivo = async (id) => {
    const servicio = servicios.find((x) => x.id === id);
    if (!servicio) return;
    const nuevoActivo = servicio.activo === false;
    try {
      const data = await api.updateService(id, { activo: nuevoActivo });
      const updated = { ...data.service, id: data.service._id, nombre: data.service.titulo };
      setServicios((prev) => prev.map((x) => (x.id === id ? updated : x)));
    } catch (err) {
      console.error("Error al cambiar estado del servicio:", err);
      mostrarToastError("No se pudo cambiar el estado del servicio. Intenta de nuevo.");
    }
  };

  return (
    <div>
      {/* ── Encabezado con CTA — mismo patrón que Navbar ── */}
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <AdminSectionHeader
          noMargin
          label="Servicios"
          title="Catálogo"
          subtitle={`${activos} de ${servicios.length} servicios activos y visibles en agendar.`}
        />

        {/* CTA principal — btn-primary, igual que el botón "Agendar cita" del Navbar */}
        <button
          type="button"
          className="btn-primary shrink-0 flex items-center gap-2"
          onClick={abrirNuevo}
          disabled={cargando}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Nuevo servicio
        </button>
      </div>

      {/* ── Grid de cards — mismo layout que ServiciosSection ── */}
      {servicios.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-texto-secundario text-sm mb-4">
            No hay servicios en el catálogo.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={abrirNuevo}
          >
            Crear primer servicio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {servicios.map((servicio) => (
            <ServiceCardAdmin
              key={servicio.id}
              servicio={servicio}
              onEditar={(id) => {
                setBorrador(servicios.find((x) => x.id === id));
                setDrawerAbierto(true);
              }}
              onToggleActivo={toggleActivo}
            />
          ))}
        </div>
      )}

      {/* ── Leyenda de uso ── */}
      <p className="mt-4 text-[11px] text-texto-secundario">
        Pasa el cursor sobre una tarjeta para ver las opciones de edición.
      </p>

      {/* ── Drawer de formulario ── */}
      <ServiceFormDrawer
        abierto={drawerAbierto}
        onCerrar={() => setDrawerAbierto(false)}
        servicioInicial={borrador}
        onGuardar={onGuardar}
        onEliminar={onEliminar}
      />
      <Toast mensaje={toastError} onCerrar={() => setToastError("")} />
    </div>
  );
}
