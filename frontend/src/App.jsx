// src/App.jsx
//
// CAMBIOS en esta versión:
//   - HomePage recibe onAdminClick → lo pasa al Navbar como onAdmin
//   - Cuando usuario.rol === "admin" el navbar muestra "Panel de control"
//     en lugar de "Cerrar sesión" (que vive en el sidebar del AdminPage)

import React, { useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import HomePage              from "./pages/HomePage";
import ScheduleAppointmentPage from "./pages/ScheduleAppointmentPage";
import RegistrationPage        from "./pages/RegistrationPage";
import LoginPage               from "./pages/LoginPage";
import ForgotPasswordPage      from "./pages/ForgotPasswordPage";
import AppointmentHistoryPage  from "./pages/AppointmentHistoryPage";
import AdminPage             from "./pages/admin/AdminPage";
import NotFoundPage          from "./pages/NotFoundPage";
import { AdminDataProvider } from "./hooks/useAdminData";

// ─── Páginas disponibles ──────────────────────────────────────────────────
const PAGINAS = {
  HOME:              "home",
  LOGIN:             "login",
  REGISTRO:          "registro",
  AGENDAR:           "agendar",
  OLVIDE_CONTRASENA: "olvideContrasena",
  HISTORIAL:         "historial",
  ADMIN:             "admin",
};

// ─── Router interno ───────────────────────────────────────────────────────
function Router() {
  const [pagina, setPagina] = useState(PAGINAS.HOME);
  const [mensajeExito, setMensajeExito] = useState("");
  const [citaAReagendar, setCitaAReagendar] = useState(null);
  const { usuario, logout } = useAuth();

  const irA = (destino) => setPagina(destino);

  const manejarLogout = () => {
    logout();
    irA(PAGINAS.HOME);
  };

const bannerExito = mensajeExito ? (
  <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[min(92vw,520px)]">
    <div className="card border-crema/40 bg-panel-oscuro px-6 py-5 flex items-center justify-between gap-3 shadow-2xl backdrop-blur-md">
      
      {/* Icono + mensaje */}
      <div className="flex items-center gap-3">
        <svg
          className="w-5 h-5 text-crema shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>

        <p className="text-base text-crema font-semibold">
          {mensajeExito}
        </p>
      </div>

      {/* Botón cerrar */}
      <button
        type="button"
        onClick={() => setMensajeExito("")}
        className="text-texto-secundario hover:text-blanco-suave text-lg leading-none shrink-0"
      >
        ×
      </button>

    </div>
  </div>
) : null;

  switch (pagina) {

    case PAGINAS.HOME:
      return (
        <>
          {bannerExito}
          <HomePage
            onAgendarClick={()   => { setCitaAReagendar(null); irA(PAGINAS.AGENDAR); }}
            onLoginClick={()     => irA(PAGINAS.LOGIN)}
            onHistorialClick={() => irA(PAGINAS.HISTORIAL)}
            onAdminClick={()     => irA(PAGINAS.ADMIN)}
            onLogout={manejarLogout}
          />
        </>
      );

    case PAGINAS.AGENDAR: {
      const volverDeAgendar = () => {
        setCitaAReagendar(null);
        if (usuario && usuario.rol !== "admin") irA(PAGINAS.HISTORIAL);
        else irA(PAGINAS.HOME);
      };
      return (
        <ScheduleAppointmentPage
          onVolverInicio={volverDeAgendar}
          onLoginClick={()     => irA(PAGINAS.LOGIN)}
          citaAReagendar={citaAReagendar}
          onCitaConfirmada={() => {
            const eraReagendo = !!citaAReagendar;
            setCitaAReagendar(null);
            setMensajeExito(eraReagendo
              ? "¡Tu cita ha sido reagendada correctamente!"
              : "¡Tu cita ha sido agendada correctamente!"
            );
            irA(eraReagendo ? PAGINAS.HISTORIAL : PAGINAS.HOME);
            setTimeout(() => setMensajeExito(""), 5000);
          }}
        />
      );
    }

    case PAGINAS.LOGIN:
      return (
        <LoginPage
          onVolverInicio={()     => irA(PAGINAS.HOME)}
          onLoginAdmin={()       => irA(PAGINAS.ADMIN)}
          onLoginCliente={()     => irA(PAGINAS.HISTORIAL)}
          onIrARegistro={()      => irA(PAGINAS.REGISTRO)}
          onOlvideContrasena={() => irA(PAGINAS.OLVIDE_CONTRASENA)}
        />
      );

    case PAGINAS.REGISTRO:
      return (
        <RegistrationPage
          onVolverInicio={() => irA(PAGINAS.HOME)}
          onIrLogin={()      => irA(PAGINAS.LOGIN)}
        />
      );

    case PAGINAS.OLVIDE_CONTRASENA:
      return (
        <ForgotPasswordPage
          onIrLogin={()      => irA(PAGINAS.LOGIN)}
          onVolverInicio={() => irA(PAGINAS.HOME)}
        />
      );

    case PAGINAS.HISTORIAL:
      if (!usuario) { irA(PAGINAS.LOGIN); return null; }
      return (
        <>
          {bannerExito}
          <AppointmentHistoryPage
            onVolverInicio={() => irA(PAGINAS.HOME)}
            onAgendar={()      => { setCitaAReagendar(null); irA(PAGINAS.AGENDAR); }}
            onLogout={manejarLogout}
            onReagendar={(cita) => { setCitaAReagendar(cita); irA(PAGINAS.AGENDAR); }}
          />
        </>
      );

    case PAGINAS.ADMIN:
      if (!usuario || usuario.rol !== "admin") { irA(PAGINAS.LOGIN); return null; }
      return (
        <>
          {bannerExito}
          <AdminPage
            onLogout={manejarLogout}
            onVolverHome={() => irA(PAGINAS.HOME)}
            onCitaCreada={() => {
              setMensajeExito("¡Tu cita ha sido agendada correctamente!");
              setTimeout(() => setMensajeExito(""), 5000);
            }}
          />
        </>
      );

    default:
      return (
        <NotFoundPage onVolverInicio={() => irA(PAGINAS.HOME)} />
      );
  }
}

// ─── Raíz ─────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <AdminDataProvider>
        <Router />
      </AdminDataProvider>
    </AuthProvider>
  );
}// trigger vercel
