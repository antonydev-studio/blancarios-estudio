// src/components/ui/BarChart.jsx

import React, { useState } from "react";

export default function BarChart({
  data = [],
  title,
  formatValue = (n) => String(n),
  horizontal = false,
  defaultBarColor = "var(--color-crema)",
  altBarColor = "var(--color-panel-medio)",
}) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const [hover, setHover] = useState(null);

  if (horizontal) {
    return (
      <div className="card p-5 sm:p-6">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-texto-secundario">
          {title}
        </p>
        <div className="space-y-3">
          {data.map((row, i) => {
            const pct = (row.value / max) * 100;
            const color = row.color ?? (i === 0 ? defaultBarColor : altBarColor);
            return (
              <div
                key={row.label}
                className="relative"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                <div className="flex justify-between text-xs mb-1 gap-2">
                  <span className="text-blanco-suave shrink-0">{row.label}</span>
                  <span className="text-texto-secundario">{formatValue(row.value)}</span>
                </div>
                <div className="h-2.5 rounded-full bg-panel-medio/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
                {hover === i && (
                  <div className="absolute left-1/2 -translate-x-1/2 -top-8 z-10 px-2 py-1 rounded-md bg-negro-suave border border-panel-medio text-[10px] text-blanco-suave shadow-lg whitespace-nowrap">
                    {formatValue(row.value)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5 sm:p-6">
      <p className="mb-4 text-[11px] font-medium uppercase tracking-widest text-texto-secundario">
        {title}
      </p>
      <div className="flex h-40 sm:h-44 items-end gap-2 w-full">
        {data.map((row, i) => {
          const pct = (row.value / max) * 100;
          const color = row.color ?? defaultBarColor;
          return (
            <div
              key={row.label}
              className="flex-1 h-full flex items-end relative"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            >
              <div
                className="w-full rounded-t-md transition-all duration-500"
                style={{
                  height: `${pct}%`,
                  backgroundColor: color,
                  minHeight: row.value > 0 ? 4 : 0,
                }}
              />
              {hover === i && (
                <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 z-10 px-2 py-1 rounded-md bg-negro-suave border border-panel-medio text-[10px] text-blanco-suave shadow-lg whitespace-nowrap">
                  {formatValue(row.value)}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex gap-2 mt-1">
        {data.map((row) => (
          <span
            key={row.label}
            className="flex-1 text-[9px] text-texto-secundario text-center truncate"
          >
            {row.label}
          </span>
        ))}
      </div>
    </div>
  );
}
