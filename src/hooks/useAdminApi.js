// src/hooks/useAdminApi.js
// Centraliza todos los fetch del panel admin.
// Uso: const api = createAdminApi(getToken)

export function createAdminApi(getToken, onUnauthorized = () => {}) {
  function headers() {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    };
  }

  async function apiFetch(url, options = {}) {
    const res = await fetch(url, { ...options, headers: headers() });
    if (res.status === 401) {
      onUnauthorized();
      throw new Error("No autorizado.");
    }
    const data = await res.json();
    if (!res.ok) throw new Error(data.mensaje || "Error en la petición");
    return data;
  }

  return {
    // ── CITAS ───────────────────────────────────────────────────────────────
    fetchAppointments: () =>
      apiFetch("/api/appointments"),
    updateAppointment: (id, data) =>
      apiFetch(`/api/appointments/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteAppointment: (id) =>
      apiFetch(`/api/appointments/${id}`, { method: "DELETE" }),

    // ── SERVICIOS ────────────────────────────────────────────────────────────
    fetchServices: () =>
      apiFetch("/api/services"),
    createService: (data) =>
      apiFetch("/api/services", { method: "POST", body: JSON.stringify(data) }),
    updateService: (id, data) =>
      apiFetch(`/api/services/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteService: (id) =>
      apiFetch(`/api/services/${id}`, { method: "DELETE" }),

    // ── CONFIG ───────────────────────────────────────────────────────────────
    fetchConfig: () =>
      apiFetch("/api/config"),
    updateConfig: (data) =>
      apiFetch("/api/config", { method: "PATCH", body: JSON.stringify(data) }),

    // ── CLIENTES ─────────────────────────────────────────────────────────────
    fetchClients: () =>
      apiFetch("/api/users"),
    updateClient: (id, data) =>
      apiFetch(`/api/users/${id}`, { method: "PATCH", body: JSON.stringify(data) }),
    deleteClient: (id) =>
      apiFetch(`/api/users/${id}`, { method: "DELETE" }),

    // ── MOVIMIENTOS ──────────────────────────────────────────────────────────
    fetchMovements: (periodo = "mes") =>
      apiFetch(`/api/movements?periodo=${periodo}`),
    createMovement: (data) =>
      apiFetch("/api/movements", { method: "POST", body: JSON.stringify(data) }),
    deleteMovement: (id) =>
      apiFetch(`/api/movements/${id}`, { method: "DELETE" }),

    // ── CLIENTES BLOQUEADOS ───────────────────────────────────────────────────
    fetchBlockedClients: () =>
      apiFetch("/api/blocked-clients"),
    createBlockedClient: (data) =>
      apiFetch("/api/blocked-clients", { method: "POST", body: JSON.stringify(data) }),
    toggleBlockedClient: (id) =>
      apiFetch(`/api/blocked-clients/${id}`, { method: "PATCH" }),
    deleteBlockedClient: (id) =>
      apiFetch(`/api/blocked-clients/${id}`, { method: "DELETE" }),
  };
}
