import { connectDB } from "../../lib/mongoose.js";
import { requireAuth, requireAdmin } from "../../middleware/auth.js";
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

  // Extract id from /mias/:id  (two-segment client patch)
  const miasId = path.match(/^\/mias\/([^/]+)$/)?.[1];
  // Extract id from /:id  (single-segment)
  const id = !miasId ? path.match(/^\/([^/]+)$/)?.[1] : undefined;

  if (miasId) req.params = { id: miasId };
  else if (id) req.params = { id };

  // POST /  — public booking
  if (req.method === "POST" && path === "/") return createAppointment(req, res);

  // GET specific named routes — MUST come before /:id catch-all
  if (req.method === "GET" && path === "/occupied")        return getOccupiedSlots(req, res);
  if (req.method === "GET" && path === "/mias")            return requireAuth(req, res, () => getMisAppointments(req, res));
  if (req.method === "GET" && path === "/auto-finalizar")  return requireAdmin(req, res, () => autoFinalizarCitas(req, res));

  // PATCH /mias/:id — client reschedule/cancel
  if (req.method === "PATCH" && miasId) return requireAuth(req, res, () => patchClienteAppointment(req, res));

  // Admin routes
  if (req.method === "GET"    && !id)  return requireAdmin(req, res, () => getAllAppointments(req, res));
  if (req.method === "PATCH"  && id)   return requireAdmin(req, res, () => updateAppointment(req, res));
  if (req.method === "DELETE" && id)   return requireAdmin(req, res, () => deleteAppointment(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
