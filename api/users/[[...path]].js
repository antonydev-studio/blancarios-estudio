import { connectDB } from "../../lib/mongoose.js";
import { requireAdmin } from "../../middleware/auth.js";
import { getUsers, updateUser, deleteUser } from "../../controllers/userController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);
  const path = url.pathname.replace(/^\/api\/users/, "").replace(/\/$/, "") || "/";
  const id = path.match(/^\/([^/]+)$/)?.[1];
  if (id) req.params = { id };

  if (req.method === "GET"    && !id) return requireAdmin(req, res, () => getUsers(req, res));
  if (req.method === "PATCH"  && id)  return requireAdmin(req, res, () => updateUser(req, res));
  if (req.method === "DELETE" && id)  return requireAdmin(req, res, () => deleteUser(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
