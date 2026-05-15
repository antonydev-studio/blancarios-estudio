import { connectDB } from "../../lib/mongoose.js";
import { requireAdmin } from "../../middleware/auth.js";
import {
  getBlockedClients,
  createBlockedClient,
  toggleBlockedClient,
  deleteBlockedClient,
} from "../../controllers/blockedClientController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const path = url.pathname.replace(/^\/api\/blocked-clients/, "").replace(/\/$/, "") || "/";
  const id = path.match(/^\/([^/]+)$/)?.[1];
  if (id) req.params = { id };

  if (req.method === "GET"    && !id) return requireAdmin(req, res, () => getBlockedClients(req, res));
  if (req.method === "POST"   && !id) return requireAdmin(req, res, () => createBlockedClient(req, res));
  if (req.method === "PATCH"  && id)  return requireAdmin(req, res, () => toggleBlockedClient(req, res));
  if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => deleteBlockedClient(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
