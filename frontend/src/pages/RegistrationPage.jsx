// src/pages/RegistroPage.jsx

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { CONTRASENA_REGEX, CONTRASENA_MENSAJE } from "../utils/passwordUtils";

import Navbar              from "../components/layout/Navbar";
import AuthHeroBackground  from "../components/ui/AuthHeroBackground";
import RegistrationFormSection from "../components/sections/RegistrationFormSection";
import VerifyCodeSection   from "../components/sections/VerifyCodeSection";

// ─── Validación client-side ───────────────────────────────────────────────
function validarFormulario({ nombre, telefono, correo, contrasena, confirmar }) {
  const errores = {};

  if (!nombre.trim())
    errores.nombre = "El nombre es obligatorio.";

  const telefonoLimpio = telefono.replace(/\D/g, "");
  if (!telefonoLimpio)
    errores.telefono = "El teléfono es obligatorio.";
  else if (telefonoLimpio.length !== 10)
    errores.telefono = "El teléfono debe tener exactamente 10 dígitos.";

  if (!correo.trim())
    errores.correo = "El correo es obligatorio.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo))
    errores.correo = "Ingresa un correo válido.";

  if (!contrasena)
    errores.contrasena = "La contraseña es obligatoria.";
  else if (!CONTRASENA_REGEX.test(contrasena))
    errores.contrasena = CONTRASENA_MENSAJE;

  if (!confirmar)
    errores.confirmar = "Confirma tu contraseña.";
  else if (confirmar !== contrasena)
    errores.confirmar = "Las contraseñas no coinciden.";

  return errores;
}

// ─────────────────────────────────────────────────────────────────────────────

export default function RegistroPage({ onVolverInicio, onIrLogin }) {
  const { login } = useAuth();

  const [nombre,     setNombre]     = useState("");
  const [telefono,   setTelefono]   = useState("");
  const [correo,     setCorreo]     = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmar,  setConfirmar]  = useState("");
  const [errores,    setErrores]    = useState({});
  const [cargando,   setCargando]   = useState(false);

  const [esperandoCodigo,   setEsperandoCodigo]   = useState(false);
  const [correoRegistrado,  setCorreoRegistrado]  = useState("");

  const manejarSubmit = async (e) => {
    e.preventDefault();
    const erroresNuevos = validarFormulario({ nombre, telefono, correo, contrasena, confirmar });
    if (Object.keys(erroresNuevos).length > 0) {
      setErrores(erroresNuevos);
      return;
    }
    setErrores({});
    setCargando(true);
    try {
      const res = await fetch("/api/auth/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, telefono, correo, contrasena }),
      });
      const data = await res.json();
      if (!res.ok) { setErrores({ correo: data.mensaje }); return; }
      setCorreoRegistrado(correo);
      setEsperandoCodigo(true);
    } catch (err) {
      console.error(err);
      setErrores({ correo: "No se pudo conectar con el servidor." });
    } finally {
      setCargando(false);
    }
  };

  // Llamado por VerifyCodeSection tras verificación exitosa en el backend
  const manejarVerificacion = async () => {
    try {
      const resultado = await login(correoRegistrado, contrasena);
      if (resultado.ok) {
        onIrLogin();
      } else {
        // Si el login falla por alguna razón inesperada, enviar a login manual
        onIrLogin();
      }
    } catch (err) {
      console.error(err);
      onIrLogin();
    }
  };

  const manejarReenvio = async () => {
    try {
      await fetch("/api/auth/reenviar-codigo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: correoRegistrado }),
      });
    } catch (err) {
      console.error("Error reenviando código:", err);
    }
  };

  return (
    <div className="bg-fondo text-blanco-suave min-h-screen flex flex-col">

      {/* modoAuth + labelAuth: mismo esqueleto que modoAgendar → altura idéntica */}
      <Navbar
        onInicio={onIrLogin}
        modoAuth={true}
        labelAuth="Iniciar Sesión"
      />

      <div className="relative flex-1 flex items-center justify-center px-4 py-12">
        <AuthHeroBackground />
        <main className="relative z-10 w-full max-w-md">
          {esperandoCodigo ? (
            <VerifyCodeSection
              correo={correoRegistrado}
              onCodigoValido={manejarVerificacion}
              onReenviarCodigo={manejarReenvio}
            />
          ) : (
            <RegistrationFormSection
              nombre={nombre}
              telefono={telefono}
              correo={correo}
              contrasena={contrasena}
              confirmar={confirmar}
              errores={errores}
              cargando={cargando}
              onNombreChange={setNombre}
              onTelefonoChange={setTelefono}
              onCorreoChange={setCorreo}
              onContrasenaChange={setContrasena}
              onConfirmarChange={setConfirmar}
              onSubmit={manejarSubmit}
              onIrLogin={onIrLogin}
            />
          )}
        </main>
      </div>
    </div>
  );
}
