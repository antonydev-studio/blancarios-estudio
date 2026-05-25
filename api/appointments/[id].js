import { connectDB } from "../../lib/mongoose.js";
import { requireAdmin } from "../../middleware/auth.js";
import {
  updateAppointment,
  deleteAppointment,
} from "../../controllers/appointmentController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const id = url.pathname.replace(/^\/api\/appointments\//, "").replace(/\/$/, "");
  req.params = { id };

  if (req.method === "PATCH") {
    return requireAdmin(req, res, () => updateAppointment(req, res));
  }
  if (req.method === "DELETE") {
    return requireAdmin(req, res, () => deleteAppointment(req, res));
  }

  res.status(405).json({ mensaje: "Método no permitido." });
}
