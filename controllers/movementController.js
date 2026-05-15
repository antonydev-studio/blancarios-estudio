// src/controllers/movementController.js

import Movement from "../models/Movement.js";

function toLocalISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function getMovements(req, res) {
  try {
    const { periodo } = req.query; // "hoy" | "semana" | "mes"
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let desde;
    if (periodo === "hoy")         desde = hoy;
    else if (periodo === "semana") desde = new Date(hoy - 6 * 86400000);
    else                           desde = new Date(hoy - 29 * 86400000);

    const fechaDesde = toLocalISO(desde);
    const query = periodo === "hoy"
      ? { fecha: fechaDesde }
      : { fecha: { $gte: fechaDesde } };
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
