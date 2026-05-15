import mongoose from "mongoose";
import Service from "../models/Service.js";

// ── GET /api/services — público, cualquiera puede ver el catálogo ─────────────
export async function getServices(req, res) {
  try {
    const services = await Service.find().sort({ createdAt: 1 });
    res.json({ services });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener servicios." });
  }
}

// ── POST /api/services — solo admin ──────────────────────────────────────────
export async function createService(req, res) {
  try {
    const { titulo, descripcion, imagen, precio, duracion, categoria } = req.body;
    if (!titulo || !precio || !duracion) {
      return res.status(400).json({ mensaje: "Título, precio y duración son requeridos." });
    }
    const service = await Service.create(req.body);
    res.status(201).json({ service });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al crear servicio." });
  }
}

// ── PATCH /api/services/:id — solo admin ─────────────────────────────────────
export async function updateService(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mensaje: "ID de servicio inválido." });
    }
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { returnDocument: 'after', runValidators: true }
    );
    if (!service) return res.status(404).json({ mensaje: "Servicio no encontrado." });
    res.json({ service });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al actualizar servicio." });
  }
}

// ── DELETE /api/services/:id — solo admin ────────────────────────────────────
export async function deleteService(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mensaje: "ID de servicio inválido." });
    }
    const service = await Service.findByIdAndDelete(req.params.id);
    if (!service) return res.status(404).json({ mensaje: "Servicio no encontrado." });
    res.json({ mensaje: "Servicio eliminado correctamente." });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al eliminar servicio." });
  }
}