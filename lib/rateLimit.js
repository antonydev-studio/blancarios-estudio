import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

let redis = null;
const limiters = {};

function getRedis() {
  if (!redis && process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redis = new Redis({
      url:   process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }
  return redis;
}

function getLimiter(key, requests, window) {
  if (!limiters[key]) {
    const r = getRedis();
    if (!r) return null;
    limiters[key] = new Ratelimit({
      redis:   r,
      limiter: Ratelimit.slidingWindow(requests, window),
      prefix:  `rl:${key}`,
    });
  }
  return limiters[key];
}

/**
 * Check rate limit for an identifier (typically IP).
 * Returns { limited: boolean }.
 * Fails open (allows request) if Redis is not configured, so the app
 * works without Upstash set up. Warns in production if unconfigured.
 */
export async function checkRateLimit(identifier, { key, requests, window }) {
  const limiter = getLimiter(key, requests, window);

  if (!limiter) {
    if (process.env.NODE_ENV === "production") {
      console.warn(`⚠️  Rate limiter not active for "${key}" — set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN`);
    }
    return { limited: false };
  }

  try {
    const { success } = await limiter.limit(identifier);
    return { limited: !success };
  } catch (err) {
    console.error(`Rate limiter error (${key}):`, err.message);
    return { limited: false };
  }
}

export function getClientIp(req) {
  return (req.headers["x-forwarded-for"] ?? "").split(",")[0].trim() || "unknown";
}
