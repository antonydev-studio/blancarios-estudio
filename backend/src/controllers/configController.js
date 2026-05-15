import Config from "../models/Config.js";

// ── GET /api/config — público, el frontend necesita horarios y días bloqueados ─
export async function getConfig(req, res) {
  try {
    let config = await Config.findOne({ clave: "global" });

    // Si no existe, crear el documento singleton con valores por defecto
    if (!config) {
      config = await Config.create({ clave: "global" });
    }

    res.json({ config });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al obtener configuración." });
  }
}

// ── PATCH /api/config — solo admin ───────────────────────────────────────────
export async function updateConfig(req, res) {
  try {
    const config = await Config.findOneAndUpdate(
      { clave: "global" },
      { $set: req.body },
      { returnDocument: 'after', upsert: true, runValidators: true }
    );
    res.json({ config });
  } catch (err) {
    console.error("Error al actualizar config:", err);
    res.status(500).json({ mensaje: "Error al actualizar configuración." });
  }
}