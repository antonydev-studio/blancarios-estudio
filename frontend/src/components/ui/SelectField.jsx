import React, { useState, useRef, useEffect } from "react";

export default function SelectField({ label, value, onChange, options }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative w-full">
      {label && <label className="label">{label}</label>}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="input-base flex items-center justify-between gap-2 text-left"
      >
        <span>{selected?.label ?? "Seleccionar"}</span>
        <svg
          className={`w-4 h-4 shrink-0 text-texto-secundario transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ul className="absolute z-50 mt-2 w-full rounded-xl border border-crema/30 bg-panel-oscuro shadow-2xl overflow-hidden py-2">
          {options.map((opt) => (
            <li key={opt.value}>
              <button
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={[
                  "w-full px-4 py-3.5 text-sm text-left transition-colors",
                  opt.value === value
                    ? "bg-crema/15 text-crema font-medium"
                    : "text-blanco-suave hover:bg-panel-medio/60",
                ].join(" ")}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
