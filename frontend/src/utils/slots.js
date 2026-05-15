// Utilidades de fecha y slots de hora.

/**
 * Determina si una cita (fecha ISO "YYYY-MM-DD" + hora "HH:MM AM/PM") es futura.
 * Si se pasa solo fechaStr, compara fecha completa (hoy cuenta como futura hasta medianoche).
 * Si se pasa también horaStr, una cita de hoy solo es "próxima" si su hora aún no pasó.
 */
export function esFutura(fechaStr, horaStr) {
  const [y, m, d] = fechaStr.split("-").map(Number);
  if (!horaStr) {
    const fecha = new Date(y, m - 1, d);
    const hoy   = new Date();
    hoy.setHours(0, 0, 0, 0);
    return fecha >= hoy;
  }
  // Parsear hora "HH:MM AM/PM"
  const partes = horaStr.trim().split(" ");
  const period = partes[1];
  const [h, min] = partes[0].split(":").map(Number);
  let h24 = h;
  if (period === "PM" && h !== 12) h24 += 12;
  if (period === "AM" && h === 12) h24 = 0;
  const citaDate = new Date(y, m - 1, d, h24, min);
  return citaDate > new Date();
}

// Genera etiquetas "HH:MM AM/PM" para el selector de hora.

export function generarSlots(horaInicio = 9, horaFin = 21, intervaloMin = 15, duracionMin = 0) {
  const slots = [];
  // Math.max(duracionMin, 1) evita que el horario de cierre exacto aparezca como slot disponible
  const limiteMin = horaFin * 60 - Math.max(duracionMin, 1);
  for (let total = horaInicio * 60; total <= limiteMin; total += intervaloMin) {
    const h = Math.floor(total / 60);
    const m = total % 60;
    const period = h < 12 ? "AM" : "PM";
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
    slots.push(`${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${period}`);
  }
  return slots;
}

export function fechaISO(fecha) {
  if (!fecha) return "";
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Devuelve { inicio, fin } para un día de la semana (0=Dom … 6=Sáb),
 * o null si el día está cerrado. Soporta horarioPorDia (nuevo) y el
 * fallback a horarioInicio/horarioFin global (datos viejos).
 */
export function getHorarioDia(config, diaSemana) {
  if (config.horarioPorDia) {
    const h = config.horarioPorDia[diaSemana];
    if (!h || h.cerrado) return null;
    return { inicio: h.inicio ?? 9, fin: h.fin ?? 21 };
  }
  // Fallback hacia estructura global antigua
  return { inicio: config.horarioInicio ?? 9, fin: config.horarioFin ?? 21 };
}

// Convierte "HH:MM AM/PM" a minutos desde medianoche.
export function horaAMinutos(hora) {
  const [time, period] = hora.trim().split(" ");
  const [h, m] = time.split(":").map(Number);
  let h24 = h;
  if (period === "PM" && h !== 12) h24 += 12;
  if (period === "AM" && h === 12) h24 = 0;
  return h24 * 60 + m;
}

export function parseYMD(s) {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}