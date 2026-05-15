// src/components/sections/NuevaContrasenaSection.jsx
//
// SECCIÓN — Paso 3 del flujo "Olvidé mi contraseña".
// El usuario define su nueva contraseña y la confirma.
//
// Incluye un indicador visual de fuerza de contraseña (débil / media / fuerte)
// para guiar al usuario a crear una contraseña segura.

import React, { useState, useMemo } from "react";
import { evaluarFuerza, CONTRASENA_REGEX, CONTRASENA_MENSAJE } from "../../utils/passwordUtils";

/**
 * @param {object}   props
 * @param {string}   props.correo                   — se envía al backend junto con el código
 * @param {string}   props.codigo                   — el código verificado en el Paso 2
 * @param {function} props.onContrasenaActualizada   — () => void — llamado al éxito
 */
export default function NuevaContrasenaSection({ correo, codigo, onContrasenaActualizada }) {
  const [contrasena, setContrasena] = useState("");
  const [confirmar,  setConfirmar]  = useState("");
  const [errores,    setErrores]    = useState({});
  const [cargando,   setCargando]   = useState(false);

  const fuerza = useMemo(() => evaluarFuerza(contrasena), [contrasena]);
  const [verContrasena, setVerContrasena] = useState(false);
  const [verConfirmar,  setVerConfirmar]  = useState(false);

  // ── Validación ───────────────────────────────────────────────────────────
  const validar = () => {
    const e = {};
    if (!contrasena)
      e.contrasena = "Ingresa tu nueva contraseña.";
    else if (!CONTRASENA_REGEX.test(contrasena))
      e.contrasena = CONTRASENA_MENSAJE;

    if (!confirmar)
      e.confirmar = "Confirma tu nueva contraseña.";
    else if (confirmar !== contrasena)
      e.confirmar = "Las contraseñas no coinciden.";

    return e;
  };

  const manejarSubmit = async (e) => {
    e.preventDefault();
    const erroresNuevos = validar();
    if (Object.keys(erroresNuevos).length > 0) {
      setErrores(erroresNuevos);
      return;
    }
    setErrores({});
    setCargando(true);
    try {
      const res  = await fetch("/api/auth/nueva-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo, nuevaContrasena: contrasena }),
      });
      const data = await res.json();
      if (!res.ok) { setErrores({ contrasena: data.mensaje }); return; }

      onContrasenaActualizada();
    } catch (err) {
      console.error(err);
      setErrores({ contrasena: "No se pudo conectar con el servidor." });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="card px-8 py-8">

      {/* ── Ícono decorativo ── */}
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-crema/10 border border-crema/25 flex items-center justify-center">
          <svg className="w-6 h-6 text-crema" fill="none" stroke="currentColor"
            strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      </div>

      {/* ── Encabezado ── */}
      <div className="text-center mb-7">
        <p className="brand-label mb-3">Blanca Ríos Estudio</p>
        <h1 className="font-display text-2xl font-bold text-blanco-suave mb-2">
          Nueva Contraseña
        </h1>
        <p className="section-subtitle text-xs leading-relaxed max-w-xs mx-auto">
          Elige una contraseña segura que no hayas usado antes.
        </p>
      </div>

      {/* ── Formulario ── */}
      <form onSubmit={manejarSubmit} className="space-y-4" noValidate>

        {/* Campo contraseña con ojito */}
        <div className="space-y-1.5">
          <label htmlFor="nueva-contrasena" className="label">Nueva Contraseña</label>
          <div className="relative">
            <input
              id="nueva-contrasena"
              type={verContrasena ? "text" : "password"}
              className={["input-base pr-10", errores.contrasena ? "!border-estado-cancelada/70 focus:!border-estado-cancelada" : ""].filter(Boolean).join(" ")}
              placeholder="Mínimo 8 caracteres"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
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
          {errores.contrasena && (
            <p className="text-[11px] text-estado-cancelada/80 flex items-center gap-1">
              <span aria-hidden="true">✕</span>
              {errores.contrasena}
            </p>
          )}
        </div>

        {/* Indicador de fuerza — solo visible cuando hay texto */}
        {contrasena && (
          <div className="space-y-1.5 -mt-1">
            {/* Barras de fuerza */}
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
            {/* Etiqueta */}
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

        {/* Campo confirmar con ojito */}
        <div className="space-y-1.5">
          <label htmlFor="confirmar-contrasena" className="label">Confirmar Contraseña</label>
          <div className="relative">
            <input
              id="confirmar-contrasena"
              type={verConfirmar ? "text" : "password"}
              className={["input-base pr-10", errores.confirmar ? "!border-estado-cancelada/70 focus:!border-estado-cancelada" : ""].filter(Boolean).join(" ")}
              placeholder="Repite tu nueva contraseña"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
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
            <p className="text-[11px] text-estado-cancelada/80 flex items-center gap-1">
              <span aria-hidden="true">✕</span>
              {errores.confirmar}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={cargando}
          className="btn-primary btn-primary-hero w-full mt-2 flex items-center justify-center gap-2"
        >
          {cargando ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-negro-suave/30 border-t-negro-suave animate-spin" />
              Guardando…
            </>
          ) : (
            "Guardar Nueva Contraseña"
          )}
        </button>
      </form>
    </div>
  );
}