import React from "react";
import StatusBadge from "../ui/StatusBadge";
import { generarMensajeCita, generarWaUrl } from "../../utils/whatsapp";

const PencilIcon = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

export function AppointmentTableRow({ cita, onVer }) {

  const handleWhatsApp = () => {
    const mensaje = generarMensajeCita(cita.clienteNombre, cita.hora);
    const url = generarWaUrl(cita.clienteTelefono, mensaje);
    window.open(url, "_blank");
  };

  return (
    <tr className="border-b border-panel-medio/40 hover:bg-panel-medio/30 group">
      <td className="py-3 px-3 text-sm font-medium text-blanco-suave">{cita.clienteNombre}</td>
      <td className="py-3 px-3 text-xs text-texto-secundario">{cita.clienteTelefono}</td>
      <td className="py-3 px-3 text-xs text-texto-secundario">{cita.servicios.join(", ")}</td>
      <td className="py-3 px-3 text-xs text-texto-secundario whitespace-nowrap">{cita.fecha}</td>
      <td className="py-3 px-3 text-xs text-texto-secundario">{cita.hora}</td>
      <td className="py-3 px-3"><StatusBadge estado={cita.estado} /></td>
      <td className="py-3 px-3 text-right">
        <div className="flex items-center justify-end gap-2">

          {/* WhatsApp */}
          <button
            type="button"
            onClick={handleWhatsApp}
            aria-label="Enviar WhatsApp"
            className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-green-500 hover:border-green-500/50 hover:bg-green-500/10 transition-colors duration-200"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.52 3.48A11.78 11.78 0 0012.04 0C5.4 0 .02 5.38.02 12c0 2.12.56 4.18 1.63 5.99L0 24l6.2-1.6A11.94 11.94 0 0012.04 24c6.62 0 12-5.38 12-12 0-3.2-1.25-6.2-3.52-8.52zM12.04 21.8c-1.8 0-3.55-.48-5.07-1.4l-.36-.22-3.68.95.98-3.59-.24-.37a9.7 9.7 0 01-1.5-5.17c0-5.37 4.37-9.74 9.74-9.74 2.6 0 5.04 1.01 6.88 2.86a9.67 9.67 0 012.86 6.88c0 5.37-4.37 9.74-9.74 9.74zm5.3-7.28c-.29-.15-1.7-.84-1.96-.94-.26-.1-.45-.15-.64.15-.19.29-.74.94-.91 1.13-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.33-1.44-.86-.77-1.44-1.72-1.6-2.01-.17-.29-.02-.45.13-.6.13-.13.29-.34.43-.51.15-.17.2-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.64-1.54-.88-2.11-.23-.55-.47-.48-.64-.49l-.55-.01c-.19 0-.5.07-.76.36-.26.29-1 1-1 2.43s1.03 2.81 1.17 3.01c.15.19 2.02 3.09 4.89 4.33.68.29 1.2.46 1.61.59.68.22 1.3.19 1.79.12.55-.08 1.7-.7 1.94-1.38.24-.68.24-1.27.17-1.38-.07-.12-.26-.19-.55-.34z"/>
            </svg>
          </button>

          {/* Editar */}
          <button
            type="button"
            onClick={() => onVer(cita)}
            aria-label="Editar cita"
            className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-crema hover:border-crema/50 hover:bg-crema/10 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
          >
            <PencilIcon />
          </button>

        </div>
      </td>
    </tr>
  );
}

export function AppointmentMobileCard({ cita, onVer }) {

  const handleWhatsApp = () => {
    const mensaje = generarMensajeCita(cita.clienteNombre, cita.hora);
    const url = generarWaUrl(cita.clienteTelefono, mensaje);
    window.open(url, "_blank");
  };

  return (
    <li className="rounded-3xl border-2 border-panel-medio/80 bg-panel-oscuro p-4 transition-transform group">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <p className="font-display text-base font-semibold text-blanco-suave truncate">{cita.clienteNombre}</p>
          <p className="text-xs text-texto-secundario mt-0.5">{cita.servicios.join(", ")}</p>
        </div>
        <StatusBadge estado={cita.estado} />
      </div>

      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-texto-secundario">{cita.fecha} · {cita.hora}</p>

        <div className="flex items-center gap-2">
          
          {/* WhatsApp (visible siempre en móvil) */}
          <button
            type="button"
            onClick={handleWhatsApp}
            aria-label="Enviar WhatsApp"
            className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-green-500 hover:border-green-500/50 hover:bg-green-500/10 transition-colors duration-200"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.52 3.48A11.78 11.78 0 0012.04 0C5.4 0 .02 5.38.02 12c0 2.12.56 4.18 1.63 5.99L0 24l6.2-1.6A11.94 11.94 0 0012.04 24c6.62 0 12-5.38 12-12 0-3.2-1.25-6.2-3.52-8.52z"/>
            </svg>
          </button>

          {/* Editar */}
          <button
            type="button"
            onClick={() => onVer(cita)}
            aria-label="Editar cita"
            className="btn-icon-mini border border-panel-medio bg-panel-oscuro/95 text-crema hover:border-crema/50 hover:bg-crema/10"
          >
            <PencilIcon />
          </button>

        </div>
      </div>
    </li>
  );
}