import { connectDB } from "../../../lib/mongoose.js";
import { requireAuth } from "../../../middleware/auth.js";
import { patchClienteAppointment } from "../../../controllers/appointmentController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const id = url.pathname.replace(/^\/api\/appointments\/mias\//, "").replace(/\/$/, "");
  req.params = { id };

  if (req.method === "PATCH") {
    return requireAuth(req, res, () => patchClienteAppointment(req, res));
  }

  res.status(405).json({ mensaje: "Método no permitido." });
}
