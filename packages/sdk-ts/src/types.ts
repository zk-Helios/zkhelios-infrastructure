export type Cluster = "mainnet-beta" | "devnet" | "localnet";
export type ProofKind = "balance" | "ownership" | "age" | "membership" | "custom";

export interface Groth16Proof {
  pi_a: [string, string, string];
  pi_b: [[string, string], [string, string], [string, string]];
  pi_c: [string, string, string];
  protocol: "groth16";
  curve: "bn128";
}

export interface ProofBundle {
  kind: ProofKind;
  circuitName: string;
  proof: Groth16Proof;
  publicSignals: string[];
  publicInputs: Record<string, string>;
}

export interface SolanaProofArgs {
  proofA: number[];
  proofB: number[];
  proofC: number[];
  publicInputs: number[][];
}
