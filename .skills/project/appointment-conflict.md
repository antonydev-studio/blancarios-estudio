# Skill: Appointment Conflict Detection

## Algorithm (from ARCHITECTURE.md)

```js
// 1. Get all appointments for the day (not cancelled)
const existing = await Appointment.find({
  fecha,
  estado: { $ne: "cancelada" }
}).lean();

// 2. Convert "HH:MM AM/PM" → minutes from midnight
function toMinutes(timeStr) {
  const [time, period] = timeStr.split(" ");
  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h !== 12) h += 12;
  if (period === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

// 3. Detect conflict
const nuevaInicio = toMinutes(hora);
const nuevaFin    = nuevaInicio + duracion;

const conflict = existing.some(apt => {
  const existInicio = toMinutes(apt.hora);
  const existFin    = existInicio + apt.duracion;
  return nuevaInicio < existFin && existInicio < nuevaFin;
});

if (conflict) return res.status(409).json({ mensaje: "Conflicto de horario." });
```

## Business rules

- Client cancel: must be >1h before appointment
- Client reschedule: must be >3h before appointment, only once (`reagendada: false`)
- Lista negra check: `user.listaNegraActiva === true` → 403
- Guest booking: `userId = null`, link by phone on registration

## Estado flow

```
pendiente → confirmada → finalizada
pendiente → cancelada
confirmada → cancelada
confirmada → finalizada
```
