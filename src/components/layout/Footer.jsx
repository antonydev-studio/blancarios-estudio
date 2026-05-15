// src/components/layout/Footer.jsx
//
// LAYOUT — compartido con todas las páginas, igual que Navbar.
// Sin props — contenido estático de Blanca Ríos.

import React, { useState, useEffect } from "react";
import { getHorarioDia } from "../../utils/slots";

// ─── Helpers horario dinámico ──────────────────────────────────────────────

const NOMBRES_LARGO = ["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
const ORDEN_DIAS = [1, 2, 3, 4, 5, 6, 0]; // Lun → Sáb → Dom

function formatHora(h) {
  const period = h < 12 ? "am" : "pm";
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${h12}:00 ${period}`;
}

function agruparHorario(config) {
  const grupos = [];
  let actual = null;
  for (const dia of ORDEN_DIAS) {
    const h = getHorarioDia(config, dia);
    const key = h ? `${h.inicio}-${h.fin}` : "cerrado";
    if (actual && actual.key === key) {
      actual.dias.push(dia);
    } else {
      if (actual) grupos.push(actual);
      actual = { key, dias: [dia], horario: h };
    }
  }
  if (actual) grupos.push(actual);
  return grupos;
}

function labelGrupo(dias) {
  if (dias.length === 1) return NOMBRES_LARGO[dias[0]];
  if (dias.length === 2) return `${NOMBRES_LARGO[dias[0]]} y ${NOMBRES_LARGO[dias[1]]}`;
  return `${NOMBRES_LARGO[dias[0]]} a ${NOMBRES_LARGO[dias[dias.length - 1]]}`;
}

export default function Footer() {
  const anio = new Date().getFullYear(); // nunca hardcodear el año
  const [horarioConfig, setHorarioConfig] = useState(null); // null = usar fallback

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((data) => { if (data?.config) setHorarioConfig(data.config); })
      .catch(() => {}); // silencioso — mantiene null → fallback hardcodeado
  }, []);

  return (
    <footer id="contacto" className="border-t border-panel-medio/70 pt-10 pb-6 mt-10 scroll-mt-header">
      <div className="section-wrap grid md:grid-cols-3 gap-8 mb-8 text-sm items-start">

        {/* Identidad */}
        <div>
          <div className="mb-3">
            <span className="font-display italic text-base text-blanco-suave">
              Blanca Ríos
            </span>
            <span className="brand-label block">
              Estudio
            </span>
          </div>
          <p className="text-texto-secundario text-xs leading-relaxed">
            Mas que un servicio, una experiencia
          </p>
        </div>

        {/* Contacto */}
        <div>
          <h4 className="footer-heading mb-3">
            Contacto
          </h4>
          <ul className="space-y-1 text-xs text-texto-secundario">
            <li>Ixtapa-Zihuatanejo, Guerrero</li>
          </ul>
          <div className="flex items-center gap-2 mt-4">
            {/* Compartir */}
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); navigator.share?.({ title: "Blanca Ríos Estudio", url: window.location.href }); }}
              className="group/icon w-11 h-11 rounded-full border border-crema/25 hover:border-crema/60 flex items-center justify-center transition-colors"
              aria-label="Compartir"
            >
              <svg className="w-[18px] h-[18px] fill-current text-texto-secundario group-hover/icon:text-crema transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
              </svg>
            </a>

            {/* Ubicación */}
            <a
              href="https://maps.app.goo.gl/EX9h29GqitEeqf8F9?g_st=aw"
              target="_blank"
              rel="noopener noreferrer"
              className="group/icon w-11 h-11 rounded-full border border-crema/25 hover:border-crema/60 flex items-center justify-center transition-colors"
              aria-label="Ubicación en Google Maps"
            >
              <svg className="w-[18px] h-[18px] fill-current text-texto-secundario group-hover/icon:text-crema transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com/share/16sAKYPANJ/"
              target="_blank"
              rel="noopener noreferrer"
              className="group/icon w-11 h-11 rounded-full border border-crema/25 hover:border-crema/60 flex items-center justify-center transition-colors"
              aria-label="Facebook"
            >
              <svg className="w-[18px] h-[18px] fill-current text-texto-secundario group-hover/icon:text-crema transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://www.instagram.com/blancariru?igsh=MW1tYXlkdjE1enhueg=="
              target="_blank"
              rel="noopener noreferrer"
              className="group/icon w-11 h-11 rounded-full border border-crema/25 hover:border-crema/60 flex items-center justify-center transition-colors"
              aria-label="Instagram"
            >
              <svg className="w-[18px] h-[18px] fill-current text-texto-secundario group-hover/icon:text-crema transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.468c2.456 0 2.784-.011 3.807-.058.975-.045 1.504-.207 1.857-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.468c0-2.456-.011-2.784-.058-3.807-.045-.975-.207-1.504-.344-1.857a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"/>
              </svg>
            </a>

            {/* TikTok */}
            <a
              href="https://www.tiktok.com/@blancariru?_r=1&_t=ZS-95gcymNhGqb"
              target="_blank"
              rel="noopener noreferrer"
              className="group/icon w-11 h-11 rounded-full border border-crema/25 hover:border-crema/60 flex items-center justify-center transition-colors"
              aria-label="TikTok"
            >
              <svg className="w-[18px] h-[18px] fill-current text-texto-secundario group-hover/icon:text-crema transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z"/>
              </svg>
            </a>

            {/* Google */}
            <a
              href="https://www.google.com/search?q=Blanca+Rios+Estudio+Ixtapa+Zihuatanejo"
              target="_blank"
              rel="noopener noreferrer"
              className="group/icon w-11 h-11 rounded-full border border-crema/25 hover:border-crema/60 flex items-center justify-center transition-colors"
              aria-label="Buscar en Google"
            >
              <svg className="w-[18px] h-[18px] fill-current text-texto-secundario group-hover/icon:text-crema transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
              </svg>
            </a>

            {/* WhatsApp */}
            <a
              href="https://wa.me/527551313518?text=Hola,%20me%20contacto%20desde%20la%20página%20oficial%20y%20tengo%20una%20duda."
              target="_blank"
              rel="noopener noreferrer"
              className="group/icon w-11 h-11 rounded-full border border-crema/25 hover:border-crema/60 flex items-center justify-center transition-colors"
              aria-label="WhatsApp"
            >
              <svg className="w-[18px] h-[18px] fill-current text-texto-secundario group-hover/icon:text-crema transition-colors" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Horario */}
        <div>
          <h4 className="footer-heading mb-3">
            Horario
          </h4>
          <ul className="space-y-1 text-xs text-texto-secundario">
            {horarioConfig
              ? agruparHorario(horarioConfig).map((g) =>
                  g.horario ? (
                    <li key={g.key}>
                      {labelGrupo(g.dias)} — {formatHora(g.horario.inicio)} a {formatHora(g.horario.fin)}
                    </li>
                  ) : (
                    <li key={g.key} className="text-estado-cancelada/70">
                      {labelGrupo(g.dias)} — Cerrado
                    </li>
                  )
                )
              : (
                <>
                  <li>Lunes a Viernes — 12:00 pm a 9:00 pm</li>
                  <li>Sábado — 12:00 pm a 9:00 pm</li>
                  <li className="text-estado-cancelada/70">Domingo — Cerrado</li>
                </>
              )}
          </ul>
        </div>
      </div>

      <div className="section-wrap border-t border-panel-medio/50 pt-4 flex flex-col gap-2 text-sm text-texto-secundario md:flex-row md:items-center md:justify-between md:gap-6">
        <p className="text-caption opacity-80 text-center md:text-left">
          © {anio} Blanca Ríos Estudio. Todos los derechos reservados.
        </p>
        <p className="text-caption opacity-80 text-center md:text-right">
          Diseñado y desarrollado por{" "}
          <a
            href="https://www.antonydev.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-blanco-suave underline-offset-2 hover:text-crema hover:underline"
          >
            AntonyDev
          </a>
          .
        </p>
      </div>
    </footer>
  );
}