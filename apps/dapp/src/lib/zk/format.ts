import type { Groth16Proof, SolanaProofArgs } from "./types";

/** Decimal field element → 32-byte big-endian array (BN254 field is < 2^254). */
export function fieldToBytes32(decimal: string): number[] {
  let n: bigint;
  try {
    n = BigInt(decimal);
  } catch {
    n = 0n;
  }
  const bytes = new Array<number>(32).fill(0);
  for (let i = 31; i >= 0 && n > 0n; i--) {
    bytes[i] = Number(n & 0xffn);
    n >>= 8n;
  }
  return bytes;
}

/**
 * Convert a snarkjs Groth16 proof → the byte layout the Anchor verifier expects.
 * G1 points (A, C) are 2×32 bytes; the G2 point (B) is 4×32 bytes.
 */
export function groth16ToSolana(proof: Groth16Proof, publicSignals: string[]): SolanaProofArgs {
  const proofA = [...fieldToBytes32(proof.pi_a[0]), ...fieldToBytes32(proof.pi_a[1])];
  const proofB = [
    ...fieldToBytes32(proof.pi_b[0][0]),
    ...fieldToBytes32(proof.pi_b[0][1]),
    ...fieldToBytes32(proof.pi_b[1][0]),
    ...fieldToBytes32(proof.pi_b[1][1]),
  ];
  const proofC = [...fieldToBytes32(proof.pi_c[0]), ...fieldToBytes32(proof.pi_c[1])];
  return {
    proofA,
    proofB,
    proofC,
    publicInputs: publicSignals.map(fieldToBytes32),
  };
}

/** Compact preview of a byte array as hex. */
export function bytesToHex(bytes: number[], max = 0): string {
  const hex = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return max && hex.length > max ? `${hex.slice(0, max)}…` : `0x${hex}`;
}

/** Structural sanity-check used by the Verify page's off-chain re-verification. */
export function isWellFormedProof(proof: unknown): proof is Groth16Proof {
  const p = proof as Groth16Proof;
  return (
    !!p &&
    p.protocol === "groth16" &&
    Array.isArray(p.pi_a) &&
    p.pi_a.length === 3 &&
    Array.isArray(p.pi_b) &&
    p.pi_b.length === 3 &&
    Array.isArray(p.pi_c) &&
    p.pi_c.length === 3
  );
}
