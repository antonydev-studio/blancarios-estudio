// src/pages/LoginPage.jsx
//
// CAMBIOS en esta versión:
//   - Usa useAuth().login() en lugar de simulación local
//   - login() devuelve { ok, rol, mensaje } para manejar admin vs cliente
//   - onLoginAdmin / onLoginCliente siguen funcionando igual desde App.jsx

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

import Navbar             from "../components/layout/Navbar";
import AuthHeroBackground from "../components/ui/AuthHeroBackground";
import LoginFormSection   from "../components/sections/LoginFormSection";
import VerifyCodeSection  from "../components/sections/VerifyCodeSection";

/**
 * @param {object}   props
 * @param {function} props.onVolverInicio
 * @param {function} props.onLoginAdmin
 * @param {function} props.onLoginCliente
 * @param {function} props.onIrARegistro
 * @param {function} props.onOlvideContrasena
 */
export default function LoginPage({
  onVolverInicio,
  onLoginAdmin,
  onLoginCliente,
  onIrARegistro,
  onOlvideContrasena,
}) {
  const { login } = useAuth();

  const [correo,     setCorreo]     = useState("");
  const [contrasena, setContrasena] = useState("");
  const [error,      setError]      = useState("");
  const [cargando,   setCargando]   = useState(false);
  const [correoNoVerificado,  setCorreoNoVerificado]  = useState(null);
  const [reenvioOk,           setReenvioOk]           = useState(false);
  const [mostrandoVerificacion, setMostrandoVerificacion] = useState(false);

  const manejarSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setCorreoNoVerificado(null);
    setReenvioOk(false);

    if (!correo || !contrasena) {
      setError("Por favor ingresa tu correo y contraseña.");
      return;
    }

    setCargando(true);
    try {
      const resultado = await login(correo, contrasena);

      if (!resultado.ok) {
        if (resultado.requiereVerificacion) {
          setCorreoNoVerificado(resultado.correo);
          setMostrandoVerificacion(true);
          setError("");
        } else {
          setError(resultado.mensaje ?? "Correo o contraseña incorrectos.");
        }
        return;
      }

      // Redirige según el rol
      if (resultado.rol === "admin") {
        onLoginAdmin();
      } else {
        onLoginCliente();
      }
    } catch (err) {
      console.error(err);
      setError("No se pudo conectar con el servidor. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const manejarVerificacionExitosa = async () => {
    const resultado = await login(correo, contrasena);
    if (resultado.ok) {
      resultado.rol === "admin" ? onLoginAdmin() : onLoginCliente();
    } else {
      setMostrandoVerificacion(false);
      setError(resultado.mensaje ?? "Verificación exitosa. Inicia sesión manualmente.");
    }
  };

  const manejarReenvioVerificacion = async () => {
    if (!correoNoVerificado) return;
    setReenvioOk(false);
    try {
      await fetch("/api/auth/reenviar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoNoVerificado }),
      });
      setReenvioOk(true);
    } catch (err) {
      console.error("Error reenviando código:", err);
    }
  };

  return (
    <div className="bg-fondo min-h-screen text-blanco-suave flex flex-col">

      <Navbar
        onInicio={onVolverInicio}
        modoAuth={true}
        labelAuth="← Volver"
      />

      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <AuthHeroBackground />
        <main className="relative z-10 w-full max-w-md">
          {mostrandoVerificacion ? (
            <VerifyCodeSection
              correo={correoNoVerificado}
              onCodigoValido={manejarVerificacionExitosa}
              onReenviarCodigo={manejarReenvioVerificacion}
            />
          ) : (
            <LoginFormSection
              correo={correo}
              contrasena={contrasena}
              error={error}
              cargando={cargando}
              onCorreoChange={setCorreo}
              onContrasenaChange={setContrasena}
              onSubmit={manejarSubmit}
              onIrARegistro={onIrARegistro}
              onOlvideContrasena={onOlvideContrasena}
            />
          )}
        </main>
      </div>
    </div>
  );
}