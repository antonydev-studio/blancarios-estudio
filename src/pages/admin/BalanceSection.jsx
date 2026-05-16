// src/pages/admin/BalanceSection.jsx

import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { createAdminApi } from "../../hooks/useAdminApi";
import AdminSectionHeader from "../../components/admin/AdminSectionHeader";
import AdminFilterChip from "../../components/admin/AdminFilterChip";
import MetricCard from "../../components/ui/MetricCard";
import InputField from "../../components/ui/InputField";
import Toast from "../../components/ui/Toast";
import { fechaISO } from "../../utils/slots";

// ── Helper de filtrado por período ────────────────────────────────────────────

function filtrarPorPeriodo(items, periodo) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return items.filter((item) => {
    const fechaStr = (item.fecha ?? "").slice(0, 10);
    const [y, m, d] = fechaStr.split("-").map(Number);
    const fecha = new Date(y, m - 1, d);
    if (periodo === "hoy")    return fecha.getTime() === hoy.getTime();
    if (periodo === "semana") return fecha >= new Date(hoy.getTime() - 6 * 86400000);
    return fecha >= new Date(hoy.getTime() - 29 * 86400000);
  });
}

// ── Constantes ────────────────────────────────────────────────────────────────

const PERIODOS = [
  { key: "hoy",    label: "Hoy" },
  { key: "semana", label: "Semana" },
  { key: "mes",    label: "Mes" },
];

// ── Componente ────────────────────────────────────────────────────────────────

export default function BalanceSection({ citas, movimientos, setMovimientos }) {
  const { getToken } = useAuth();
  const api = useMemo(() => createAdminApi(getToken), [getToken]);

  const [periodo, setPeriodo] = useState("hoy");

  // Formulario inline
  const [formAbierto,      setFormAbierto]      = useState(null); // "ingreso" | "egreso" | null
  const [monto,            setMonto]            = useState("");
  const [descripcion,      setDescripcion]      = useState("");
  const [fechaMovimiento,  setFechaMovimiento]  = useState(() => fechaISO(new Date()));
  const [errores,          setErrores]          = useState({});
  const [cargandoMov, setCargandoMov] = useState(false);
  const [toastError,  setToastError]  = useState("");

  const mostrarToastError = (msg) => {
    setToastError(msg);
    setTimeout(() => setToastError(""), 4000);
  };

  // ── Re-fetch movimientos cuando cambia el período ────────────────────────────
  // Para "hoy" se pide "semana" al backend porque el servidor corre en UTC y su
  // "hoy" puede diferir de la fecha local del browser. El filtrado preciso a
  // "hoy" lo hace filtrarPorPeriodo con la fecha local del browser.
  useEffect(() => {
    const fetchPeriodo = periodo === "hoy" ? "semana" : periodo;
    api.fetchMovements(fetchPeriodo)
      .then((data) =>
        setMovimientos((data.movements ?? []).map((m) => ({ ...m, id: m._id })))
      )
      .catch(() => mostrarToastError("No se pudieron cargar los movimientos."));
  }, [periodo]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Ingresos automáticos derivados de citas finalizadas ──────────────────────
  const ingresosAutomaticos = useMemo(() =>
    (citas ?? [])
      .filter((c) => c.estado === "finalizada")
      .map((c) => ({
        id:          c.id ?? c._id,
        tipo:        "ingreso",
        monto:       c.precio,
        descripcion: `${(c.servicios ?? []).join(", ") || "Servicio"} — ${c.clienteNombre}`,
        fecha:       c.fecha,
        hora:        c.hora ?? "",
        esAutomatico: true,
      })),
    [citas]
  );

  // ── Todos los movimientos del período ────────────────────────────────────────
  // ingresosAutomaticos viene de citas; excluir del backend cualquier movimiento
  // con esAutomatico===true para evitar doble conteo si existieran registros previos.
  const todos = useMemo(() => {
    const manuales = movimientos.filter((m) => !m.esAutomatico);
    return filtrarPorPeriodo([...ingresosAutomaticos, ...manuales], periodo).sort((a, b) =>
      b.fecha.localeCompare(a.fecha) || (b.hora ?? "").localeCompare(a.hora ?? "")
    );
  }, [ingresosAutomaticos, movimientos, periodo]);

  // ── Métricas ──────────────────────────────────────────────────────────────
  const { totalIngresos, totalEgresos, balanceNeto } = useMemo(() => {
    const ingresos = todos.filter((m) => m.tipo === "ingreso").reduce((s, m) => s + m.monto, 0);
    const egresos  = todos.filter((m) => m.tipo === "egreso").reduce((s, m) => s + m.monto, 0);
    return { totalIngresos: ingresos, totalEgresos: egresos, balanceNeto: ingresos - egresos };
  }, [todos]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const abrirForm = (tipo) => {
    setFormAbierto(tipo);
    setMonto("");
    setDescripcion("");
    setFechaMovimiento(fechaISO(new Date()));
    setErrores({});
  };

  const cerrarForm = () => {
    setFormAbierto(null);
    setFechaMovimiento(fechaISO(new Date()));
    setErrores({});
  };

  const registrar = async () => {
    const errs = {};
    const montoNum = parseFloat(monto);
    if (!monto || isNaN(montoNum) || montoNum <= 0) errs.monto = "Ingresa un monto válido mayor a 0";
    if (!descripcion.trim()) errs.descripcion = "La descripción es obligatoria";
    if (!fechaMovimiento) errs.fechaMovimiento = "La fecha es obligatoria";
    if (Object.keys(errs).length > 0) { setErrores(errs); return; }

    const ahora = new Date();
    const h     = ahora.getHours();
    const min   = String(ahora.getMinutes()).padStart(2, "0");
    const period = h < 12 ? "AM" : "PM";
    const h12   = h === 0 ? 12 : h > 12 ? h - 12 : h;

    const payload = {
      tipo:        formAbierto,
      monto:       montoNum,
      descripcion: descripcion.trim(),
      fecha:       fechaMovimiento,
      hora:        `${String(h12).padStart(2, "0")}:${min} ${period}`,
    };

    setCargandoMov(true);
    try {
      const data = await api.createMovement(payload);
      const nuevo = { ...data.movement, id: data.movement._id };
      setMovimientos((prev) => [nuevo, ...prev]);
      cerrarForm();
    } catch (err) {
      console.error("Error al registrar movimiento:", err);
      mostrarToastError("No se pudo registrar el movimiento. Intenta de nuevo.");
    } finally {
      setCargandoMov(false);
    }
  };

  const eliminarMovimiento = async (id) => {
    if (!window.confirm("¿Eliminar este movimiento? Esta acción no se puede deshacer.")) return;
    try {
      await api.deleteMovement(id);
      setMovimientos((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Error al eliminar movimiento:", err);
      mostrarToastError("No se pudo eliminar el movimiento. Intenta de nuevo.");
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8 sm:space-y-10">
      <AdminSectionHeader
        label="Finanzas"
        title="Balance"
        subtitle="Ingresos, egresos y balance neto del negocio."
      />

      {/* Filtro de período */}
      <div className="flex gap-2">
        {PERIODOS.map(({ key, label }) => (
          <AdminFilterChip
            key={key}
            selected={periodo === key}
            onClick={() => setPeriodo(key)}
          >
            {label}
          </AdminFilterChip>
        ))}
      </div>

      {/* Parte A — Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Ingresos"
          value={`$${totalIngresos.toFixed(2)}`}
          valueClassName="text-estado-confirmada"
        />
        <MetricCard
          label="Egresos"
          value={`$${totalEgresos.toFixed(2)}`}
          valueClassName="text-estado-cancelada"
        />
        <div className="col-span-2 lg:col-span-1 flex justify-center">
          <div className="w-[calc(50%-0.5rem)] lg:w-full">
            <MetricCard
              label="Balance neto"
              value={`$${balanceNeto.toFixed(2)}`}
              valueClassName={balanceNeto >= 0 ? "text-crema" : "text-estado-cancelada"}
            />
          </div>
        </div>
      </div>

      {/* Parte B — Registrar movimiento */}
      <div className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-blanco-suave">
          Registrar movimiento
        </h2>

        {!formAbierto ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="btn-primary w-full"
              onClick={() => abrirForm("ingreso")}
            >
              + Ingreso
            </button>
            <button
              type="button"
              className="btn-danger w-full"
              onClick={() => abrirForm("egreso")}
            >
              − Egreso
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                formAbierto === "ingreso"
                  ? "border-estado-confirmada/40 bg-estado-confirmada/10 text-estado-confirmada"
                  : "border-estado-cancelada/40 bg-estado-cancelada/10 text-estado-cancelada"
              }`}>
                {formAbierto === "ingreso" ? "+ Ingreso manual" : "− Egreso"}
              </span>
            </div>

            <InputField
              id="bal-monto"
              label="Monto"
              tipo="number"
              placeholder="0.00"
              value={monto}
              onChange={(e) => {
                setMonto(e.target.value);
                setErrores((p) => ({ ...p, monto: undefined }));
              }}
              error={errores.monto}
              required
            />
            <InputField
              id="bal-desc"
              label="Descripción"
              placeholder="Ej. Inversión aire acondicionado, propina, etc."
              value={descripcion}
              onChange={(e) => {
                setDescripcion(e.target.value);
                setErrores((p) => ({ ...p, descripcion: undefined }));
              }}
              error={errores.descripcion}
              required
            />
            <InputField
              id="bal-fecha"
              label="Fecha"
              tipo="date"
              value={fechaMovimiento}
              onChange={(e) => {
                setFechaMovimiento(e.target.value);
                setErrores((p) => ({ ...p, fechaMovimiento: undefined }));
              }}
              error={errores.fechaMovimiento}
              required
            />

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button type="button" className="btn-secondary w-full" onClick={cerrarForm}>
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary w-full"
                onClick={registrar}
                disabled={cargandoMov}
              >
                {cargandoMov ? "Registrando…" : "Registrar"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Parte C — Lista de movimientos */}
      <div className="card p-5 sm:p-6 space-y-4">
        <h2 className="font-display text-lg font-semibold text-blanco-suave">
          Movimientos
        </h2>

        {todos.length === 0 ? (
          <p className="text-sm text-texto-secundario text-center py-6">
            Sin movimientos en este período.
          </p>
        ) : (
          <div className="space-y-1">
            {todos.map((mov) => (
              <div
                key={mov.id}
                className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-panel-medio/30 transition-colors group"
              >
                {/* Ícono tipo */}
                <span className={`text-sm font-bold shrink-0 w-5 text-center ${
                  mov.tipo === "ingreso" ? "text-estado-confirmada" : "text-estado-cancelada"
                }`}>
                  {mov.tipo === "ingreso" ? "+" : "−"}
                </span>

                {/* Descripción + fecha */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-blanco-suave truncate">{mov.descripcion}</p>
                  <p className="text-[11px] text-texto-secundario mt-0.5">
                    {mov.fecha}{mov.hora ? ` · ${mov.hora}` : ""}
                    {mov.esAutomatico && (
                      <span className="ml-1.5 text-[10px] border border-texto-secundario/30 text-texto-secundario/60 px-1.5 py-0.5 rounded-full">
                        automático
                      </span>
                    )}
                  </p>
                </div>

                {/* Monto */}
                <span className={`text-sm font-semibold shrink-0 ${
                  mov.tipo === "ingreso" ? "text-estado-confirmada" : "text-estado-cancelada"
                }`}>
                  ${mov.monto.toFixed(2)}
                </span>

                {/* Eliminar (solo manuales) */}
                {!mov.esAutomatico && (
                  <button
                    type="button"
                    onClick={() => eliminarMovimiento(mov.id)}
                    className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-texto-secundario hover:text-estado-cancelada ml-1 shrink-0"
                    aria-label="Eliminar movimiento"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast mensaje={toastError} onCerrar={() => setToastError("")} />
    </div>
  );
}
