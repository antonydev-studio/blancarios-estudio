// src/pages/admin/HomepageSection.jsx

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { createAdminApi } from "../../hooks/useAdminApi";
import AdminSectionHeader from "../../components/admin/AdminSectionHeader";
import InputField from "../../components/ui/InputField";
import Toast from "../../components/ui/Toast";
import { SERVICIOS, RAZONES } from "../../data/services";

const CLOUDINARY_CLOUD_NAME = "dqjzt4h45";
const CLOUDINARY_UPLOAD_PRESET = "gp7cknae";

const HERO_DEFAULT =
  "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1400&q=80";


function cargarScriptCloudinary() {
  return new Promise((resolve, reject) => {
    if (window.cloudinary) { resolve(); return; }
    const existing = document.getElementById("cloudinary-widget-script");
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.id = "cloudinary-widget-script";
    script.src = "https://widget.cloudinary.com/v2.0/global/all.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function abrirCloudinaryWidget(onSuccess) {
  try {
    await cargarScriptCloudinary();
  } catch {
    alert("No se pudo cargar el widget de subida de fotos. Verifica tu conexión.");
    return;
  }
  window.cloudinary.openUploadWidget(
    {
      cloudName: CLOUDINARY_CLOUD_NAME,
      uploadPreset: CLOUDINARY_UPLOAD_PRESET,
      sources: ["local", "camera"],
      multiple: false,
      maxImageFileSize: 5_000_000,
      language: "es",
      styles: {
        palette: {
          window: "#1a1a1a", windowBorder: "#2a2a2a",
          tabIcon: "#c9a96e", menuIcons: "#c9a96e",
          textDark: "#ffffff", textLight: "#ffffff",
          link: "#c9a96e", action: "#c9a96e",
          inactiveTabIcon: "#888", error: "#e74c3c",
          inProgress: "#c9a96e", complete: "#4CAF50", sourceBg: "#111",
        },
      },
    },
    (error, result) => {
      if (!error && result?.event === "success") onSuccess(result.info.secure_url);
    }
  );
}

// ── Botón de subida — preview debajo del botón ───────────────────────────────
function FotoUploadField({ label, url, onSubida }) {
  const [cargando, setCargando] = useState(false);

  const handleClick = async () => {
    setCargando(true);
    await abrirCloudinaryWidget((nuevaUrl) => onSubida(nuevaUrl));
    setCargando(false);
  };

  return (
    <div className="space-y-2">
      {label && <p className="label">{label}</p>}
      <button
        type="button"
        className="btn-primary w-full flex items-center justify-center gap-2 text-sm"
        onClick={handleClick}
        disabled={cargando}
      >
        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
        </svg>
        {cargando ? "Abriendo…" : url ? "Cambiar foto" : "Subir foto"}
      </button>
      {url && (
        <div className="overflow-hidden rounded-xl h-36 bg-panel-oscuro border border-panel-medio">
          <img src={url} alt="Vista previa" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

// ── Sub-sección colapsable ────────────────────────────────────────────────────
function Subseccion({ titulo, children }) {
  const [abierta, setAbierta] = useState(true);
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left"
        onClick={() => setAbierta((v) => !v)}
      >
        <span className="font-display font-semibold text-blanco-suave">{titulo}</span>
        <svg
          className={["w-4 h-4 text-texto-secundario transition-transform duration-200 shrink-0", abierta ? "rotate-180" : ""].join(" ")}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {abierta && (
        <div className="px-5 pb-5 border-t border-panel-medio/60 pt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ── Hero ─────────────────────────────────────────────────────────────────────
function HeroEditor({ config, api, setConfig, onToast }) {
  const [url, setUrl] = useState(config.heroImagen || HERO_DEFAULT);

  // Sincroniza cuando config llega tarde
  const cargado = useRef(false);
  useEffect(() => {
    if (!cargado.current && config.heroImagen) {
      setUrl(config.heroImagen);
      cargado.current = true;
    }
  }, [config.heroImagen]);

  const handleSubida = async (nuevaUrl) => {
    setUrl(nuevaUrl);
    try {
      const { config: cfg } = await api.updateConfig({ heroImagen: nuevaUrl });
      setConfig((prev) => ({ ...prev, heroImagen: cfg.heroImagen ?? nuevaUrl }));
    } catch {
      onToast("Error al guardar la foto del Hero.");
    }
  };

  return (
    <Subseccion titulo="Foto de fondo del Hero">
      <FotoUploadField
        label="Foto principal (banner superior)"
        url={url}
        onSubida={handleSubida}
      />
      <p className="text-[11px] text-texto-secundario">
        Recomendado: mínimo 1400 × 500 px, formato JPG o WebP.
      </p>
    </Subseccion>
  );
}

// ── Servicios Destacados ─────────────────────────────────────────────────────
function ServiciosEditor({ config, api, setConfig, onToast }) {
  const [lista, setLista] = useState(
    config.serviciosHome?.length ? config.serviciosHome : SERVICIOS
  );

  // Precarga: sincroniza cuando config.serviciosHome llega del backend
  const cargado = useRef(false);
  useEffect(() => {
    if (!cargado.current && config.serviciosHome?.length) {
      setLista(config.serviciosHome);
      cargado.current = true;
    }
  }, [config.serviciosHome]);

  // Auto-guardado con debounce para cambios de texto
  const listaRef = useRef(lista);
  listaRef.current = lista;
  const timerRef = useRef(null);

  const guardarDebounced = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const { config: cfg } = await api.updateConfig({ serviciosHome: listaRef.current });
        setConfig((prev) => ({ ...prev, serviciosHome: cfg.serviciosHome ?? listaRef.current }));
      } catch {
        onToast("Error al guardar. Intenta de nuevo.");
      }
    }, 800);
  }, [api, setConfig, onToast]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const actualizar = useCallback((idx, campo, valor) => {
    setLista((prev) => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
    guardarDebounced();
  }, [guardarDebounced]);

  // Imagen: guarda inmediatamente (acción puntual, no texto continuo)
  const actualizarImagen = useCallback(async (idx, url) => {
    const nuevaLista = lista.map((s, i) => i === idx ? { ...s, imagen: url } : s);
    setLista(nuevaLista);
    try {
      const { config: cfg } = await api.updateConfig({ serviciosHome: nuevaLista });
      setConfig((prev) => ({ ...prev, serviciosHome: cfg.serviciosHome ?? nuevaLista }));
    } catch {
      onToast("Error al guardar la imagen.");
    }
  }, [lista, api, setConfig, onToast]);

  return (
    <Subseccion titulo="Servicios Destacados">
      <div className="space-y-6">
        {lista.map((srv, idx) => (
          <div key={srv.id ?? idx} className="space-y-3 border-b border-panel-medio/40 pb-6 last:border-0 last:pb-0">
            <p className="text-xs text-crema font-semibold uppercase tracking-wider">
              Servicio {idx + 1}
            </p>
            <InputField
              id={`srv-titulo-${idx}`}
              label="Título"
              value={srv.titulo ?? ""}
              onChange={(e) => actualizar(idx, "titulo", e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="label" htmlFor={`srv-desc-${idx}`}>Descripción</label>
              <textarea
                id={`srv-desc-${idx}`}
                className="input-base min-h-[72px] w-full"
                value={srv.descripcion ?? ""}
                onChange={(e) => actualizar(idx, "descripcion", e.target.value)}
              />
            </div>
            <FotoUploadField
              label="Foto del servicio"
              url={srv.imagen ?? ""}
              onSubida={(url) => actualizarImagen(idx, url)}
            />
          </div>
        ))}
      </div>
    </Subseccion>
  );
}

// ── Por qué elegirnos ─────────────────────────────────────────────────────────
function RazonesEditor({ config, api, setConfig, onToast }) {
  const [lista, setLista] = useState(
    config.razonesHome?.length ? config.razonesHome : RAZONES
  );

  // Precarga: sincroniza cuando config.razonesHome llega del backend (máx. 3)
  const cargado = useRef(false);
  useEffect(() => {
    if (!cargado.current && config.razonesHome?.length) {
      setLista(config.razonesHome.slice(0, 3));
      cargado.current = true;
    }
  }, [config.razonesHome]);

  // Auto-guardado con debounce
  const listaRef = useRef(lista);
  listaRef.current = lista;
  const timerRef = useRef(null);

  const guardarDebounced = useCallback(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      try {
        const { config: cfg } = await api.updateConfig({ razonesHome: listaRef.current });
        setConfig((prev) => ({ ...prev, razonesHome: cfg.razonesHome ?? listaRef.current }));
      } catch {
        onToast("Error al guardar. Intenta de nuevo.");
      }
    }, 800);
  }, [api, setConfig, onToast]);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  const actualizar = useCallback((idx, campo, valor) => {
    setLista((prev) => {
      const copia = [...prev];
      copia[idx] = { ...copia[idx], [campo]: valor };
      return copia;
    });
    guardarDebounced();
  }, [guardarDebounced]);

  return (
    <Subseccion titulo="¿Por qué elegirnos?">
      <div className="space-y-5">
        {lista.map((razon, idx) => (
          <div key={razon.id ?? idx} className="space-y-3 border-b border-panel-medio/40 pb-5 last:border-0 last:pb-0">
            <p className="text-xs text-crema font-semibold uppercase tracking-wider">
              Razón {idx + 1}
            </p>
            <InputField
              id={`razon-titulo-${idx}`}
              label="Título"
              value={razon.titulo ?? ""}
              onChange={(e) => actualizar(idx, "titulo", e.target.value)}
            />
            <div className="space-y-1.5">
              <label className="label" htmlFor={`razon-texto-${idx}`}>Descripción</label>
              <textarea
                id={`razon-texto-${idx}`}
                className="input-base min-h-[72px] w-full"
                value={razon.texto ?? ""}
                onChange={(e) => actualizar(idx, "texto", e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </Subseccion>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function HomepageSection({ config, setConfig }) {
  const { getToken } = useAuth();
  const api = React.useMemo(() => createAdminApi(getToken), [getToken]);
  const [toastMsg, setToastMsg] = useState("");

  const onToast = useCallback((msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  }, []);

  return (
    <div>
      <AdminSectionHeader
        label="Contenido"
        title="Página Principal"
        subtitle="Los cambios se guardan automáticamente."
      />
      <div className="space-y-4 mt-2">
        <HeroEditor      config={config} api={api} setConfig={setConfig} onToast={onToast} />
        <ServiciosEditor config={config} api={api} setConfig={setConfig} onToast={onToast} />
        <RazonesEditor   config={config} api={api} setConfig={setConfig} onToast={onToast} />
      </div>
      <Toast mensaje={toastMsg} onCerrar={() => setToastMsg("")} />
    </div>
  );
}
