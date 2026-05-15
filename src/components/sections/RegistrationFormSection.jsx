// src/components/sections/RegistroFormSection.jsx
//
// SECCIÓN — Formulario de registro.
// Sin estado propio: recibe todo por props desde RegistroPage.

import React, { useState, useMemo } from "react";
import InputField from "../ui/InputField";
import { evaluarFuerza } from "../../utils/passwordUtils";

/**
 * @param {object}   props
 * @param {string}   props.nombre
 * @param {string}   props.telefono
 * @param {string}   props.correo
 * @param {string}   props.contrasena
 * @param {string}   props.confirmar
 * @param {object}   props.errores         — { nombre?, telefono?, correo?, contrasena?, confirmar? }
 * @param {boolean}  props.cargando
 * @param {function} props.onNombreChange
 * @param {function} props.onTelefonoChange
 * @param {function} props.onCorreoChange
 * @param {function} props.onContrasenaChange
 * @param {function} props.onConfirmarChange
 * @param {function} props.onSubmit
 * @param {function} props.onIrLogin
 */
export default function RegistroFormSection({
  nombre,
  telefono,
  correo,
  contrasena,
  confirmar,
  errores = {},
  cargando,
  onNombreChange,
  onTelefonoChange,
  onCorreoChange,
  onContrasenaChange,
  onConfirmarChange,
  onSubmit,
  onIrLogin,
}) {
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmar,  setVerConfirmar]  = useState(false);
  const fuerza = useMemo(() => evaluarFuerza(contrasena), [contrasena]);

  return (
    <div className="card-form w-full max-w-md mx-auto shadow-2xl">

      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <div className="text-center mb-7">
        <p className="brand-label mb-2 tracking-[0.3em]">Blanca Ríos Estudio</p>
        <h1 className="font-display text-3xl font-bold text-blanco-suave mb-2">
          Crear Cuenta
        </h1>
        <p className="section-subtitle text-xs leading-relaxed max-w-xs mx-auto">
          Puedes agendar sin registrarte, pero con una cuenta llevas el control
          de todo tu historial de servicios.
        </p>
      </div>

      {/* ── Formulario ─────────────────────────────────────────────── */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>

        <InputField
          id="registro-nombre"
          label="Nombre Completo"
          tipo="text"
          placeholder="Ej. Juan Pérez"
          value={nombre}
          onChange={(e) => onNombreChange(e.target.value)}
          error={errores.nombre}
          autoComplete="name"
          required
        />

        {/* Teléfono — solo dígitos, exactamente 10 */}
        <div className="space-y-1.5">
          <label htmlFor="registro-telefono" className="label">Número de Teléfono</label>
          <input
            id="registro-telefono"
            type="tel"
            inputMode="numeric"
            className={["input-base", errores.telefono ? "!border-estado-cancelada/70 focus:!border-estado-cancelada" : ""].filter(Boolean).join(" ")}
            placeholder="755 123 4567"
            value={telefono}
            onChange={(e) => onTelefonoChange(e.target.value)}
            onKeyDown={(e) => {
              if (!/[\d]/.test(e.key) &&
                  !["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
              }
            }}
            autoComplete="tel"
            required
          />
          {errores.telefono && (
            <p className="text-[11px] text-estado-cancelada/80 flex items-center gap-1">
              <span aria-hidden="true">✕</span>
              {errores.telefono}
            </p>
          )}
        </div>

        <InputField
          id="registro-correo"
          label="Correo Electrónico"
          tipo="email"
          placeholder="tucorreo@ejemplo.com"
          value={correo}
          onChange={(e) => onCorreoChange(e.target.value)}
          error={errores.correo}
          autoComplete="email"
          required
        />

        {/* Contraseña con botón ojo */}
        <div className="space-y-1.5">
          <label htmlFor="registro-contrasena" className="label">Contraseña</label>
          <div className="relative">
            <input
              id="registro-contrasena"
              type={verContrasena ? "text" : "password"}
              className="input-base pr-10"
              placeholder="Mínimo 8 caracteres"
              value={contrasena}
              onChange={(e) => onContrasenaChange(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setVerContrasena((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-secundario hover:text-blanco-suave transition-colors"
              aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {verContrasena ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 3l18 18M10.477 10.477A3 3 0 0013.5 13.5M6.228 6.228A10.45 10.45 0 003 12c1.657 3.982 5.525 6.75 9 6.75a9.86 9.86 0 004.598-1.128M9.75 9.75A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .199-.02.394-.584M17.772 17.772A10.45 10.45 0 0021 12c-1.657-3.982-5.525-6.75-9-6.75a9.86 9.86 0 00-4.598 1.128" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {contrasena && (
            <div className="space-y-1.5 pt-0.5">
              <div className="flex gap-1">
                {[1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={[
                      "h-1 flex-1 rounded-full transition-all duration-300",
                      fuerza.nivel >= n ? fuerza.color : "bg-panel-medio/50",
                    ].join(" ")}
                  />
                ))}
              </div>
              <p className="text-[11px] text-texto-secundario">
                Seguridad:{" "}
                <span className={[
                  "font-semibold",
                  fuerza.nivel === 1 ? "text-estado-cancelada" :
                  fuerza.nivel === 2 ? "text-estado-pendiente" :
                  "text-estado-confirmada",
                ].join(" ")}>
                  {fuerza.etiqueta}
                </span>
                {fuerza.nivel < 3 && (
                  <span className="text-texto-secundario/60">
                    {" "}— usa mayúsculas, números y símbolos
                  </span>
                )}
              </p>
            </div>
          )}
          {errores.contrasena && (
            <p className="text-xs text-estado-cancelada">{errores.contrasena}</p>
          )}
        </div>

        {/* Confirmar Contraseña con botón ojo */}
        <div className="space-y-1.5">
          <label htmlFor="registro-confirmar" className="label">Confirmar Contraseña</label>
          <div className="relative">
            <input
              id="registro-confirmar"
              type={verConfirmar ? "text" : "password"}
              className="input-base pr-10"
              placeholder="Repite tu contraseña"
              value={confirmar}
              onChange={(e) => onConfirmarChange(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              onClick={() => setVerConfirmar((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-texto-secundario hover:text-blanco-suave transition-colors"
              aria-label={verConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {verConfirmar ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 3l18 18M10.477 10.477A3 3 0 0013.5 13.5M6.228 6.228A10.45 10.45 0 003 12c1.657 3.982 5.525 6.75 9 6.75a9.86 9.86 0 004.598-1.128M9.75 9.75A3 3 0 0112 9c1.657 0 3 1.343 3 3 0 .199-.02.394-.584M17.772 17.772A10.45 10.45 0 0021 12c-1.657-3.982-5.525-6.75-9-6.75a9.86 9.86 0 00-4.598 1.128" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              )}
            </button>
          </div>
          {errores.confirmar && (
            <p className="text-xs text-estado-cancelada">{errores.confirmar}</p>
          )}
        </div>

        <p className="text-[11px] text-texto-secundario leading-relaxed pt-1">
          Al registrarte aceptas nuestros términos y condiciones. Podrás
          gestionar tus datos desde tu perfil en cualquier momento.
        </p>

        <button
          type="submit"
          disabled={cargando}
          className="btn-primary btn-primary-hero w-full mt-1 flex items-center justify-center gap-2"
        >
          {cargando ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-negro-suave/30 border-t-negro-suave animate-spin" />
              Creando cuenta…
            </>
          ) : (
            "Crear Cuenta"
          )}
        </button>
      </form>

      {/* ── Pie: ir a Login ────────────────────────────────────────── */}
      <p className="mt-6 text-center text-xs text-texto-secundario">
        ¿Ya tienes cuenta?{" "}
        <button
          type="button"
          onClick={onIrLogin}
          className="text-crema font-semibold hover:text-crema-claro transition-colors"
        >
          Iniciar Sesión
        </button>
      </p>
    </div>
  );
}