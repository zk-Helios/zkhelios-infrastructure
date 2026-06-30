import type { Groth16Proof, SolanaProofArgs } from "./types";

/** Decimal field element → 32-byte big-endian array. */
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

/** snarkjs Groth16 proof → Anchor `verify_proof` byte layout. */
export function groth16ToSolana(proof: Groth16Proof, publicSignals: string[]): SolanaProofArgs {
  return {
    proofA: [...fieldToBytes32(proof.pi_a[0]), ...fieldToBytes32(proof.pi_a[1])],
    proofB: [
      ...fieldToBytes32(proof.pi_b[0][0]),
      ...fieldToBytes32(proof.pi_b[0][1]),
      ...fieldToBytes32(proof.pi_b[1][0]),
      ...fieldToBytes32(proof.pi_b[1][1]),
    ],
    proofC: [...fieldToBytes32(proof.pi_c[0]), ...fieldToBytes32(proof.pi_c[1])],
    publicInputs: publicSignals.map(fieldToBytes32),
  };
}
