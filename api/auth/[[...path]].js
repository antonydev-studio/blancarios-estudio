import { connectDB } from "../../lib/mongoose.js";
import { requireAuth } from "../../middleware/auth.js";
import {
  registro,
  verificarCodigo,
  reenviarCodigo,
  login,
  olvidéContrasena,
  verificarCodigoRecuperacion,
  nuevaContrasena,
  verificarSesion,
} from "../../controllers/authController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const path = url.pathname.replace(/^\/api\/auth/, "").replace(/\/$/, "") || "/";

  if (req.method === "POST" && path === "/registro")               return registro(req, res);
  if (req.method === "POST" && path === "/verificar-codigo")       return verificarCodigo(req, res);
  if (req.method === "POST" && path === "/reenviar-codigo")        return reenviarCodigo(req, res);
  if (req.method === "POST" && path === "/login")                  return login(req, res);
  if (req.method === "POST" && path === "/olvide-contrasena")      return olvidéContrasena(req, res);
  if (req.method === "POST" && path === "/verificar-recuperacion") return verificarCodigoRecuperacion(req, res);
  if (req.method === "POST" && path === "/nueva-contrasena")       return nuevaContrasena(req, res);
  if (req.method === "GET"  && path === "/me")                     return requireAuth(req, res, () => verificarSesion(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
