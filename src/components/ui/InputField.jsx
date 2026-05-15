// src/components/ui/InputField.jsx
//
// ÁTOMO — Input + Label + mensaje de error unificados.
// Reutilizable en: RegisterPage, LoginPage, DatosClienteSection, perfil, admin.
//
// Props:
//   id            — conecta <label htmlFor> con <input id>
//   label         — texto del label
//   tipo          — "text" | "email" | "password" | "tel" (default "text")
//   placeholder
//   value
//   onChange      — (e) => void
//   error         — string de error (opcional, se muestra en rojo)
//   opcional      — bool, añade "(Opcional)" al label
//   disabled      — bool
//   autoComplete  — string para el atributo autocomplete del browser

import React from "react";

export default function InputField({
  id,
  label,
  tipo = "text",
  placeholder,
  value,
  onChange,
  error,
  opcional = false,
  disabled = false,
  autoComplete,
  required = false,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="label">
        {label}
        {opcional && (
          <span className="ml-1 text-texto-secundario/60">(Opcional)</span>
        )}
      </label>

      <input
        id={id}
        type={tipo}
        className={[
          "input-base",
          error ? "!border-estado-cancelada/70 focus:!border-estado-cancelada" : "",
          disabled ? "opacity-50 cursor-not-allowed" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
      />

      {/* Mensaje de error inline */}
      {error && (
        <p className="text-[11px] text-estado-cancelada/80 flex items-center gap-1">
          <span aria-hidden="true">✕</span>
          {error}
        </p>
      )}
    </div>
  );
}