import type Redis from "ioredis";
import { cached, cacheKey, TTL } from "../lib/cache";

export const SOL_MINT = "So11111111111111111111111111111111111111112";

const FALLBACK: Record<string, number> = {
  [SOL_MINT]: 152.4,
  EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: 1, // USDC
};

/**
 * USD prices for a set of mints via Jupiter Price API V2, cached 60s in Redis,
 * with a static fallback so the endpoint never hard-fails.
 */
export async function getPrices(redis: Redis, mints: string[]): Promise<Record<string, number>> {
  const ids = Array.from(new Set([SOL_MINT, ...mints])).sort();
  return cached(redis, cacheKey("prices", ids.join(",")), TTL.prices, async () => {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(`https://lite-api.jup.ag/price/v2?ids=${ids.join(",")}`, {
        signal: controller.signal,
      });
      clearTimeout(t);
      if (!res.ok) throw new Error(`jupiter ${res.status}`);
      const json = (await res.json()) as { data?: Record<string, { price?: string }> };
      const out: Record<string, number> = {};
      for (const id of ids) out[id] = Number(json.data?.[id]?.price ?? FALLBACK[id] ?? 0);
      return out;
    } catch {
      return Object.fromEntries(ids.map((id) => [id, FALLBACK[id] ?? 0]));
    }
  });
}
