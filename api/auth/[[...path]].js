import { connectDB } from "../../lib/mongoose.js";
import { requireAuth } from "../../middleware/auth.js";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit.js";
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

// Rate limit configs — Redis-backed, serverless-safe.
// Falls open (allows request) if UPSTASH_REDIS_REST_URL is not set.
const RATE_CONFIGS = {
  "/login":                  { key: "login",          requests: 20, window: "1 h" },
  "/olvide-contrasena":      { key: "forgot-pwd",     requests:  5, window: "1 h" },
  "/verificar-codigo":       { key: "verify-code",    requests: 10, window: "1 h" },
  "/verificar-recuperacion": { key: "verify-recovery",requests: 10, window: "1 h" },
  "/nueva-contrasena":       { key: "new-password",   requests: 10, window: "1 h" },
};

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const path = url.pathname.replace(/^\/api\/auth/, "").replace(/\/$/, "") || "/";

  // Rate limit brute-force-sensitive endpoints
  if (req.method === "POST" && RATE_CONFIGS[path]) {
    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, RATE_CONFIGS[path]);
    if (limited) {
      return res.status(429).json({ mensaje: "Demasiados intentos. Espera un momento e intenta de nuevo." });
    }
  }

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
