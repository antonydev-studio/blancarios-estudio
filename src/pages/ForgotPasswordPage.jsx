// src/pages/OlvideContrasenaPage.jsx
//
// PÁGINA — Orquestador del flujo "Olvidé mi contraseña".
// Maneja 3 pasos en secuencia: solicitar correo → verificar código → nueva contraseña.
//
// ┌─────────────────────────────────────────────────────────────────┐
// │  FLUJO:                                                         │
// │  PASO 1: Usuario ingresa su correo                              │
// │  PASO 2: Ingresa el código de 6 dígitos recibido por email      │
// │  PASO 3: Define y confirma su nueva contraseña                  │
// │  → onIrLogin() al completar o cancelar                          │
// └─────────────────────────────────────────────────────────────────┘
//
// Cuando el backend esté listo:
//   Paso 1 → POST /api/auth/olvide-contrasena   { correo }
//   Paso 2 → POST /api/auth/verificar-codigo    { correo, codigo }
//   Paso 3 → POST /api/auth/nueva-contrasena    { correo, codigo, nuevaContrasena }

import React, { useState } from "react";

import Navbar                  from "../components/layout/Navbar";
import AuthHeroBackground      from "../components/ui/AuthHeroBackground";
import RequestEmailSection from "../components/sections/RequestEmailSection";
import VerifyCodeSection   from "../components/sections/VerifyCodeSection";
import NewPasswordSection  from "../components/sections/NewPasswordSection";

// ── Pasos del flujo ─────────────────────────────────────────────────────────
const PASOS = {
  SOLICITAR: "solicitar",   // Paso 1 — ingresar correo
  VERIFICAR: "verificar",   // Paso 2 — código de verificación
  NUEVA:     "nueva",       // Paso 3 — nueva contraseña
};

/**
 * @param {object}   props
 * @param {function} props.onIrLogin        — navega de vuelta al login
 * @param {function} props.onVolverInicio   — navega al home
 */
export default function OlvideContrasenaPage({ onIrLogin, onVolverInicio }) {
  // ── Estado del flujo ─────────────────────────────────────────────────────
  const [pasoActual, setPasoActual] = useState(PASOS.SOLICITAR);

  // ── Estado compartido entre pasos ────────────────────────────────────────
  // El correo y el código se necesitan en el Paso 3 para la petición final.
  const [correoRecuperacion, setCorreoRecuperacion] = useState("");
  const [codigoVerificado,   setCodigoVerificado]   = useState("");

  // ── Handlers de navegación entre pasos ───────────────────────────────────

  /**
   * Paso 1 completado: el backend envió el código al correo del usuario.
   * @param {string} correo — guardamos para los pasos siguientes
   */
  const handleCorreoEnviado = (correo) => {
    setCorreoRecuperacion(correo);
    setPasoActual(PASOS.VERIFICAR);
  };

  /**
   * Paso 2 completado: el código es correcto.
   * @param {string} codigo — guardamos para incluirlo en la petición del Paso 3
   */
  const handleCodigoValido = (codigo) => {
    setCodigoVerificado(codigo);
    setPasoActual(PASOS.NUEVA);
  };

  /**
   * Paso 3 completado: contraseña actualizada con éxito.
   * Redirige al login para que el usuario inicie sesión con su nueva contraseña.
   */
  const handleContrasenaActualizada = () => {
    onIrLogin();
  };

  // ── Render de la sección activa según el paso ─────────────────────────────
  const renderSeccion = () => {
    switch (pasoActual) {
      case PASOS.SOLICITAR:
        return (
          <RequestEmailSection
            onCorreoEnviado={handleCorreoEnviado}
            onIrLogin={onIrLogin}
          />
        );

      case PASOS.VERIFICAR:
        return (
          <VerifyCodeSection
            correo={correoRecuperacion}
            onCodigoValido={handleCodigoValido}
            onReenviarCodigo={() => setPasoActual(PASOS.SOLICITAR)}
            modo="recuperacion"
          />
        );

      case PASOS.NUEVA:
        return (
          <NewPasswordSection
            correo={correoRecuperacion}
            codigo={codigoVerificado}
            onContrasenaActualizada={handleContrasenaActualizada}
          />
        );

      default:
        return null;
    }
  };

  // ── Número de paso para el indicador visual (1 / 2 / 3) ─────────────────
  const numeroPaso = {
    [PASOS.SOLICITAR]: 1,
    [PASOS.VERIFICAR]: 2,
    [PASOS.NUEVA]:     3,
  }[pasoActual];

  return (
    <div className="bg-fondo min-h-screen text-blanco-suave flex flex-col">

      {/* Navbar idéntico al de Login y Registro — altura consistente */}
      <Navbar
        onInicio={onVolverInicio}
        modoAuth={true}
        labelAuth="← Volver"
      />

      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <AuthHeroBackground />

        <main className="relative z-10 w-full max-w-md">

          {/* ── Indicador de progreso (3 pasos) ── */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {[1, 2, 3].map((n) => (
              <React.Fragment key={n}>
                <div
                  className={[
                    "w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-300",
                    n < numeroPaso
                      ? "bg-crema text-negro-suave"
                      : n === numeroPaso
                      ? "bg-crema/20 border border-crema text-crema"
                      : "bg-panel-medio/40 border border-panel-medio text-texto-secundario/40",
                  ].join(" ")}
                >
                  {n < numeroPaso ? (
                    <svg className="w-3.5 h-3.5" viewBox="0 0 10 8" fill="none"
                      stroke="currentColor" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="1,4 4,7 9,1" />
                    </svg>
                  ) : n}
                </div>
                {n < 3 && (
                  <div className={[
                    "h-px w-8 transition-all duration-300",
                    n < numeroPaso ? "bg-crema/60" : "bg-panel-medio/40",
                  ].join(" ")} />
                )}
              </React.Fragment>
            ))}
          </div>

            
            
          {/* ── Sección activa del paso ── */}
          {renderSeccion()}

        </main>
      </div>
    </div>
  );
}