// src/components/admin/ClientsTable.jsx

import React from "react";

const PencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export default function ClientsTable({ clientesConStats, onFila }) {
  return (
    <>
      <div className="admin-table-wrap hidden md:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-panel-medio/60 bg-panel-oscuro">
            <tr className="text-[10px] uppercase tracking-widest text-texto-secundario">
              <th className="px-3 py-3">Nombre</th>
              <th className="px-3 py-3">Teléfono</th>
              <th className="px-3 py-3">Visitas</th>
              <th className="px-3 py-3">Valor total</th>
              <th className="px-3 py-3">Última visita</th>
              <th className="px-3 py-3">Estado</th>
              <th className="px-3 py-3 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {clientesConStats.map((c) => (
              <tr
                key={c.id}
                className="border-b border-panel-medio/40 hover:bg-panel-medio/30 group"
              >
                <td className="px-3 py-3">{c.nombre}</td>
                <td className="px-3 py-3 text-xs text-texto-secundario">{c.telefono}</td>
                <td className="px-3 py-3">{c.totalVisitas}</td>
                <td className="px-3 py-3 text-crema">${c.valorTotal}</td>
                <td className="px-3 py-3 text-xs">{c.ultimaVisita ?? "—"}</td>
                <td className="px-3 py-3">
                  {c.listaNegraActiva ? (
                    <span className="text-[10px] font-semibold text-estado-cancelada">Lista negra</span>
                  ) : c.totalVisitas > 5 ? (
                    <span className="text-[10px] font-semibold text-crema">VIP</span>
                  ) : (
                    <span className="text-[10px] text-texto-secundario">Activo</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onFila(c)}
                    aria-label="Editar cliente"
                    className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-crema hover:border-crema/50 hover:bg-crema/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <PencilIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ul className="space-y-3 md:hidden">
        {clientesConStats.map((c) => (
          <li
            key={c.id}
            className="card rounded-3xl border-2 border-panel-medio/80 w-full p-4 sm:p-5 group"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-base font-semibold text-blanco-suave">{c.nombre}</span>
                  {c.listaNegraActiva ? (
                    <span className="text-[10px] text-estado-cancelada">Lista negra</span>
                  ) : c.totalVisitas > 5 ? (
                    <span className="text-[10px] text-crema">VIP</span>
                  ) : null}
                </div>
                <p className="text-xs text-texto-secundario">
                  {c.telefono} · ${c.valorTotal} · {c.totalVisitas} visitas
                </p>
              </div>
              <button
                type="button"
                onClick={() => onFila(c)}
                aria-label="Editar cliente"
                className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-crema hover:border-crema/50 hover:bg-crema/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex-shrink-0"
              >
                <PencilIcon />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
