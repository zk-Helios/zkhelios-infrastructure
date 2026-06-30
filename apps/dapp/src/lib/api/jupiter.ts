import { MOCK_TOKENS } from "@/lib/mock/solana";

/**
 * Jupiter Price API V2 client with graceful fallback. Prices are best-effort;
 * if the network call fails (offline / rate-limited) we fall back to static
 * reference prices so the UI always renders a USD value.
 */

export const SOL_MINT = "So11111111111111111111111111111111111111112";

const FALLBACK: Record<string, number> = {
  [SOL_MINT]: 152.4,
  ...Object.fromEntries(MOCK_TOKENS.map((t) => [t.mint, t.usdPrice])),
};

/** Returns a map of mint → USD price. Never throws. */
export async function getPrices(mints: string[]): Promise<Record<string, number>> {
  const ids = Array.from(new Set([SOL_MINT, ...mints]));
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const res = await fetch(`https://lite-api.jup.ag/price/v2?ids=${ids.join(",")}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("price api error");
    const json = (await res.json()) as { data?: Record<string, { price?: string }> };
    const out: Record<string, number> = {};
    for (const id of ids) {
      const p = json.data?.[id]?.price;
      out[id] = p ? Number(p) : (FALLBACK[id] ?? 0);
    }
    return out;
  } catch {
    return Object.fromEntries(ids.map((id) => [id, FALLBACK[id] ?? 0]));
  }
}
