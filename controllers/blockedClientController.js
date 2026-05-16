import mongoose from "mongoose";
import BlockedClient      from "../models/BlockedClient.js";
import { normalizePhone } from "../utils/normalizePhone.js";

export async function getBlockedClients(req, res) {
  try {
    const blocked = await BlockedClient.find().sort({ createdAt: -1 });
    res.json({ ok: true, data: blocked });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener clientes bloqueados." });
  }
}

export async function createBlockedClient(req, res) {
  try {
    const { telefono, motivo } = req.body;
    if (!telefono) {
      return res.status(400).json({ mensaje: "El teléfono es requerido." });
    }
    const telefonoNormalizado = normalizePhone(telefono);
    const blocked = await BlockedClient.create({
      telefono:  telefonoNormalizado,
      motivo:    motivo ?? "",
      creadoPor: req.usuario._id,
    });
    res.status(201).json({ ok: true, data: blocked });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ mensaje: "Este teléfono ya está bloqueado." });
    }
    res.status(500).json({ mensaje: "Error al bloquear cliente." });
  }
}

export async function toggleBlockedClient(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mensaje: "ID inválido." });
    }
    const blocked = await BlockedClient.findById(req.params.id);
    if (!blocked) {
      return res.status(404).json({ mensaje: "Cliente bloqueado no encontrado." });
    }
    blocked.activo = !blocked.activo;
    await blocked.save();
    res.json({ ok: true, data: blocked });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al actualizar estado." });
  }
}

export async function deleteBlockedClient(req, res) {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mensaje: "ID inválido." });
    }
    const blocked = await BlockedClient.findByIdAndDelete(req.params.id);
    if (!blocked) {
      return res.status(404).json({ mensaje: "Cliente bloqueado no encontrado." });
    }
    res.json({ ok: true, mensaje: "Cliente desbloqueado." });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al eliminar bloqueo." });
  }
}
