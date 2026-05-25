import { connectDB } from "../../lib/mongoose.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
import { checkRateLimit, getClientIp } from "../../lib/rateLimit.js";
import {
  createAppointment,
  getMisAppointments,
  getOccupiedSlots,
  getAllAppointments,
  updateAppointment,
  deleteAppointment,
  patchClienteAppointment,
  autoFinalizarCitas,
} from "../../controllers/appointmentController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const path = url.pathname.replace(/^\/api\/appointments/, "").replace(/\/$/, "") || "/";

  const miasId = path.match(/^\/mias\/([^/]+)$/)?.[1] || req.query.miasId;
  const id = !miasId ? path.match(/^\/([^/]+)$/)?.[1] || req.query.id : undefined;

  if (miasId) req.params = { id: miasId };
  else if (id) req.params = { id };

  if (req.method === "POST" && path === "/") {
    const ip = getClientIp(req);
    const { limited } = await checkRateLimit(ip, { key: "booking", requests: 5, window: "1 h" });
    if (limited) {
      return res.status(429).json({ mensaje: "Demasiadas solicitudes. Espera un momento e intenta de nuevo." });
    }
    return createAppointment(req, res);
  }

  if (req.method === "GET" && (path === "/occupied" || req.query.action === "occupied")) {
    return getOccupiedSlots(req, res);
  }
  if (req.method === "GET" && (path === "/mias" || req.query.action === "mias")) {
    return requireAuth(req, res, () => getMisAppointments(req, res));
  }
  if (req.method === "GET" && (path === "/auto-finalizar" || req.query.action === "auto-finalizar")) {
    return requireAdmin(req, res, () => autoFinalizarCitas(req, res));
  }

  if (req.method === "PATCH" && miasId) {
    return requireAuth(req, res, () => patchClienteAppointment(req, res));
  }

  if (req.method === "GET" && !id) return requireAdmin(req, res, () => getAllAppointments(req, res));
  if (req.method === "PATCH" && id) return requireAdmin(req, res, () => updateAppointment(req, res));
  if (req.method === "DELETE" && id) return requireAdmin(req, res, () => deleteAppointment(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
