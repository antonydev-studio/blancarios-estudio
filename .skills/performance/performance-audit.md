# Skill: Performance Audit

## API response time targets

| Endpoint type | Target |
|--------------|--------|
| GET /api/services | <100ms warm |
| GET /api/config | <100ms warm |
| POST /api/auth/login | <200ms warm |
| POST /api/appointments | <300ms warm |
| GET /api/appointments | <200ms warm |

Cold start adds ~500ms on first invocation — acceptable.

## MongoDB query audit

```bash
# Find unindexed queries (check Atlas → Performance Advisor)
# Add indexes for frequently filtered fields:
```

```js
// models/Appointment.js — add indexes
const schema = new mongoose.Schema({...});
schema.index({ fecha: 1 });
schema.index({ userId: 1 });
schema.index({ estado: 1 });
```

## React bundle audit

```bash
pnpm run build
# Check dist/ output for large chunks

# Vite stats
pnpm dlx vite-bundle-visualizer
```

Large chunks to investigate:
- Any chunk >100KB (gzipped >30KB) is worth splitting
- Route-based code splitting handles pages automatically

## Tailwind CSS

Tailwind CSS 4 purges unused styles at build time — no action needed.
Check `dist/*.css` is under 20KB gzipped.

## Network audit (browser DevTools)

1. Open Network tab
2. Load app on 3G throttle
3. Check: LCP <2.5s, TBT <200ms, CLS <0.1
4. Largest assets: images > fonts > JS

## Image optimization

```jsx
// Add explicit dimensions to prevent CLS
<img
  src={url}
  alt="description"
  width={800}
  height={600}
  loading="lazy"
/>
```

Convert hero images to WebP for ~30% size reduction.

## MongoDB connection on cold start

Cold start = first invocation after idle period.
`global.mongoose` cache reduces connection overhead on warm invocations.
Nothing to optimize further without paid Atlas tier.
