import { connectDB } from "../../lib/mongoose.js";
import { requireAdmin } from "../../middleware/auth.js";
import { getConfig, updateConfig } from "../../controllers/configController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);

  if (req.method === "GET")   return getConfig(req, res);
  if (req.method === "PATCH") return requireAdmin(req, res, () => updateConfig(req, res));

  res.status(405).json({ mensaje: "Método no permitido." });
}
