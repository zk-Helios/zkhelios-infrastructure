import type { ProofKind } from "@/types";

/** Standard snarkjs Groth16 proof shape (BN254). */
export interface Groth16Proof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol: "groth16";
  curve: "bn128";
}

/** A complete proof bundle: proof + public signals + metadata. */
export interface ProofBundle {
  id: string;
  kind: ProofKind;
  circuitName: string;
  proof: Groth16Proof;
  publicSignals: string[];
  /** Human-labeled public inputs for display. */
  publicInputs: Record<string, string>;
  createdAt: number;
}

/** Solana-formatted proof — what the Anchor `verify_proof` instruction expects. */
export interface SolanaProofArgs {
  proofA: number[]; // 64 bytes (G1)
  proofB: number[]; // 128 bytes (G2)
  proofC: number[]; // 64 bytes (G1)
  publicInputs: number[][]; // each [u8; 32], big-endian
}

export type ProofStage =
  | "idle"
  | "witness"
  | "setup"
  | "prove"
  | "verify"
  | "format"
  | "done"
  | "error"
  | "cancelled";

export interface ProverProgress {
  stage: ProofStage;
  /** 0–100 */
  pct: number;
  message: string;
}

/** Persisted proof record (IndexedDB). */
export interface StoredProof {
  id: string;
  kind: ProofKind;
  circuitName: string;
  status: "completed" | "submitted" | "failed";
  proof: Groth16Proof;
  publicSignals: string[];
  publicInputs: Record<string, string>;
  /** present once submitted on-chain */
  signature?: string;
  proofAccount?: string;
  createdAt: number;
}
