import mongoose    from "mongoose";
import Appointment from "../models/Appointment.js";
import User        from "../models/User.js";
import Movement    from "../models/Movement.js";
import Config      from "../models/Config.js";
import BlockedClient      from "../models/BlockedClient.js";
import { normalizePhone } from "../utils/normalizePhone.js";
import { enviarNotificacionAdmin, enviarNotificacionCancelacion, enviarNotificacionReagendamiento } from "../services/emailService.js";

// ── Helpers de movimientos automáticos ───────────────────────────────────────
async function crearMovimientoCita(appointment) {
  const existe = await Movement.findOne({ citaId: appointment._id });
  if (existe) return;
  await Movement.create({
    tipo:         "ingreso",
    monto:        appointment.precio,
    descripcion:  `Servicio: ${appointment.servicios.join(", ")} — ${appointment.clienteNombre}`,
    fecha:        appointment.fecha,
    hora:         appointment.hora,
    esAutomatico: true,
    citaId:       appointment._id,
  });
}

async function eliminarMovimientoCita(citaId) {
  await Movement.deleteOne({ citaId });
}

// ── POST /api/appointments — público, cualquiera puede agendar ────────────────
export async function createAppointment(req, res) {
  try {
    const {
      fecha, hora, servicios, duracion, precio, clienteCorreo, userId,
    } = req.body;
    const clienteNombre    = req.body.clienteNombre?.trim();
    const clienteTelefono  = req.body.clienteTelefono?.trim();

    if (!fecha || !hora || !servicios?.length || !clienteNombre || !clienteTelefono || !duracion) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos." });
    }
    if (!Number.isInteger(duracion) || duracion <= 0) {
      return res.status(400).json({ mensaje: "La duración debe ser un número entero positivo." });
    }

    // Verificar que el nuevo slot no se empalme con ninguna cita existente
    const citasDelDia = await Appointment.find({
      fecha,
      estado: { $nin: ["cancelada"] },
    }).select("hora duracion");
    const nuevaInicio = horaAMinutos(hora);
    const nuevaFin    = nuevaInicio + (duracion || 0);
    const conflicto   = citasDelDia.some((c) => {
      const existInicio = horaAMinutos(c.hora);
      const existFin    = existInicio + (c.duracion || 0);
      return nuevaInicio < existFin && existInicio < nuevaFin;
    });
    if (conflicto) {
      return res.status(409).json({ mensaje: "Este horario ya no está disponible." });
    }

    // Verificar que la cita esté dentro del horario de operación
    const cfg = await Config.findOne({ clave: "global" }).lean();
    const horario = horarioDelDia(cfg, fecha);
    if (!horario) {
      return res.status(400).json({ mensaje: "El negocio está cerrado ese día." });
    }
    if (nuevaInicio < horario.inicioMin) {
      return res.status(400).json({ mensaje: "La cita es antes del horario de apertura." });
    }
    if (nuevaFin > horario.finMin) {
      return res.status(400).json({ mensaje: "La cita excede el horario de cierre." });
    }

    // Verificar lista negra si el usuario está registrado
    if (userId) {
      const usuario = await User.findById(userId);
      if (usuario?.listaNegraActiva) {
        return res.status(403).json({
          mensaje: "No puedes agendar citas en línea. Contacta directamente a la barbería.",
        });
      }
    }

    // Verificar lista negra por teléfono (aplica a registrados y visitantes)
    const telefonoNormalizado = normalizePhone(clienteTelefono);
    const clienteBloqueado = await BlockedClient.findOne({
      telefono: telefonoNormalizado,
      activo: true,
    });
    if (clienteBloqueado) {
      return res.status(403).json({
        mensaje: "No puedes agendar citas en línea. Contacta directamente a la barbería.",
      });
    }

    const appointment = await Appointment.create({
      fecha,
      hora,
      servicios,
      duracion,
      precio,
      clienteNombre,
      clienteTelefono,
      clienteCorreo: clienteCorreo ?? "",
      userId:        userId ?? null,
    });

    // Auto-vincular al usuario si la cita se creó sin userId pero existe cuenta con ese teléfono
    if (!appointment.userId) {
      const usuarioExistente = await User.findOne({ telefono: clienteTelefono });
      if (usuarioExistente) {
        appointment.userId = usuarioExistente._id;
        await appointment.save();
      }
    }

    enviarNotificacionAdmin(appointment).catch((err) =>
      console.error("Error enviando notificación al admin:", err.message)
    );
    res.status(201).json({ appointment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ mensaje: "Este horario ya no está disponible." });
    }
    console.error("Error al crear cita:", err);
    res.status(500).json({ mensaje: "Error al agendar la cita." });
  }
}

// ── GET /api/appointments/mias — cliente autenticado ─────────────────────────
export async function getMisAppointments(req, res) {
  try {
    const appointments = await Appointment.find({
      userId: new mongoose.Types.ObjectId(req.usuario.id),
    }).sort({ fecha: -1, hora: -1 });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener citas." });
  }
}

// ── GET /api/appointments/occupied?fecha=YYYY-MM-DD — público ────────────────
export async function getOccupiedSlots(req, res) {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ mensaje: "El parámetro fecha es requerido." });
    }
    const citas = await Appointment.find({
      fecha,
      estado: { $nin: ["cancelada"] },
    }).select("hora duracion");
    const horasOcupadas = citas.map((c) => c.hora);
    res.json({
      horasOcupadas,
      citas: citas.map((c) => ({ hora: c.hora, duracion: c.duracion ?? 0 })),
    });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener horas ocupadas." });
  }
}

// ── GET /api/appointments — solo admin, todas las citas ──────────────────────
export async function getAllAppointments(req, res) {
  try {
    const { fecha } = req.query;
    const filtro = fecha ? { fecha } : {};
    const raw = await Appointment.find(filtro).sort({ fecha: 1, hora: 1 }).lean();
    const ahora = new Date();
    const appointments = raw.map((cita) => {
      if (cita.estado === "cancelada") return cita;
      const citaDate = parsearCitaDateTime(cita.fecha, cita.hora);
      if (citaDate <= ahora && cita.estado !== "finalizada") {
        return { ...cita, estado: "finalizada" };
      }
      if (citaDate > ahora && cita.estado === "finalizada") {
        return { ...cita, estado: "pendiente" };
      }
      return cita;
    });
    res.json({ appointments });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener citas." });
  }
}

// ── PATCH /api/appointments/:id — solo admin ─────────────────────────────────
export async function updateAppointment(req, res) {
  try {
    const anterior = await Appointment.findById(req.params.id).lean();
    if (!anterior) {
      return res.status(404).json({ mensaje: "Cita no encontrada." });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );

    const nuevoEstado = req.body.estado;

    if (nuevoEstado === "finalizada" && anterior.estado !== "finalizada") {
      await crearMovimientoCita(appointment).catch((err) =>
        console.error("Error creando movimiento automático:", err.message)
      );
    } else if (nuevoEstado === "cancelada") {
      await eliminarMovimientoCita(appointment._id).catch((err) =>
        console.error("Error eliminando movimiento automático:", err.message)
      );
    }

    res.json({ appointment });
  } catch (err) {
    console.error("Error al actualizar cita:", err);
    res.status(500).json({ mensaje: "Error al actualizar cita." });
  }
}

// ── Helper: "HH:MM AM/PM" → minutos desde medianoche ─────────────────────────
function horaAMinutos(hora) {
  const [time, period] = hora.trim().split(" ");
  const [h, m] = time.split(":").map(Number);
  let h24 = h;
  if (period === "PM" && h !== 12) h24 += 12;
  if (period === "AM" && h === 12) h24 = 0;
  return h24 * 60 + m;
}

// ── Helper: horario del día en minutos {inicioMin, finMin} (null si cerrado) ──
function horarioDelDia(cfg, fechaStr) {
  const dia = new Date(fechaStr + "T12:00:00").getDay(); // evita problemas de zona horaria
  const horario = cfg?.horarioPorDia?.[String(dia)];
  if (!horario || horario.cerrado) return null;
  return {
    inicioMin: (horario.inicio ?? 9) * 60,
    finMin:    (horario.fin   ?? 21) * 60,
  };
}

// ── Helper: parsear "10:00 AM" + "2025-04-21" → Date (UTC) ───────────────────
// México City es UTC-6 permanente desde 2023 (sin horario de verano).
// Railway corre en UTC, por lo que new Date(year, month, day, h, m) crearía
// la fecha en UTC, no en hora local de México — se adelanta 6 horas el umbral.
// Se usa Date.UTC + offset explícito para producir el timestamp UTC correcto.
// México City es UTC-6 permanente (sin horario de verano desde 2023).
// Date.UTC trata los valores como UTC puro, pero hora+fecha son hora local México.
// Para convertir a UTC real: sumar 6 h (México va 6 h detrás de UTC).
// Ej: 3:00 PM México → Date.UTC da 15:00Z → +6h = 21:00Z ✓
const OFFSET_MEXICO_MS = 6 * 60 * 60 * 1000;
function parsearCitaDateTime(fecha, hora) {
  const partes = hora.trim().split(" ");
  const period = partes[1]; // "AM" | "PM"
  const [h, m] = partes[0].split(":").map(Number);
  let h24 = h;
  if (period === "PM" && h !== 12) h24 += 12;
  if (period === "AM" && h === 12) h24 = 0;
  const [year, month, day] = fecha.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, h24, m) + OFFSET_MEXICO_MS);
}

// ── PATCH /api/appointments/mias/:id — cliente autenticado ───────────────────
export async function patchClienteAppointment(req, res) {
  try {
    const cita = await Appointment.findOne({
      _id: req.params.id,
      userId: req.usuario.id,
    });
    if (!cita) {
      return res.status(404).json({ mensaje: "Cita no encontrada." });
    }
    if (cita.estado === "cancelada" || cita.estado === "finalizada") {
      return res.status(400).json({ mensaje: "Esta cita ya no se puede modificar." });
    }

    const { estado, fecha, hora, reagendada, notasAdmin } = req.body;

    // ── Cancelar ─────────────────────────────────────────────────────────────
    if (estado === "cancelada") {
      const diffHoras = (parsearCitaDateTime(cita.fecha, cita.hora) - new Date()) / 3_600_000;
      if (diffHoras < 1) {
        return res.status(400).json({
          mensaje: "Ya no es posible cancelar esta cita en línea. Contacta directamente a Blanca Ríos Estudio.",
        });
      }
      cita.estado = "cancelada";
      if (reagendada) cita.reagendada = true;
      if (notasAdmin) cita.notasAdmin = notasAdmin;
      await cita.save();
      await eliminarMovimientoCita(cita._id).catch((err) =>
        console.error("Error eliminando movimiento automático:", err.message)
      );
      enviarNotificacionCancelacion(cita).catch((err) =>
        console.error("Error enviando notificación de cancelación:", err.message)
      );
      return res.json({ appointment: cita });
    }

    // ── Reagendar ─────────────────────────────────────────────────────────────
    if (reagendada && fecha && hora) {
      if (cita.reagendada) {
        return res.status(400).json({
          mensaje: "Esta cita ya fue reagendada una vez. Solo puedes cancelarla.",
        });
      }
      const diffHoras = (parsearCitaDateTime(fecha, hora) - new Date()) / 3_600_000;
      if (diffHoras < 3) {
        return res.status(400).json({
          mensaje: "Solo puedes agendar citas con al menos 3 horas de anticipación.",
        });
      }
      const citasDelDia = await Appointment.find({
        _id: { $ne: cita._id },
        fecha,
        estado: { $nin: ["cancelada"] },
      }).select("hora duracion");
      const nuevaInicio = horaAMinutos(hora);
      const nuevaFin    = nuevaInicio + (cita.duracion || 0);
      const conflicto   = citasDelDia.some((c) => {
        const existInicio = horaAMinutos(c.hora);
        const existFin    = existInicio + (c.duracion || 0);
        return nuevaInicio < existFin && existInicio < nuevaFin;
      });
      if (conflicto) {
        return res.status(409).json({ mensaje: "Ese horario ya está ocupado. Elige otro." });
      }
      const cfgReag = await Config.findOne({ clave: "global" }).lean();
      const horReag = horarioDelDia(cfgReag, fecha);
      if (!horReag) {
        return res.status(400).json({ mensaje: "El negocio está cerrado ese día." });
      }
      const reagNuevaFin = nuevaInicio + (cita.duracion || 0);
      if (nuevaInicio < horReag.inicioMin) {
        return res.status(400).json({ mensaje: "La cita es antes del horario de apertura." });
      }
      if (reagNuevaFin > horReag.finMin) {
        return res.status(400).json({ mensaje: "La cita excede el horario de cierre." });
      }
      cita.fecha     = fecha;
      cita.hora      = hora;
      cita.reagendada = true;
      await cita.save();
      enviarNotificacionReagendamiento(cita).catch((err) =>
        console.error("Error enviando notificación de reagendamiento:", err.message)
      );
      return res.json({ appointment: cita });
    }

    return res.status(400).json({ mensaje: "Operación no válida." });
  } catch (err) {
    console.error("Error en patchClienteAppointment:", err);
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

// ── DELETE /api/appointments/:id — solo admin ─────────────────────────────────
export async function deleteAppointment(req, res) {
  try {
    await eliminarMovimientoCita(req.params.id).catch((err) =>
      console.error("Error eliminando movimiento automático:", err.message)
    );
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ mensaje: "Cita no encontrada." });
    }
    res.json({ mensaje: "Cita eliminada correctamente." });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al eliminar cita." });
  }
}

// ── GET /api/appointments/auto-finalizar — solo admin ─────────────────────────
export async function autoFinalizarCitas(req, res) {
  try {
    const ahora = new Date();
    const citas = await Appointment.find({
      estado: { $in: ["pendiente", "confirmada"] },
    });

    const pasadas = citas.filter((c) => parsearCitaDateTime(c.fecha, c.hora) < ahora);

    let finalizadas = 0;
    for (const cita of pasadas) {
      cita.estado = "finalizada";
      await cita.save();
      await crearMovimientoCita(cita).catch((err) =>
        console.error("Error creando movimiento automático:", err.message)
      );
      finalizadas++;
    }

    res.json({ finalizadas });
  } catch (err) {
    console.error("Error en autoFinalizarCitas:", err);
    res.status(500).json({ mensaje: "Error al auto-finalizar citas." });
  }
}