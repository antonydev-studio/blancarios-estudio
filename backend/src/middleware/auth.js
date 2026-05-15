import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ mensaje: "No autorizado — token requerido." });
  }

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded; // { id, rol } disponible en todos los controllers
    next();
  } catch {
    return res.status(401).json({ mensaje: "Token inválido o expirado." });
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