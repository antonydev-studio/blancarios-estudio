// src/components/admin/ClientDrawer.jsx

import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { createAdminApi } from "../../hooks/useAdminApi";
import BaseDrawer from "../ui/BaseDrawer";
import AppointmentCard from "../ui/AppointmentCard";
import InputField from "../ui/InputField";
import Toast from "../ui/Toast";

export default function ClientDrawer({
  abierto,
  onCerrar,
  clienteId,
  clientes,
  citas,
  setClientes,
  setCitas,
}) {
  const { getToken } = useAuth();
  const api = React.useMemo(() => createAdminApi(getToken), [getToken]);

  const cliente = clientes?.find((x) => x.id === clienteId) ?? null;

  const [nombre,    setNombre]    = useState("");
  const [telefono,  setTelefono]  = useState("");
  const [correo,    setCorreo]    = useState("");
  const [errorMsg,  setErrorMsg]  = useState("");
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    if (!cliente) return;
    setNombre(cliente.nombre   ?? "");
    setTelefono(cliente.telefono ?? "");
    setCorreo(cliente.correo   ?? "");
    setErrorMsg("");
  }, [cliente?.id]);

  const citasCliente = useMemo(
    () =>
      citas
        .filter((c) => c.userId === cliente?.id)
        .sort((a, b) => (a.fecha < b.fecha ? 1 : -1))
        .slice(0, 5),
    [citas, cliente?.id]
  );

  if (!cliente) return null;

  const hayCambios =
    nombre   !== (cliente.nombre   ?? "") ||
    telefono !== (cliente.telefono ?? "") ||
    correo   !== (cliente.correo   ?? "");

  const validar = () => {
    const telefonoLimpio = telefono.replace(/\D/g, "");
    if (telefonoLimpio.length !== 10)
      return "El teléfono debe tener exactamente 10 dígitos.";
    if (correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
      return "El correo no tiene un formato válido.";
    return null;
  };

  const guardarDatos = async () => {
    const err = validar();
    if (err) { setErrorMsg(err); return; }
    setErrorMsg("");
    setGuardando(true);
    try {
      const { citasActualizadas } = await api.updateClient(cliente.id, {
        nombre, telefono, correo,
      });
      setClientes((prev) =>
        prev.map((c) => c.id === cliente.id ? { ...c, nombre, telefono, correo } : c)
      );
      if (telefono !== cliente.telefono && citasActualizadas > 0) {
        setCitas((prev) =>
          prev.map((c) =>
            c.clienteTelefono === cliente.telefono ? { ...c, clienteTelefono: telefono } : c
          )
        );
      }
    } catch (err) {
      const msg = err.message || "No se pudieron guardar los cambios.";
      setErrorMsg(msg);
    } finally {
      setGuardando(false);
    }
  };

  const actualizar = (patch) => {
    setClientes((prev) =>
      prev.map((c) => (c.id === cliente.id ? { ...c, ...patch } : c))
    );
  };

  const persistirCliente = (patch) => {
    actualizar(patch);
    const notas           = patch.notas           ?? cliente.notas           ?? "";
    const listaNegraActiva = patch.listaNegraActiva ?? !!cliente.listaNegraActiva;
    api.updateClient(cliente.id, { notas, listaNegraActiva }).catch(console.error);
  };

  return (
    <>
    <BaseDrawer abierto={abierto} onCerrar={onCerrar} titulo={nombre || cliente.nombre}>
      <div className="space-y-6">
        <div className="space-y-3">
          <InputField id="cli-nombre"   label="Nombre"   value={nombre}   onChange={(e) => setNombre(e.target.value)} />
          <InputField id="cli-telefono" label="Teléfono" value={telefono} onChange={(e) => setTelefono(e.target.value)} inputMode="tel" />
          <InputField id="cli-correo"   label="Correo"   value={correo}   onChange={(e) => setCorreo(e.target.value)}  inputMode="email" type="email" />
          {hayCambios && (
            <button
              type="button"
              className="btn-primary w-full"
              disabled={guardando}
              onClick={guardarDatos}
            >
              {guardando ? "Guardando…" : "Guardar cambios"}
            </button>
          )}
        </div>

        <div>
          <label className="label" htmlFor="cli-notas">
            Notas internas
          </label>
          <textarea
            id="cli-notas"
            className="input-base min-h-[100px] w-full"
            placeholder="Solo visible para ti…"
            value={cliente.notas ?? ""}
            onChange={(e) => actualizar({ notas: e.target.value })}
            onBlur={() =>
              api.updateClient(cliente.id, {
                notas: cliente.notas ?? "",
                listaNegraActiva: !!cliente.listaNegraActiva,
              }).catch(console.error)
            }
          />
        </div>

        <div
          className={[
            "rounded-3xl border-2 p-4",
            cliente.listaNegraActiva
              ? "border-estado-cancelada/50 bg-estado-cancelada/10"
              : "border-panel-medio/80 bg-panel-oscuro",
          ].join(" ")}
        >
          <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
            <span className="text-sm text-blanco-suave">Lista negra</span>
            <div
              className={[
                "relative w-10 h-5 rounded-full border transition-colors duration-200",
                cliente.listaNegraActiva
                  ? "bg-crema/20 border-crema/50"
                  : "bg-panel-medio/40 border-panel-medio/60",
              ].join(" ")}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={!!cliente.listaNegraActiva}
                onChange={(e) => persistirCliente({ listaNegraActiva: e.target.checked })}
              />
              <span
                className={[
                  "absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-200",
                  cliente.listaNegraActiva
                    ? "translate-x-5 bg-crema"
                    : "translate-x-0 bg-texto-secundario",
                ].join(" ")}
              />
            </div>
          </label>
          {cliente.listaNegraActiva && (
            <p className="text-xs text-estado-cancelada/90 mt-2">
              Este cliente no podrá agendar nuevas citas.
            </p>
          )}
        </div>

        <div className="border-t border-panel-medio/40 pt-4 mt-2">
          <button
            type="button"
            className="btn-danger w-full"
            onClick={async () => {
              if (!window.confirm(`¿Eliminar a ${cliente.nombre} del sistema? Esta acción no se puede deshacer.`)) return;
              try {
                await api.deleteClient(cliente.id);
                setClientes((prev) => prev.filter((c) => c.id !== cliente.id));
                onCerrar();
              } catch (err) {
                console.error("Error al eliminar cliente:", err);
                alert("No se pudo eliminar el cliente. Intenta de nuevo.");
              }
            }}
          >
            Eliminar cliente
          </button>
        </div>

        <div>
          <p className="text-[11px] text-texto-secundario uppercase tracking-widest mb-3">
            Últimas citas
          </p>
          <div className="space-y-3">
            {citasCliente.map((cita) => (
              <AppointmentCard key={cita.id} cita={cita} />
            ))}
          </div>
        </div>
      </div>
    </BaseDrawer>
    <Toast mensaje={errorMsg} posicion="top" onCerrar={() => setErrorMsg("")} />
    </>
  );
}
