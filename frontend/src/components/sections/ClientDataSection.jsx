// src/components/sections/DatosClienteSection.jsx
//
// SECCIÓN — Paso 3 del flujo de agendado.
// Formulario de datos del cliente + botón de submit.
// Recibe todo por props: valores, setters y el handler de submit.
// Cuando haya auth real, el correo llegará ya desde el contexto de usuario.

import React from "react";

/**
 * @param {object}   props
 * @param {string}   props.nombre
 * @param {string}   props.telefono
 * @param {string}   props.correo
 * @param {boolean}  props.correoBloqueado   — true si el usuario ya inició sesión
 * @param {boolean}  props.cargando          — true mientras el fetch está en curso
 * @param {function} props.onNombreChange
 * @param {function} props.onTelefonoChange
 * @param {function} props.onCorreoChange
 * @param {function} props.onSubmit
 */
export default function DatosClienteSection({
  nombre,
  telefono,
  correo,
  correoBloqueado,
  cargando,
  onNombreChange,
  onTelefonoChange,
  onCorreoChange,
  onSubmit,
}) {
  return (
    <section>
      {/* Encabezado del paso */}
      <div className="flex items-center gap-3 mb-5">
        <span className="w-6 h-6 rounded-full bg-crema/15 border border-crema/40 flex items-center justify-center text-[10px] font-bold text-crema shrink-0">
          3
        </span>
        <h2 className="text-sm font-semibold text-blanco-suave">
          Ingresa tus Datos
        </h2>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">

        {/* Nombre */}
        <div>
          <label className="label">Nombre Completo</label>
          <input
            type="text"
            className="input-base"
            placeholder="Ej. Juan Pérez"
            value={nombre}
            onChange={(e) => onNombreChange(e.target.value)}
            required
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="label">Número de Teléfono</label>
          <input
            type="tel"
            inputMode="numeric"
            className="input-base"
            placeholder="755 123 4567"
            value={telefono}
            onChange={(e) => {
              const soloDigitos = e.target.value.replace(/\D/g, "").slice(0, 10);
              onTelefonoChange(soloDigitos);
            }}
            onKeyDown={(e) => {
              if (!/[\d]/.test(e.key) &&
                  !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            required
          />
        </div>

        {/* Correo */}
        <div>
          <label className="label">
            Correo Electrónico{" "}
            <span className="text-texto-secundario/60">(Opcional)</span>
          </label>
          <input
            type="email"
            className="input-base"
            placeholder="correo@ejemplo.com"
            value={correo}
            onChange={(e) => onCorreoChange(e.target.value)}
            disabled={correoBloqueado}
          />
          {correoBloqueado && (
            <p className="mt-1.5 text-[11px] text-texto-secundario">
              Estás usando el correo con el que iniciaste sesión.
            </p>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={cargando}
          className="btn-primary btn-primary-hero w-full mt-2 justify-center flex items-center gap-2"
        >
          {cargando ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-negro-suave/30 border-t-negro-suave animate-spin" />
              Agendando…
            </>
          ) : (
            "Confirmar Cita"
          )}
        </button>

      </form>
    </section>
  );
}