# Skill: Async Patterns

## Controller function template

```js
export async function createX(req, res) {
  try {
    const { field1, field2 } = req.body;
    const item = await Model.create({ field1, field2 });
    res.status(201).json({ item });
  } catch {
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

export async function updateX(req, res) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const item = await Model.findByIdAndUpdate(id, updates, { new: true }).lean();
    if (!item) return res.status(404).json({ mensaje: "No encontrado." });
    res.json({ item });
  } catch {
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}

export async function deleteX(req, res) {
  try {
    const { id } = req.params;
    const deleted = await Model.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ mensaje: "No encontrado." });
    res.json({ mensaje: "Eliminado." });
  } catch {
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}
```

## Fire-and-forget email

```js
// CORRECT — never blocks response
emailService.sendConfirmation(data).catch(() => {});

// WRONG — blocks response if email fails
await emailService.sendConfirmation(data);
```

## Early return pattern

```js
// Prefer early returns over nesting
const user = await User.findById(id).lean();
if (!user) return res.status(404).json({ mensaje: "No encontrado." });
if (user.listaNegraActiva) return res.status(403).json({ mensaje: "Acceso denegado." });
// continue with happy path
```
