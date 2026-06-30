import { PublicKey } from "@solana/web3.js";

/**
 * Stricter pubkey validation (Session 10 hardening): valid base58 AND a point on
 * the ed25519 curve. Catches off-curve keys that can't have a private key.
 * Kept out of test-imported modules so vitest doesn't pull in @solana/web3.js.
 */
export function isOnCurvePubkey(value: string): boolean {
  try {
    const key = new PublicKey(value);
    return PublicKey.isOnCurve(key.toBytes());
  } catch {
    return false;
  }
}
