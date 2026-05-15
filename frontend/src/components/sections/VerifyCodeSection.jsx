// src/components/sections/VerificarCodigoSection.jsx
//
// SECCIÓN — Paso 2 del flujo "Olvidé mi contraseña".
// Muestra 6 inputs individuales (un dígito por caja) para el código OTP.
//
// UX inteligente:
//   - Auto-focus al siguiente input cuando se escribe un dígito
//   - Backspace mueve el foco al input anterior
//   - Pegar (Ctrl+V) desde el portapapeles rellena todos los campos automáticamente
//   - El botón "Verificar" solo se habilita cuando los 6 dígitos están completos

import React, { useState, useRef } from "react";

const LONGITUD_CODIGO = 6;

/**
 * @param {object}   props
 * @param {string}   props.correo            — el correo al que se envió el código (para mostrar)
 * @param {function} props.onCodigoValido    — (codigo: string) => void — llamado al éxito
 * @param {function} props.onReenviarCodigo  — regresa al Paso 1 para reenviar
 * @param {string}   props.modo             — "registro" (default) | "recuperacion"
 */
export default function VerificarCodigoSection({ correo, onCodigoValido, onReenviarCodigo, modo = "registro" }) {
  // Array de 6 strings — un dígito por posición
  const [digitos, setDigitos] = useState(Array(LONGITUD_CODIGO).fill(""));
  const [error,   setError]   = useState("");
  const [cargando, setCargando] = useState(false);

  // Refs para mover el foco entre inputs sin re-renderizar
  const inputRefs = useRef([]);

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleChange = (index, valor) => {
    setError("");
    // Solo acepta un dígito numérico
    const digito = valor.replace(/\D/g, "").slice(-1);

    const nuevos = [...digitos];
    nuevos[index] = digito;
    setDigitos(nuevos);

    // Auto-focus al siguiente campo si se ingresó un dígito
    if (digito && index < LONGITUD_CODIGO - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Backspace: borra el campo actual y regresa el foco al anterior
    if (e.key === "Backspace" && !digitos[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pegado = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LONGITUD_CODIGO);
    if (!pegado) return;
    const nuevos = Array(LONGITUD_CODIGO).fill("");
    pegado.split("").forEach((d, i) => { nuevos[i] = d; });
    setDigitos(nuevos);
    // Mueve el foco al último campo rellenado (o al final)
    const ultimo = Math.min(pegado.length, LONGITUD_CODIGO - 1);
    inputRefs.current[ultimo]?.focus();
  };

  const codigoCompleto = digitos.every((d) => d !== "");
  const codigoString   = digitos.join("");

  const manejarSubmit = async (e) => {
    e.preventDefault();
    if (!codigoCompleto) return;
    setError("");
    setCargando(true);
    try {
      const endpoint = modo === "recuperacion"
        ? "/api/auth/verificar-recuperacion"
        : "/api/auth/verificar-codigo";
      const res  = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, codigo: codigoString }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.mensaje || "Código incorrecto."); return; }

      onCodigoValido(codigoString);
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  // ── Correo enmascarado para mostrar parcialmente ─────────────────────────
  // ej: "usuario@correo.com" → "us***o@correo.com"
  const correoMascara = (() => {
    const [local, dominio] = correo.split("@");
    if (!dominio || local.length <= 2) return correo;
    return `${local.slice(0, 2)}${"*".repeat(Math.max(local.length - 3, 1))}${local.slice(-1)}@${dominio}`;
  })();

  return (
    <div className="card px-8 py-8">

      {/* ── Ícono decorativo ── */}
      <div className="flex justify-center mb-5">
        <div className="w-14 h-14 rounded-2xl bg-crema/10 border border-crema/25 flex items-center justify-center">
          <svg className="w-6 h-6 text-crema" fill="none" stroke="currentColor"
            strokeWidth="1.8" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
        </div>
      </div>

      {/* ── Encabezado ── */}
      <div className="text-center mb-7">
        <p className="brand-label mb-3">Blanca Ríos Estudio</p>
        <h1 className="font-display text-2xl font-bold text-blanco-suave mb-2">
          Revisa tu correo
        </h1>
        <p className="section-subtitle text-xs leading-relaxed max-w-xs mx-auto">
          Enviamos un código de 6 dígitos a{" "}
          <span className="text-blanco-suave font-medium">{correoMascara}</span>
          . Ingrésalo a continuación.
        </p>
      </div>

      {/* ── Error global ── */}
      {error && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-estado-cancelada/40 bg-estado-cancelada/10">
          <p className="text-xs text-estado-cancelada/90 text-center">{error}</p>
        </div>
      )}

      {/* ── Formulario ── */}
      <form onSubmit={manejarSubmit} noValidate>

        {/* Inputs OTP — 6 cajas individuales */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {digitos.map((digito, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digito}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              style={{
                borderColor: digito
                  ? "var(--color-crema)"
                  : "var(--color-panel-medio)",
              }}
              className={[
                "w-11 h-14 rounded-xl text-center text-lg font-bold border-2 transition-all duration-150",
                "bg-panel-oscuro text-blanco-suave outline-none",
                "focus:border-crema focus:shadow-[0_0_0_3px_rgba(201,169,110,0.15)]",
                digito ? "text-crema" : "text-blanco-suave",
              ].join(" ")}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={!codigoCompleto || cargando}
          className={[
            "btn-primary btn-primary-hero w-full flex items-center justify-center gap-2",
            (!codigoCompleto || cargando) ? "opacity-50 cursor-not-allowed" : "",
          ].join(" ")}
        >
          {cargando ? (
            <>
              <span className="w-3.5 h-3.5 rounded-full border-2 border-negro-suave/30 border-t-negro-suave animate-spin" />
              Verificando…
            </>
          ) : (
            "Verificar Código"
          )}
        </button>
      </form>

      {/* ── Pie: reenviar código ── */}
      <p className="mt-6 text-center text-xs text-texto-secundario">
        ¿No recibiste el correo?{" "}
        <button
          type="button"
          onClick={onReenviarCodigo}
          className="text-crema font-semibold hover:text-crema-claro transition-colors"
        >
          Reenviar código
        </button>
      </p>
    </div>
  );
}