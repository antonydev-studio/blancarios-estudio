// src/components/sections/SolicitarCorreoSection.jsx
//
// SECCIÓN — Paso 1 del flujo "Olvidé mi contraseña".
// Una sola responsabilidad: pedir el correo y disparar el envío del código.
//
// Sin estado propio de navegación — el Page es quien decide qué paso mostrar.
// Solo conoce: "el usuario ingresó un correo y el servidor respondió OK".

import React, { useState } from "react";
import InputField from "../ui/InputField";

/**
 * @param {object}   props
 * @param {function} props.onCorreoEnviado  — (correo: string) => void  — llamado al éxito
 * @param {function} props.onIrLogin        — regresa a la página de Login
 */
export default function SolicitarCorreoSection({ onCorreoEnviado, onIrLogin }) {
  const [correo,   setCorreo]   = useState("");
  const [error,    setError]    = useState("");
  const [cargando, setCargando] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validación client-side básica antes de llamar al servidor
    if (!correo.trim()) {
      setError("Ingresa tu correo electrónico.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
      setError("El formato del correo no es válido.");
      return;
    }

    setCargando(true);
    try {
      const res  = await fetch("/api/auth/olvide-contrasena", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.mensaje || "No se pudo enviar el código."); return; }

      onCorreoEnviado(correo);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
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
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        </div>
      </div>

      {/* ── Encabezado ── */}
      <div className="text-center mb-7">
        <p className="brand-label mb-3">Blanca Ríos Estudio</p>
        <h1 className="font-display text-2xl font-bold text-blanco-suave mb-2">
          ¿Olvidaste tu contraseña?
        </h1>
        <p className="section-subtitle text-xs leading-relaxed max-w-xs mx-auto">
          Sin problema. Ingresa tu correo y te enviaremos un código
          para que puedas crear una nueva contraseña.
        </p>
      </div>

      {/* ── Error global ── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-estado-cancelada/40 bg-estado-cancelada/10">
          <p className="text-xs text-estado-cancelada/90 text-center">{error}</p>
        </div>
      )}

      {/* ── Formulario ── */}
      <form onSubmit={manejarSubmit} className="space-y-5" noValidate>
        <InputField
          id="recuperar-correo"
          label="Correo Electrónico"
          tipo="email"
          placeholder="tucorreo@ejemplo.com"
          value={correo}
          onChange={(e) => setCorreo(e.target.value)}
          autoComplete="email"
          required
        />

        <button
          type="submit"
          disabled={cargando}
          className="btn-primary btn-primary-hero w-full flex items-center justify-center gap-2"
        >
          {cargando ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-negro-suave/30 border-t-negro-suave animate-spin" />
              Enviando código…
            </>
          ) : (
            "Enviar Código"
          )}
        </button>
      </form>

      {/* ── Pie: volver al login ── */}
      <p className="mt-6 text-center text-xs text-texto-secundario">
        ¿Ya la recordaste?{" "}
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