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

// In-memory rate limiter — provides protection within a single warm Vercel
// function instance. Does not persist across cold starts or concurrent instances.
// For full cross-instance protection, replace with Vercel KV-backed middleware.
const RATE_MAP = new Map();
const RATE_WINDOW_MS = 15 * 60 * 1000; // 15 min
const RATE_MAX = 20; // max attempts per endpoint per IP per window

function isRateLimited(ip, endpoint) {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();
  const hits = (RATE_MAP.get(key) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now);
  RATE_MAP.set(key, hits);
  // Evict stale entries when map grows large to prevent unbounded memory use
  if (RATE_MAP.size > 5000) {
    for (const [k, v] of RATE_MAP) {
      if (v.every((t) => now - t > RATE_WINDOW_MS)) RATE_MAP.delete(k);
    }
  }
  return false;
}

const RATE_LIMITED_PATHS = new Set(["/login", "/verificar-codigo", "/verificar-recuperacion", "/nueva-contrasena"]);

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const path = url.pathname.replace(/^\/api\/auth/, "").replace(/\/$/, "") || "/";

  // Rate limit brute-force-sensitive endpoints
  if (req.method === "POST" && RATE_LIMITED_PATHS.has(path)) {
    const ip = (req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() || "unknown";
    if (isRateLimited(ip, path)) {
      return res.status(429).json({ mensaje: "Demasiados intentos. Espera 15 minutos e intenta de nuevo." });
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
