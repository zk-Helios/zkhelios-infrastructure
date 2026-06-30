export type SearchKind = "signature" | "pubkey" | "slot" | "proof" | "unknown";

const BASE58 = /^[1-9A-HJ-NP-Za-km-z]+$/;

/** Detect the kind of a universal-search query (pure — unit tested). */
export function classifyQuery(q: string): { kind: SearchKind; value: string } {
  const value = q.trim();
  if (!value) return { kind: "unknown", value };
  if (/^\d+$/.test(value)) return { kind: "slot", value };
  if (!BASE58.test(value)) return { kind: "unknown", value };
  if (value.length >= 80 && value.length <= 90) return { kind: "signature", value };
  if (value.length >= 32 && value.length <= 44) return { kind: "pubkey", value };
  if (value.length >= 8 && value.length < 32) return { kind: "proof", value };
  return { kind: "unknown", value };
}
