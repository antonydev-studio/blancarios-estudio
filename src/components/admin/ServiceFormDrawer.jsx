// src/components/admin/ServiceFormDrawer.jsx

import React, { useEffect, useState } from "react";
import BaseDrawer from "../ui/BaseDrawer";
import InputField from "../ui/InputField";

const vacio = {
  titulo: "",
  descripcion: "",
  precio: "",
  precioOferta: "",
  duracion: "",
  categoria: "Corte",
  oferta: false,
  activo: true,
  imagen: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&q=80",
};

export default function ServiceFormDrawer({
  abierto,
  onCerrar,
  servicioInicial,
  onGuardar,
  onEliminar,
}) {
  const [form, setForm] = useState(vacio);

  useEffect(() => {
    if (!abierto) return;
    if (servicioInicial) {
      setForm({
        titulo: servicioInicial.titulo ?? servicioInicial.nombre ?? "",
        descripcion: servicioInicial.descripcion ?? "",
        precio: String(servicioInicial.precio ?? ""),
        precioOferta: String(servicioInicial.precioOferta ?? ""),
        duracion: String(servicioInicial.duracion ?? ""),
        categoria: servicioInicial.categoria ?? "Corte",
        oferta: !!servicioInicial.oferta,
        activo: servicioInicial.activo !== false,
        imagen: servicioInicial.imagen ?? vacio.imagen,
      });
    } else {
      setForm(vacio);
    }
  }, [abierto, servicioInicial]);

  const guardar = () => {
    const precio = Number(form.precio);
    const duracion = Number(form.duracion);
    const precioOferta = form.oferta ? Number(form.precioOferta) : null;
    if (!form.titulo || !duracion) return;
    const base = {
      titulo: form.titulo,
      nombre: form.titulo,
      descripcion: form.descripcion,
      imagen: form.imagen,
      precio,
      duracion,
      categoria: form.categoria,
      oferta: form.oferta,
      precioOferta: form.oferta && !Number.isNaN(precioOferta) ? precioOferta : null,
      activo: form.activo,
    };
    if (servicioInicial?.id) {
      onGuardar({ ...servicioInicial, ...base });
    } else {
      onGuardar({
        ...base,
        id: `srv-${Date.now()}`,
      });
    }
    onCerrar();
  };

  const eliminar = () => {
    if (servicioInicial?.id && window.confirm("¿Eliminar este servicio del catálogo?")) {
      onEliminar?.(servicioInicial.id);
      onCerrar();
    }
  };

  return (
    <BaseDrawer
      abierto={abierto}
      onCerrar={onCerrar}
      titulo={servicioInicial ? "Editar servicio" : "Nuevo servicio"}
    >
      <div className="space-y-4">
        <InputField
          id="sf-titulo"
          label="Título"
          value={form.titulo}
          onChange={(e) => setForm((p) => ({ ...p, titulo: e.target.value }))}
        />
        <div>
          <label className="label" htmlFor="sf-desc">
            Descripción
          </label>
          <textarea
            id="sf-desc"
            className="input-base min-h-[88px] w-full"
            value={form.descripcion}
            onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField
            id="sf-precio"
            label="Precio"
            tipo="number"
            value={form.precio}
            onChange={(e) => setForm((p) => ({ ...p, precio: e.target.value }))}
          />
          <InputField
            id="sf-dur"
            label="Duración (min)"
            tipo="number"
            value={form.duracion}
            onChange={(e) => setForm((p) => ({ ...p, duracion: e.target.value }))}
          />
        </div>

        <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
          <span className="text-sm text-blanco-suave">Oferta activa</span>
          <div
            className={[
              "relative w-10 h-5 rounded-full border transition-colors duration-200",
              form.oferta
                ? "bg-crema/20 border-crema/50"
                : "bg-panel-medio/40 border-panel-medio/60",
            ].join(" ")}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={form.oferta}
              onChange={(e) => setForm((p) => ({ ...p, oferta: e.target.checked }))}
            />
            <span
              className={[
                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-200",
                form.oferta ? "translate-x-5 bg-crema" : "translate-x-0 bg-texto-secundario",
              ].join(" ")}
            />
          </div>
        </label>
        {form.oferta && (
          <InputField
            id="sf-oferta"
            label="Precio oferta"
            tipo="number"
            value={form.precioOferta}
            onChange={(e) => setForm((p) => ({ ...p, precioOferta: e.target.value }))}
          />
        )}

        <label className="flex items-center justify-between gap-3 cursor-pointer select-none">
          <span className="text-sm text-blanco-suave">Servicio activo (visible en agendar)</span>
          <div
            className={[
              "relative w-10 h-5 rounded-full border transition-colors duration-200",
              form.activo
                ? "bg-crema/20 border-crema/50"
                : "bg-panel-medio/40 border-panel-medio/60",
            ].join(" ")}
          >
            <input
              type="checkbox"
              className="sr-only"
              checked={form.activo}
              onChange={(e) => setForm((p) => ({ ...p, activo: e.target.checked }))}
            />
            <span
              className={[
                "absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all duration-200",
                form.activo ? "translate-x-5 bg-crema" : "translate-x-0 bg-texto-secundario",
              ].join(" ")}
            />
          </div>
        </label>

        <div className="flex gap-2 pt-2">
          <button type="button" className="btn-primary flex-1" onClick={guardar}>
            Guardar
          </button>
          {servicioInicial?.id && (
            <button
              type="button"
              className="btn-danger flex-1"
              onClick={eliminar}
            >
              Eliminar
            </button>
          )}
        </div>
      </div>
    </BaseDrawer>
  );
}
