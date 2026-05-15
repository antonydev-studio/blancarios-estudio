// src/pages/HomePage.jsx
//
// CAMBIOS en esta versión:
//   - Recibe onAdminClick y lo pasa al Navbar como onAdmin
//   - El Navbar lo usa cuando usuario.rol === "admin" para mostrar "Panel de control"

import React, { useState, useEffect } from "react";

import Navbar  from "../components/layout/Navbar";
import Footer  from "../components/layout/Footer";

import HomeHero          from "../components/sections/HomeHero";
import ServicesSection   from "../components/sections/ServicesSection";
import ReasonsSection    from "../components/sections/ReasonsSection";
import TestimonialSection from "../components/sections/TestimonialSection";

import { useHomepageContent } from "../hooks/useHomepageContent";

const scrollToSection = (id) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const SECCIONES_SPY = [
  { id: "inicio",    nav: "inicio"    },
  { id: "servicios", nav: "servicios" },
  { id: "por-que",   nav: "resenas"   },
  { id: "contacto",  nav: "contacto"  },
];

/**
 * @param {object}   props
 * @param {function} props.onAgendarClick
 * @param {function} props.onLoginClick
 * @param {function} props.onHistorialClick
 * @param {function} props.onAdminClick     — lleva al admin cuando rol === "admin"
 * @param {function} props.onLogout
 */
export default function HomePage({
  onAgendarClick,
  onLoginClick,
  onHistorialClick,
  onAdminClick,
  onLogout,
}) {
  const { cargando, heroImg, servicios, razones } = useHomepageContent();
  const [seccionActiva, setSeccionActiva] = useState("inicio");

  useEffect(() => {
    const offset = 120;
    const onScroll = () => {
      const scrollHeight = Math.max(
        document.documentElement.scrollHeight,
        document.body.scrollHeight || 0
      );
      const nearBottom = window.scrollY + window.innerHeight >= scrollHeight - 60;

      if (nearBottom) { setSeccionActiva("contacto"); return; }

      let actual = "inicio";
      for (const { id, nav } of SECCIONES_SPY) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= offset) actual = nav;
      }
      setSeccionActiva(actual);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-fondo text-blanco-suave min-h-screen">

      <Navbar
        onInicio={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        onServicios={() => scrollToSection("servicios")}
        onResenas={() => scrollToSection("por-que")}
        onContacto={() => scrollToSection("contacto")}
        onAgendar={onAgendarClick}
        onLogin={onLoginClick}
        onHistorial={onHistorialClick}
        onAdmin={onAdminClick}
        onLogout={onLogout}
        paginaActiva={seccionActiva}
      />

      {cargando ? (
        <>
          <div className="section-wrap pt-8 pb-10">
            <div className="rounded-2xl bg-panel-oscuro h-[260px] md:h-[310px] animate-pulse" />
          </div>
          <div className="section-wrap pb-12">
            <div className="h-6 w-40 rounded-lg bg-panel-oscuro animate-pulse mb-3" />
            <div className="grid md:grid-cols-3 gap-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="card h-56 animate-pulse" />
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          <HomeHero        onAgendar={onAgendarClick} heroImg={heroImg} />
          <ServicesSection servicios={servicios} />
        </>
      )}
      <ReasonsSection   razones={razones} />
      <TestimonialSection />

      <Footer />
    </div>
  );
}