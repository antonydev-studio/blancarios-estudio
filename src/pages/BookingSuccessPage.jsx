import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

// Hardcoded — same as Footer. Update here if phone number changes.
const WHATSAPP_URL = "https://wa.me/527551313518?text=Hola,%20me%20contacto%20desde%20la%20página%20oficial%20y%20tengo%20una%20duda.";

function formatearFecha(fechaStr) {
  if (!fechaStr) return "";
  const [year, month, day] = fechaStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function BookingSuccessPage({
  citaData,
  onVerMisCitas,
  onVolverInicio,
  onCrearCuenta,
}) {
  const { usuario } = useAuth();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const servicios = Array.isArray(citaData?.servicios)
    ? citaData.servicios.join(", ")
    : citaData?.servicios ?? "";

  const esReagendado = citaData?.eraReagendado;

  return (
    <div className="bg-fondo text-blanco-suave min-h-screen flex flex-col">
      <Navbar onInicio={onVolverInicio} modoAgendar={true} />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div
          className="max-w-md w-full space-y-8"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.45s ease, transform 0.45s ease",
          }}
        >
          {/* Checkmark icon */}
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(58,125,68,0.12)",
                border: "1.5px solid rgba(58,125,68,0.35)",
              }}
            >
              <svg
                style={{ color: "#3a7d44" }}
                className="w-10 h-10"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Headline */}
          <div className="text-center space-y-2">
            <h1 className="font-display text-3xl md:text-4xl font-bold text-blanco-suave">
              {esReagendado ? "Cita reagendada" : "Tu cita fue confirmada"}
            </h1>
            {citaData?.clienteCorreo ? (
              <p className="text-sm text-texto-secundario leading-relaxed">
                Enviamos la confirmación a:{" "}
                <span className="text-crema font-medium break-all">
                  {citaData.clienteCorreo}
                </span>
              </p>
            ) : (
              <p className="text-sm text-texto-secundario">
                Tu cita ha sido registrada exitosamente.
              </p>
            )}
          </div>

          {/* Details card */}
          {citaData && (
            <div className="card p-5 space-y-3">
              <p className="text-[11px] text-texto-secundario uppercase tracking-widest font-medium">
                Detalles de tu cita
              </p>
              <div className="space-y-2.5 text-sm">
                {servicios && (
                  <div className="flex justify-between gap-4">
                    <span className="text-texto-secundario shrink-0">Servicio</span>
                    <span className="text-blanco-suave font-medium text-right">{servicios}</span>
                  </div>
                )}
                {citaData.fecha && (
                  <div className="flex justify-between gap-4">
                    <span className="text-texto-secundario shrink-0">Fecha</span>
                    <span className="text-crema font-semibold text-right capitalize">
                      {formatearFecha(citaData.fecha)}
                    </span>
                  </div>
                )}
                {citaData.hora && (
                  <div className="flex justify-between gap-4">
                    <span className="text-texto-secundario shrink-0">Hora</span>
                    <span className="text-crema font-semibold">{citaData.hora}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* CTAs */}
          {usuario ? (
            <div className="space-y-3">
              <button type="button" onClick={onVerMisCitas} className="btn-primary w-full">
                Ver mis citas
              </button>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full block text-center"
                style={{ textDecoration: "none" }}
              >
                Contactar por WhatsApp
              </a>
              <button type="button" onClick={onVolverInicio} className="btn-ghost w-full">
                Volver al inicio
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Soft account recommendation */}
              <div className="card p-5 space-y-3" style={{ borderColor: "rgba(201,169,110,0.12)" }}>
                <p className="text-[11px] text-texto-secundario uppercase tracking-widest font-medium">
                  Gestiona tus citas fácilmente
                </p>
                <p className="text-sm text-texto-secundario leading-relaxed">
                  Con una cuenta puedes consultar tu historial, reagendar y cancelar — sin volver a ingresar tus datos.
                </p>
                <button type="button" onClick={onCrearCuenta} className="btn-primary w-full">
                  Crear cuenta
                </button>
              </div>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-whatsapp w-full block text-center"
                style={{ textDecoration: "none" }}
              >
                Contactar por WhatsApp
              </a>
              <button type="button" onClick={onVolverInicio} className="btn-ghost w-full">
                Volver al inicio
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
