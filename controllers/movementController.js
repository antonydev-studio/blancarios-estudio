import Movement from "../models/Movement.js";
import { toMexicoISO } from "../utils/mexicoTime.js";

export async function getMovements(req, res) {
  try {
    const { periodo } = req.query; // "hoy" | "semana" | "mes"
    const ahora = new Date();

    // Use Mexico City time (UTC-6) — Vercel servers run UTC so we must offset
    const hoyMexico = toMexicoISO(ahora);
    let desde;
    if (periodo === "hoy") {
      desde = hoyMexico;
    } else if (periodo === "semana") {
      desde = toMexicoISO(new Date(ahora.getTime() - 6 * 86_400_000));
    } else {
      desde = toMexicoISO(new Date(ahora.getTime() - 29 * 86_400_000));
    }

    const query = periodo === "hoy"
      ? { fecha: desde }
      : { fecha: { $gte: desde } };
    const movements = await Movement.find(query).sort({ fecha: -1, hora: -1 });

    res.json({ movements });
  } catch {
    res.status(500).json({ mensaje: "Error al obtener movimientos." });
  }
}

export async function createMovement(req, res) {
  try {
    const { tipo, monto, descripcion, fecha, hora } = req.body;
    if (!tipo || !monto || !descripcion || !fecha) {
      return res.status(400).json({ mensaje: "Faltan campos requeridos." });
    }
    const movement = await Movement.create({
      tipo, monto, descripcion, fecha, hora, esAutomatico: false,
    });
    res.status(201).json({ movement });
  } catch {
    res.status(500).json({ mensaje: "Error al crear movimiento." });
  }
}

export async function deleteMovement(req, res) {
  try {
    const movement = await Movement.findByIdAndDelete(req.params.id);
    if (!movement) {
      return res.status(404).json({ mensaje: "Movimiento no encontrado." });
    }
    res.json({ mensaje: "Movimiento eliminado." });
  } catch {
    res.status(500).json({ mensaje: "Error al eliminar movimiento." });
  }
}
