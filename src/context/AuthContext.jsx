// src/context/AuthContext.jsx
//
// CONTEXTO GLOBAL DE AUTENTICACIÓN + CITAS DEL CLIENTE
//
// SESSION_VERSION = 2 — formato plano: { _v, id, nombre, telefono, correo, rol }
// Incrementar si cambia la estructura del objeto usuario guardado.
// Para limpiar manualmente:
//   localStorage.removeItem("usuario_br"); location.reload();

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

const SESSION_VERSION = 3;
const STORAGE_KEY     = "usuario_br";

// ── Helpers de localStorage ───────────────────────────────────────────────────

function leerSesionGuardada() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const wrapper = JSON.parse(raw);
    if (!wrapper || wrapper._v !== SESSION_VERSION) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    const { _v, ...usuario } = wrapper;
    if (!usuario.id || !usuario.correo || !usuario.rol) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return usuario;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [usuario,        setUsuario]        = useState(() => leerSesionGuardada());
  const [citas,          setCitas]          = useState([]);
  const [citasCargando,  setCitasCargando]  = useState(false);
  const [citasError,     setCitasError]     = useState(null);

  // ── Logout — definido antes de cargarCitas para poder referenciarlo en sus deps ──
  const logout = useCallback(() => {
    setUsuario(null);
    setCitas([]);
    setCitasError(null);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem("token_br");
  }, []);

  // ── Carga de citas — se dispara cuando hay usuario logueado ──────────────
  const cargarCitas = useCallback(async (usuarioActivo) => {
    if (!usuarioActivo) {
      setCitas([]);
      return;
    }
    setCitasCargando(true);
    setCitasError(null);
    try {
      const res = await fetch("/api/appointments/mias", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token_br")}` },
      });
      if (res.status === 401) {
        logout();
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.mensaje || "Error al cargar citas");
      setCitas(data.appointments.map((a) => ({ ...a, id: a._id })));
    } catch (err) {
      console.error("Error cargando citas:", err);
      setCitasError("No pudimos cargar tus citas. Intenta de nuevo.");
    } finally {
      setCitasCargando(false);
    }
  }, [logout]);

  // Carga las citas la primera vez si ya había sesión guardada
  useEffect(() => {
    cargarCitas(usuario);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  // ── Login ────────────────────────────────────────────────────────────────
  const login = useCallback(async (correo, contrasena) => {
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, contrasena }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 403 && data.requiereVerificacion) {
          return { ok: false, requiereVerificacion: true, correo: data.correo, mensaje: data.mensaje };
        }
        return { ok: false, mensaje: data.mensaje };
      }

      const usuario = {
        id:               data.usuario._id,
        nombre:           data.usuario.nombre,
        telefono:         data.usuario.telefono,
        correo:           data.usuario.correo,
        rol:              data.usuario.rol,
        listaNegraActiva: data.usuario.listaNegraActiva ?? false,
      };

      localStorage.setItem("token_br", data.token);
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ _v: SESSION_VERSION, ...usuario }));
      setUsuario(usuario);
      await cargarCitas(usuario);
      return { ok: true, rol: usuario.rol };
    } catch {
      return { ok: false, mensaje: "No se pudo conectar con el servidor." };
    }
  }, [cargarCitas]);

  const getToken = () => localStorage.getItem("token_br");

  const listaNegraActiva = usuario?.listaNegraActiva ?? false;

  return (
    <AuthContext.Provider value={{
      usuario,
      login,
      logout,
      getToken,
      citas,
      citasCargando,
      citasError,
      recargarCitas: () => cargarCitas(usuario),
      listaNegraActiva,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
