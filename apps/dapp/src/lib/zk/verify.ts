import { isWellFormedProof } from "./format";
import type { Groth16Proof } from "./types";
import { decodeProof, type SharedProof } from "./share";

export interface VerifyResult {
  valid: boolean;
  source: "onchain" | "offchain";
  kind?: string;
  circuitName?: string;
  publicInputs?: Record<string, string>;
  publicSignals?: string[];
  proof?: Groth16Proof;
  author?: string;
  signature?: string;
  verifiedAt?: number;
  error?: string;
}

function looksLikeSignature(q: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(q);
}
function looksLikePubkey(q: string) {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(q);
}

/**
 * Off-chain verification of a pasted/shared proof. Re-runs the structural +
 * (mock) pairing check client-side. Real snarkjs `groth16.verify(vk, …)` drops
 * in here once verifying keys are published.
 */
export async function verifyOffchain(payload: SharedProof | string): Promise<VerifyResult> {
  await new Promise((r) => setTimeout(r, 600));
  const shared = typeof payload === "string" ? decodeProof(payload) : payload;
  if (!shared || !isWellFormedProof(shared.proof)) {
    return { valid: false, source: "offchain", error: "Malformed proof JSON." };
  }
  // Mock pairing check: structurally valid proofs pass. (Swap for snarkjs.verify.)
  return {
    valid: true,
    source: "offchain",
    kind: shared.kind,
    circuitName: shared.circuitName,
    publicInputs: shared.publicInputs,
    publicSignals: shared.publicSignals,
    proof: shared.proof,
  };
}

/**
 * Look up a proof on-chain by ProofAccount / signature / id. The indexer
 * (Sessions 6–8) backs this; for now it resolves from local proof history when
 * the query matches, else reports not found.
 */
export async function verifyOnchain(
  query: string,
  finder: (q: string) => Promise<VerifyResult | null>,
): Promise<VerifyResult> {
  await new Promise((r) => setTimeout(r, 700));
  const trimmed = query.trim();
  if (!trimmed) return { valid: false, source: "onchain", error: "Enter a proof account, signature, or proof ID." };

  const found = await finder(trimmed);
  if (found) return found;

  const hint = looksLikeSignature(trimmed)
    ? "No proof found for that signature."
    : looksLikePubkey(trimmed)
      ? "No proof account found at that address."
      : "No proof found for that ID.";
  return { valid: false, source: "onchain", error: hint };
}
