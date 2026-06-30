import type Redis from "ioredis";

/**
 * Versioned cache keys + a read-through helper. Bump CACHE_VERSION to invalidate
 * everything at once.
 */
const CACHE_VERSION = "v1";

export const cacheKey = (...parts: (string | number)[]) => `cache:${CACHE_VERSION}:${parts.join(":")}`;

export const TTL = {
  block: 3600, // immutable once confirmed
  transaction: 3600, // immutable once confirmed
  statsOverview: 30,
  timeseries: 60,
  circuits: 300,
  profile: 60,
  prices: 60,
} as const;

/** Read-through cache: return cached JSON or compute, store, and return. */
export async function cached<T>(
  redis: Redis,
  key: string,
  ttlSeconds: number,
  compute: () => Promise<T>,
): Promise<T> {
  try {
    const hit = await redis.get(key);
    if (hit) return JSON.parse(hit) as T;
  } catch {
    /* cache miss / redis down → fall through to compute */
  }
  const value = await compute();
  redis.set(key, JSON.stringify(value), "EX", ttlSeconds).catch(() => {});
  return value;
}
