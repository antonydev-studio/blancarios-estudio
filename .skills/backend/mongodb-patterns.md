# Skill: MongoDB Query Patterns

## Read patterns

```js
// Get all — lean for performance
const items = await Model.find({}).lean();

// Filter
const items = await Model.find({ userId, estado: "pendiente" }).lean();

// Exclude fields
const user = await User.findById(id).select("-contrasena -__v").lean();

// Get one, handle null
const item = await Model.findById(id).lean();
if (!item) return res.status(404).json({ mensaje: "No encontrado." });

// Sort + limit
const recent = await Model.find({}).sort({ createdAt: -1 }).limit(10).lean();
```

## Write patterns

```js
// Create
const item = await Model.create({ field1, field2 });
res.status(201).json({ item });

// Update — return new doc
const updated = await Model.findByIdAndUpdate(
  id,
  { $set: { field1 } },
  { new: true, runValidators: true }
).lean();

// Delete
const deleted = await Model.findByIdAndDelete(id).lean();
if (!deleted) return res.status(404).json({ mensaje: "No encontrado." });

// Upsert (Config singleton)
const config = await Config.findOneAndUpdate(
  { clave: "global" },
  { $set: updates },
  { new: true, upsert: true }
).lean();
```

## Date/period filtering

```js
// Today
const hoy = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"
const items = await Model.find({ fecha: hoy }).lean();

// This week
const inicio = getStartOfWeek();  // implement in utils/
const fin    = getEndOfWeek();
const items = await Model.find({ fecha: { $gte: inicio, $lte: fin } }).lean();
```

## Atlas M0 limits to respect

- No `$lookup` (joins) on large collections
- No transactions (`session`)
- No more than ~100 concurrent connections (cached pattern handles this)
- No large aggregation pipelines on M0
