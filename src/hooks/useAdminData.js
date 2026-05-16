// src/hooks/useAdminData.js
// Estado global del admin — todos los datos cargados desde el backend.

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../context/AuthContext";
import { createAdminApi } from "./useAdminApi";

function normalizarTelefonoWa(tel) {
  const d = String(tel).replace(/\D/g, "");
  return d.startsWith("52") ? d : `52${d}`;
}

const AdminDataContext = createContext(null);

export function AdminDataProvider({ children }) {
  const { usuario, getToken, logout } = useAuth();
  const api = useMemo(() => createAdminApi(getToken, logout), [getToken, logout]);

  const [cargando,       setCargando]       = useState(true);
  const [errorCarga,     setErrorCarga]     = useState(null);
  const [citas,          setCitas]          = useState([]);
  const [servicios,      setServicios]      = useState([]);
  const [clientes,       setClientes]       = useState([]);
  const [diasBloqueados, setDiasBloqueados] = useState([]);
  const [config,         setConfigState]    = useState({});
  const [movimientos,    setMovimientos]    = useState([]);

  const setConfig = useCallback((updater) => {
    setConfigState((prev) =>
      typeof updater === "function" ? updater(prev) : { ...prev, ...updater }
    );
  }, []);

  const cargarTodo = useCallback(async () => {
    setCargando(true);
    try {
      const [apptData, svcData, cfgData, clientData, movData] = await Promise.all([
        api.fetchAppointments(),
        api.fetchServices(),
        api.fetchConfig(),
        api.fetchClients(),
        api.fetchMovements("mes"),
      ]);

      setCitas(
        (apptData.appointments ?? []).map((a) => ({ ...a, id: a._id }))
      );
      setServicios(
        (svcData.services ?? []).map((s) => ({ ...s, id: s._id, nombre: s.titulo }))
      );
      setClientes(
        (clientData.users ?? []).map((c) => ({ ...c, id: c._id }))
      );
      setMovimientos(
        (movData.movements ?? []).map((m) => ({ ...m, id: m._id }))
      );
      const cfg = cfgData.config ?? {};
      setConfigState(cfg);
      setDiasBloqueados(cfg.diasBloqueados ?? []);
    } catch (err) {
      console.error("Error cargando datos admin:", err);
      if (err.message === "No autorizado.") return;
      setErrorCarga("No se pudieron cargar los datos. Verifica tu conexión e intenta recargar.");
    } finally {
      setCargando(false);
    }
  }, [api]);

  // Carga inicial al montar — solo si el usuario es admin
  useEffect(() => {
    if (usuario?.rol === "admin") cargarTodo();
  }, [cargarTodo]);

  const value = useMemo(
    () => ({
      cargando,
      errorCarga,
      citas,
      setCitas,
      servicios,
      setServicios,
      clientes,
      setClientes,
      diasBloqueados,
      setDiasBloqueados,
      movimientos,
      setMovimientos,
      config,
      setConfig,
      normalizarTelefonoWa,
      recargarTodo: cargarTodo,
    }),
    [
      cargando, errorCarga, citas, servicios, clientes,
      diasBloqueados, movimientos, config,
      setConfig, cargarTodo,
    ]
  );

  return React.createElement(AdminDataContext.Provider, { value }, children);
}

export function useAdminData() {
  const ctx = useContext(AdminDataContext);
  if (!ctx) {
    throw new Error("useAdminData debe usarse dentro de <AdminDataProvider>");
  }
  return ctx;
}
