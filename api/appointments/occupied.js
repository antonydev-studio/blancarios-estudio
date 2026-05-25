import { connectDB } from "../../lib/mongoose.js";
import { getOccupiedSlots } from "../../controllers/appointmentController.js";

export default async function handler(req, res) {
  await connectDB();

  const url = new URL(req.url, "http://localhost");
  req.query = Object.fromEntries(url.searchParams);

  if (req.method === "GET") {
    return getOccupiedSlots(req, res);
  }

  res.status(405).json({ mensaje: "Método no permitido." });
}
