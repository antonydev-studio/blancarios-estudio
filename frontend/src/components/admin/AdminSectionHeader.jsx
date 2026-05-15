// src/components/admin/AdminSectionHeader.jsx
// Encabezado reutilizable — alineado con section-title / brand-label del sitio.

import React from "react";

export default function AdminSectionHeader({ label, title, subtitle, noMargin }) {
  return (
    <header className={noMargin ? "" : "mb-6 sm:mb-8"}>
      {label ? <p className="brand-label mb-2 text-center sm:text-left">{label}</p> : null}
      <h1 className="mb-1 font-display text-2xl font-bold text-blanco-suave md:text-3xl text-center sm:text-left">
        {title}
      </h1>
      {subtitle ? <p className="section-subtitle mt-1 max-w-2xl text-center sm:text-left">{subtitle}</p> : null}
    </header>
  );
}
