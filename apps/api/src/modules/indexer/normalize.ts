import type { ProofType } from "@zkhelios/db";

const VALID: ProofType[] = ["BALANCE", "OWNERSHIP", "AGE", "MEMBERSHIP", "CUSTOM"];

/**
 * Normalize a proof type from any representation the indexer might see:
 * an Anchor enum object `{ balance: {} }`, or a string `"balance"`/`"BALANCE"`.
 * Pure — unit tested.
 */
export function normalizeProofType(raw: unknown): ProofType {
  let key: string | undefined;
  if (typeof raw === "string") key = raw;
  else if (raw && typeof raw === "object") key = Object.keys(raw as object)[0];
  const upper = (key ?? "").toUpperCase() as ProofType;
  return VALID.includes(upper) ? upper : "CUSTOM";
}

/** Coerce a value that may be a BN/bigint/number/string into a bigint. */
export function toBigInt(v: unknown): bigint {
  try {
    if (typeof v === "bigint") return v;
    if (typeof v === "number") return BigInt(Math.trunc(v));
    if (v && typeof v === "object" && "toString" in v) return BigInt((v as { toString(): string }).toString());
    return BigInt(String(v ?? 0));
  } catch {
    return 0n;
  }
}

/** Coerce a PublicKey-like value to base58. */
export function toBase58(v: unknown): string {
  if (typeof v === "string") return v;
  if (v && typeof v === "object" && "toBase58" in v) return (v as { toBase58(): string }).toBase58();
  return String(v ?? "");
}
