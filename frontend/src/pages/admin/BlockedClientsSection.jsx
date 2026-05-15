// src/pages/admin/BlockedClientsSection.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createAdminApi } from "../../hooks/useAdminApi";
import AdminSectionHeader from "../../components/admin/AdminSectionHeader";
import InputField from "../../components/ui/InputField";

// ── Inline icons (same stroke style as ClientsTable) ─────────────────────────

const TrashIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const BanIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" d="M5.636 5.636l12.728 12.728" />
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function BlockedClientsSection() {
  const { getToken } = useAuth();
  const api = useMemo(() => createAdminApi(getToken), [getToken]);

  const [bloqueados, setBloqueados] = useState([]);
  const [telefono, setTelefono] = useState("");
  const [motivo, setMotivo]   = useState("");
  const [errorForm, setErrorForm] = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  async function cargar() {
    try {
      const data = await api.fetchBlockedClients();
      setBloqueados(data.data ?? []);
    } catch (err) {
      console.error("Error al cargar clientes bloqueados:", err.message);
    }
  }

  async function handleAgregar(e) {
    e.preventDefault();
    setErrorForm("");
    const tel = telefono.trim();
    if (!tel) {
      setErrorForm("El teléfono es requerido.");
      return;
    }
    setGuardando(true);
    try {
      await api.createBlockedClient({ telefono: tel, motivo: motivo.trim() });
      setTelefono("");
      setMotivo("");
      await cargar();
    } catch (err) {
      setErrorForm(err.message ?? "No se pudo agregar el número.");
    } finally {
      setGuardando(false);
    }
  }

  async function handleToggle(id) {
    try {
      const data = await api.toggleBlockedClient(id);
      setBloqueados((prev) =>
        prev.map((b) => (b._id === id ? data.data : b))
      );
    } catch (err) {
      console.error("Error al cambiar estado:", err.message);
    }
  }

  async function handleEliminar(id) {
    try {
      await api.deleteBlockedClient(id);
      setBloqueados((prev) => prev.filter((b) => b._id !== id));
    } catch (err) {
      console.error("Error al eliminar bloqueo:", err.message);
    }
  }

  return (
    <div>
      <AdminSectionHeader
        label="CRM"
        title="Bloqueados"
        subtitle="Números que no podrán agendar citas en línea."
      />

      {/* ── Formulario de bloqueo ── */}
      <form onSubmit={handleAgregar} noValidate>
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            <InputField
              id="bloq-telefono"
              label="Teléfono"
              placeholder="Ej. 5512345678"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value)}
              error={errorForm}
            />
          </div>
          <div className="min-w-0 flex-1">
            <InputField
              id="bloq-motivo"
              label="Motivo"
              placeholder="Opcional"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
              opcional
            />
          </div>
          <div className="sm:pb-1">
            <button
              type="submit"
              disabled={guardando}
              className="btn-primary w-full sm:w-auto"
            >
              {guardando ? "Bloqueando…" : "Bloquear número"}
            </button>
          </div>
        </div>
        <p className="mb-6 text-xs text-texto-secundario sm:mb-8">
          Los números agregados aquí no podrán agendar citas.
        </p>
      </form>

      {/* ── Tabla desktop ── */}
      <div className="admin-table-wrap hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-panel-medio/60 bg-panel-oscuro">
            <tr className="text-[10px] uppercase tracking-widest text-texto-secundario">
              <th className="px-3 py-3">Teléfono</th>
              <th className="px-3 py-3">Motivo</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {bloqueados.length === 0 && (
              <tr>
                <td colSpan={4} className="px-3 py-6 text-center text-xs text-texto-secundario">
                  No hay números bloqueados.
                </td>
              </tr>
            )}
            {bloqueados.map((b) => (
              <tr
                key={b._id}
                className="border-b border-panel-medio/40 hover:bg-panel-medio/30 group"
              >
                <td className="px-3 py-3 font-mono text-xs text-blanco-suave">{b.telefono}</td>
                <td className="px-3 py-3 text-xs text-texto-secundario">{b.motivo || "—"}</td>
                <td className="px-3 py-3">
                  {b.activo ? (
                    <span className="text-[10px] font-semibold text-estado-cancelada">Bloqueado</span>
                  ) : (
                    <span className="text-[10px] text-texto-secundario">Inactivo</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggle(b._id)}
                      aria-label={b.activo ? "Desbloquear" : "Bloquear"}
                      title={b.activo ? "Desbloquear" : "Bloquear"}
                      className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-crema hover:border-crema/50 hover:bg-crema/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                    >
                      {b.activo ? <CheckIcon /> : <BanIcon />}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEliminar(b._id)}
                      aria-label="Eliminar bloqueo"
                      title="Eliminar bloqueo"
                      className="btn-icon-mini border border-estado-cancelada/40 bg-panel-oscuro/95 text-estado-cancelada hover:border-estado-cancelada/60 hover:bg-estado-cancelada/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Lista mobile ── */}
      <ul className="space-y-3 md:hidden">
        {bloqueados.length === 0 && (
          <li className="text-center text-xs text-texto-secundario py-6">
            No hay números bloqueados.
          </li>
        )}
        {bloqueados.map((b) => (
          <li
            key={b._id}
            className="card rounded-3xl border-2 border-panel-medio/80 w-full p-4 sm:p-5 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-base font-semibold text-blanco-suave">
                    {b.telefono}
                  </span>
                  {b.activo ? (
                    <span className="text-[10px] text-estado-cancelada">Bloqueado</span>
                  ) : (
                    <span className="text-[10px] text-texto-secundario">Inactivo</span>
                  )}
                </div>
                {b.motivo && (
                  <p className="text-xs text-texto-secundario">{b.motivo}</p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggle(b._id)}
                  aria-label={b.activo ? "Desbloquear" : "Bloquear"}
                  title={b.activo ? "Desbloquear" : "Bloquear"}
                  className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-crema hover:border-crema/50 hover:bg-crema/10"
                >
                  {b.activo ? <CheckIcon /> : <BanIcon />}
                </button>
                <button
                  type="button"
                  onClick={() => handleEliminar(b._id)}
                  aria-label="Eliminar bloqueo"
                  title="Eliminar bloqueo"
                  className="btn-icon-mini border border-estado-cancelada/40 bg-panel-oscuro/95 text-estado-cancelada hover:border-estado-cancelada/60 hover:bg-estado-cancelada/10"
                >
                  <TrashIcon />
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
