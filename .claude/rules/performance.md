# Rule: Performance Standards

## MongoDB

- `.lean()` on all read-only queries
- `.select("-contrasena -__v")` to trim payloads
- Index fields used in `find()` filters (userId, fecha, correo)
- Avoid `Model.find({})` on large collections — always filter

## Serverless cold starts

- Minimize top-level `await` in module scope
- Imports at module top (not inside functions)
- `global.mongoose` cache prevents reconnection on warm invocations
- Keep handler files lean — no barrel imports

## React

- Lazy-load routes with `React.lazy()` + `Suspense`
- No unnecessary re-renders — memo only when profiling confirms issue
- Images: use WebP, explicit `width`/`height`
- Avoid large inline objects/arrays in JSX props (referential equality)

## Bundle

- Vite handles code splitting automatically per route
- No lodash — use native array/object methods
- No moment.js — use native `Date` or `Intl`
- Tailwind CSS 4 purges unused styles automatically

## API responses

- Never return entire documents when a subset suffices
- Paginate large lists (appointments, movements, users)
- Email sending: always fire-and-forget — never block response

## Vercel Function limits

- Max execution: 300s (Fluid Compute)
- Max payload: 4.5MB
- Max memory: 1024MB (default)
- Keep handlers under 50ms for booking-critical paths
