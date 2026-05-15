# Rule: API Response Standards

## Response format — copy exactly

```js
// Success — singular resource
res.json({ appointment })
res.json({ user })
res.json({ service })
res.json({ config })

// Success — array
res.json({ appointments })
res.json({ users })
res.json({ services })

// Created
res.status(201).json({ service })
res.status(201).json({ appointment })

// Errors — always in Spanish
res.status(400).json({ mensaje: "Mensaje de error en español." })
res.status(401).json({ mensaje: "No autorizado." })
res.status(403).json({ mensaje: "Acceso denegado." })
res.status(404).json({ mensaje: "No encontrado." })
res.status(405).json({ mensaje: "Método no permitido." })
res.status(409).json({ mensaje: "Conflicto de horario." })
res.status(500).json({ mensaje: "Error interno del servidor." })
```

## Error messages

- Always in Spanish
- End with period
- Use `mensaje` key — never `error`, `message`, or `msg`

## Handler async pattern

```js
export async function getX(req, res) {
  try {
    const item = await Model.findById(req.query.id).lean();
    if (!item) return res.status(404).json({ mensaje: "No encontrado." });
    res.json({ item });
  } catch {
    res.status(500).json({ mensaje: "Error interno del servidor." });
  }
}
```

- `try/catch` in every controller function
- `catch` block takes no argument (avoid unused var lint error)
- Never `console.log` in production controllers
- Fire-and-forget emails: `emailService.send(...).catch(() => {})` — never `await` emails in handlers
