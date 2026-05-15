# Rule: MongoDB / Mongoose

## Cached connection — mandatory pattern

```js
// lib/mongoose.js — ONLY place to connect
import mongoose from "mongoose";
let cached = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, { bufferCommands: false });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

- Never call `mongoose.connect()` directly in any file other than `lib/mongoose.js`
- Always `await connectDB()` at the start of every handler
- `bufferCommands: false` — required for serverless

## Models

- One file per model in `models/`
- PascalCase filename: `Appointment.js`, `User.js`, `Config.js`
- Define schema + model in same file, export model as default
- Never redefine model if already compiled: `mongoose.models.X || mongoose.model("X", schema)`

```js
const schema = new mongoose.Schema({ ... });
export default mongoose.models.User || mongoose.model("User", schema);
```

## Queries

- Use `lean()` for read-only queries (returns plain objects, faster)
- Use `.select("-contrasena")` to exclude password from user queries
- Always handle `null` from `findById` — return 404

## Atlas M0 limits

- Max 100 connections — cached connection pattern prevents exhaustion
- No transactions (M0 doesn't support them)
- No `$lookup` on large collections
