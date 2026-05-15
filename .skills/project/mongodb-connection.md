# Skill: MongoDB Cached Connection

## lib/mongoose.js — complete file

```js
import mongoose from "mongoose";

let cached = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGO_URI, {
      bufferCommands: false,
    });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
```

## Usage in handler

```js
import { connectDB } from "../../lib/mongoose.js";

export default async function handler(req, res) {
  await connectDB();  // always first line
  // ...
}
```

## Why this pattern

Vercel Functions may reuse the same Node.js process across requests (warm invocations).
`global.mongoose` persists across invocations — avoids creating new connection every request.
Atlas M0 has 100 connection limit — this prevents exhaustion.

## Model safety pattern

```js
// models/ModelName.js
import mongoose from "mongoose";

const schema = new mongoose.Schema({
  // fields
});

export default mongoose.models.ModelName || mongoose.model("ModelName", schema);
```

The `mongoose.models.ModelName ||` guard prevents "Cannot overwrite model once compiled" error
on warm Vercel Function invocations.
