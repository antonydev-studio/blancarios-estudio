// src/components/sections/LoginFormSection.jsx
//
// SECCIÓN — Formulario de inicio de sesión.
// CAMBIO: el botón "¿Olvidaste tu contraseña?" ahora llama a props.onOlvideContrasena
//         en lugar de ser un botón vacío.

import React, { useState } from "react";
import InputField from "../ui/InputField";

/**
 * @param {object}   props
 * @param {string}   props.correo
 * @param {string}   props.contrasena
 * @param {string}   props.error
 * @param {boolean}  props.cargando
 * @param {function} props.onCorreoChange
 * @param {function} props.onContrasenaChange
 * @param {function} props.onSubmit
 * @param {function} props.onIrARegistro
 * @param {function} props.onOlvideContrasena   — NUEVO: navega al flujo de recuperación
 */
export default function LoginFormSection({
  correo,
  contrasena,
  error,
  cargando,
  onCorreoChange,
  onContrasenaChange,
  onSubmit,
  onIrARegistro,
  onOlvideContrasena,
}) {
  const [verContrasena, setVerContrasena] = useState(false);

  return (
    <div className="card px-8 py-8">

      {/* ── Encabezado ── */}
      <div className="text-center mb-7">
        <p className="brand-label mb-3">Blanca Ríos Estudio</p>
        <h1 className="font-display text-2xl font-bold text-blanco-suave mb-2">
          Bienvenido de vuelta
        </h1>
        <p className="section-subtitle text-xs">
          Accede para gestionar tus citas y ver tu historial.
        </p>
      </div>

      {/* ── Error global ── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-estado-cancelada/40 bg-estado-cancelada/10">
          <p className="text-xs text-estado-cancelada/90 text-center">{error}</p>
        </div>
      )}

      {/* ── Formulario ── */}
      <form onSubmit={onSubmit} className="space-y-4" noValidate>

        <InputField
          id="login-correo"
          label="Correo Electrónico"
          tipo="email"
          placeholder="usuario@correo.com"
          value={correo}
          onChange={(e) => onCorreoChange(e.target.value)}
          autoComplete="email"
          required
        />

        {/* Contraseña con botón ojo */}
        <div className="space-y-1.5">
          <label htmlFor="login-contrasena" className="label">
            Contraseña
          </label>
          <div className="relative">
            <input
              id="login-contrasena"
              type={verContrasena ? "text" : "password"}
              className="input-base pr-10"
              placeholder="••••••••"
              value={contrasena}
              onChange={(e) => onContrasenaChange(e.target.value)}
              autoComplete="current-password"
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
        </div>

        {/* ¿Olvidaste tu contraseña? — AHORA FUNCIONAL */}
        <div className="flex justify-end -mt-1">
          <button
            type="button"
            onClick={onOlvideContrasena}
            className="text-[11px] text-texto-secundario hover:text-crema transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="btn-primary btn-primary-hero w-full mt-2 flex items-center justify-center gap-2"
        >
          {cargando ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-negro-suave/30 border-t-negro-suave animate-spin" />
              Verificando…
            </>
          ) : (
            "Iniciar Sesión"
          )}
        </button>
      </form>

      {/* ── Separador ── */}
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-panel-medio/60" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-panel-oscuro px-3 text-[10px] text-texto-secundario uppercase tracking-widest">
            o continúa sin cuenta
          </span>
        </div>
      </div>

      <p className="text-[11px] text-texto-secundario text-center leading-relaxed mb-5">
        Puedes agendar citas sin registrarte, pero una cuenta te permite
        ver tu historial y cancelar citas fácilmente.
      </p>

      <p className="text-center text-xs text-texto-secundario">
        ¿No tienes una cuenta?{" "}
        <button
          type="button"
          onClick={onIrARegistro}
          className="text-crema font-semibold hover:text-crema-claro transition-colors"
        >
          Regístrate aquí
        </button>
      </p>
    </div>
  );
}