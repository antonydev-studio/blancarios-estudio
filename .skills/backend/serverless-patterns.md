# Skill: Serverless-Safe Patterns

## DO

```js
// Cache at module level (persists across warm invocations)
let cached = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

// Import at module top
import { connectDB } from "../../lib/mongoose.js";

// Stateless handlers
export default async function handler(req, res) {
  await connectDB();
  // handle request
  // send response
  // done — no lingering async
}
```

## DON'T

```js
// No in-memory state that changes per request
let requestCount = 0;  // WRONG — shared across invocations unpredictably
requestCount++;

// No server startup code
app.listen(3000);  // WRONG — no server

// No background tasks that outlast response
setTimeout(() => longTask(), 1000);  // WRONG — may be killed

// No process.exit()
process.exit(1);  // WRONG
```

## Body parsing

Vercel automatically parses JSON bodies. Access via `req.body` directly.
No `express.json()` needed.

## Headers

```js
// Read header
const auth = req.headers.authorization;
const contentType = req.headers["content-type"];

// Set response header
res.setHeader("Content-Type", "application/json");
```

## CORS

Vercel handles CORS automatically for same-project frontend.
For cross-origin requests, add to vercel.json:
```json
{
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://blancariosestudio.com" },
        { "key": "Access-Control-Allow-Methods", "value": "GET,POST,PATCH,DELETE,OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Authorization,Content-Type" }
      ]
    }
  ]
}
```
