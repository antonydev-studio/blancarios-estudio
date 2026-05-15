import { connectDB } from "../../lib/mongoose.js";
import { requireAdmin } from "../../middleware/auth.js";
import {
  getMovements,
  createMovement,
  deleteMovement,
} from "../../controllers/movementController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const path = url.pathname.replace(/^\/api\/movements/, "").replace(/\/$/, "") || "/";
  const id = path.match(/^\/([^/]+)$/)?.[1];
  if (id) req.params = { id };

  if (req.method === "GET"    && !id) return requireAdmin(req, res, () => getMovements(req, res));
  if (req.method === "POST"   && !id) return requireAdmin(req, res, () => createMovement(req, res));
  if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => deleteMovement(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
