import jwt from "jsonwebtoken";
import { connectDB } from "../lib/mongoose.js";
import User from "../models/User.js";

export async function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "No autorizado — token requerido." });
  }

  const token = header.split(" ")[1];

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ mensaje: "Token inválido o expirado." });
  }

  try {
    await connectDB();
    const usuario = await User.findById(decoded.id).select("-contrasena").lean();
    if (!usuario) {
      return res.status(401).json({ mensaje: "Usuario no válido." });
    }
    req.usuario = usuario;
    next();
  } catch {
    return res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

export function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.usuario.rol !== "admin") {
      return res.status(403).json({ mensaje: "Acceso restringido a administradores." });
    }
    next();
  });
}