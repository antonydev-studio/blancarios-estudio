// src/pages/admin/ClientsSection.jsx

import React, { useMemo, useState } from "react";
import InputField from "../../components/ui/InputField";
import AdminSectionHeader from "../../components/admin/AdminSectionHeader";
import ClientsTable from "../../components/admin/ClientsTable";
import ClientDrawer from "../../components/admin/ClientDrawer";

export default function ClientsSection({ clientes, setClientes, citas, setCitas }) {
  const [busqueda, setBusqueda] = useState("");
  const [soloListaNegra, setSoloListaNegra] = useState(false);
  const [seleccionadoId, setSeleccionadoId] = useState(null);

  const clientesConStats = useMemo(() => {
    return clientes.map((c) => {
      const final = citas.filter(
        (ct) => ct.userId === c.id && ct.estado === "finalizada"
      );
      const valorTotal = final.reduce((s, ct) => s + ct.precio, 0);
      const fechas = final.map((ct) => ct.fecha).sort();
      const ultimaVisita = fechas.length ? fechas[fechas.length - 1] : null;
      const canceladas = citas.filter(
        (ct) => ct.userId === c.id && ct.estado === "cancelada"
      ).length;
      return {
        ...c,
        totalVisitas: final.length,
        valorTotal,
        ultimaVisita,
        citasCanceladas: canceladas,
      };
    });
  }, [clientes, citas]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return clientesConStats.filter((c) => {
      if (soloListaNegra && !c.listaNegraActiva) return false;
      if (!q) return true;
      const n = c.nombre.toLowerCase();
      const t = String(c.telefono).replace(/\D/g, "");
      const qn = q.replace(/\D/g, "");
      return n.includes(q) || (qn && t.includes(qn));
    });
  }, [clientesConStats, busqueda, soloListaNegra]);

  return (
    <div>
      <AdminSectionHeader
        label="CRM"
        title="Clientes"
        subtitle="Historial, notas internas y control de lista negra."
      />

      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <InputField
            id="busc-cli"
            label="Buscar"
            placeholder="Nombre o teléfono"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
        <label className="flex min-h-[44px] cursor-pointer items-center gap-2 text-sm text-texto-secundario sm:pb-1">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-panel-medio accent-crema"
            checked={soloListaNegra}
            onChange={(e) => setSoloListaNegra(e.target.checked)}
          />
          Ver lista negra
        </label>
      </div>

      <ClientsTable clientesConStats={filtrados} onFila={(c) => setSeleccionadoId(c.id)} />

      <ClientDrawer
        abierto={seleccionadoId != null}
        onCerrar={() => setSeleccionadoId(null)}
        clienteId={seleccionadoId}
        clientes={clientes}
        citas={citas}
        setClientes={setClientes}
        setCitas={setCitas}
      />
    </div>
  );
}
