import User from "../models/User.js";
import Appointment from "../models/Appointment.js";

// ── GET /api/users — solo admin, devuelve todos los clientes ─────────────────
export async function getUsers(req, res) {
  try {
    const users = await User.find({ rol: "cliente", verificado: true }).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    console.error("Error al obtener usuarios:", err);
    res.status(500).json({ mensaje: "Error al obtener usuarios." });
  }
}

// ── DELETE /api/users/:id — solo admin, elimina el documento de MongoDB ──────
export async function deleteUser(req, res) {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ mensaje: "Usuario no encontrado." });
    }
    res.json({ mensaje: "Usuario eliminado correctamente." });
  } catch (err) {
    console.error("Error al eliminar usuario:", err);
    res.status(500).json({ mensaje: "Error al eliminar usuario." });
  }
}

// ── PATCH /api/users/:id — solo admin, actualiza campos del cliente ──────────
export async function updateUser(req, res) {
  try {
    const { notas, listaNegraActiva, nombre, telefono, correo } = req.body;
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ mensaje: "Usuario no encontrado." });

    // Validar unicidad solo si el campo cambia
    if (correo && correo !== user.correo) {
      const existe = await User.findOne({ correo, _id: { $ne: id } });
      if (existe) return res.status(409).json({ campo: "correo", mensaje: "Este correo ya está en uso." });
    }
    if (telefono && telefono !== user.telefono) {
      const existe = await User.findOne({ telefono, _id: { $ne: id } });
      if (existe) return res.status(409).json({ campo: "telefono", mensaje: "Este teléfono ya está en uso." });
    }

    const oldTelefono = user.telefono;

    // Construir patch solo con campos presentes en el body
    const patch = {};
    if (nombre            !== undefined) patch.nombre            = nombre;
    if (telefono          !== undefined) patch.telefono          = telefono;
    if (correo            !== undefined) patch.correo            = correo;
    if (notas             !== undefined) patch.notas             = notas;
    if (listaNegraActiva  !== undefined) patch.listaNegraActiva  = listaNegraActiva;

    Object.assign(user, patch);
    await user.save();

    // Cascada de teléfono a citas
    let citasActualizadas = 0;
    if (telefono && telefono !== oldTelefono) {
      const result = await Appointment.updateMany(
        { clienteTelefono: oldTelefono },
        { $set: { clienteTelefono: telefono } }
      );
      citasActualizadas = result.modifiedCount;
    }

    res.json({ user, citasActualizadas });
  } catch (err) {
    console.error("Error al actualizar usuario:", err);
    res.status(500).json({ mensaje: "Error al actualizar usuario." });
  }
}
