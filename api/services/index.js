import { connectDB } from "../../lib/mongoose.js";
import { requireAdmin } from "../../middleware/auth.js";
import {
  getServices,
  createService,
  updateService,
  deleteService,
} from "../../controllers/serviceController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const path = url.pathname.replace(/^\/api\/services/, "").replace(/\/$/, "") || "/";
  const id = path.match(/^\/([^/]+)$/)?.[1];
  if (id) req.params = { id };

  if (req.method === "GET"    && !id) return getServices(req, res);
  if (req.method === "POST"   && !id) return requireAdmin(req, res, () => createService(req, res));
  if (req.method === "PATCH"  && id)  return requireAdmin(req, res, () => updateService(req, res));
  if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => deleteService(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
