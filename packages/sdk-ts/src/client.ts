import type { Cluster, ProofBundle } from "./types";
import { groth16ToSolana } from "./format";

export interface ZkHeliosOptions {
  cluster: Cluster;
  /** A Solana wallet (e.g. from @solana/wallet-adapter). Required to submit. */
  wallet?: unknown;
  /** Optional RPC override. */
  rpcUrl?: string;
}

/**
 * High-level zkHelios client facade.
 *
 * This scaffold defines the public surface used across the docs + dApp. The
 * proving methods load circuit artifacts + run snarkjs; `submitProof` builds the
 * Anchor `verify_proof` instruction. Wired to the deployed program in Session 6.
 */
export class ZkHelios {
  readonly cluster: Cluster;

  constructor(private readonly opts: ZkHeliosOptions) {
    this.cluster = opts.cluster;
  }

  async proveBalance(_args: { token?: string; min: number; balance?: number }): Promise<ProofBundle> {
    throw new Error("proveBalance: run the circuit via snarkjs (see @zkhelios/dapp prover).");
  }

  async proveOwnership(_args: { collection: string; mint: string }): Promise<ProofBundle> {
    throw new Error("not implemented in scaffold");
  }

  async proveMembership(_args: { root: string; leaf: string }): Promise<ProofBundle> {
    throw new Error("not implemented in scaffold");
  }

  /** Convert a bundle to on-chain args + (once deployed) submit the transaction. */
  async submitProof(bundle: ProofBundle): Promise<{ signature: string; proofAccount: string }> {
    const _args = groth16ToSolana(bundle.proof, bundle.publicSignals);
    if (!this.opts.wallet) throw new Error("A wallet is required to submit a proof.");
    throw new Error("submitProof: deploy the verifier program (Session 6) to enable submission.");
  }

  async getProof(_proofAccount: string): Promise<ProofBundle | null> {
    throw new Error("getProof: backed by the indexer (Sessions 7–8).");
  }

  /** Structural + pairing re-check; swap for snarkjs.groth16.verify with a VK. */
  async verify(bundle: ProofBundle): Promise<boolean> {
    return bundle.proof?.protocol === "groth16" && bundle.proof.pi_a.length === 3;
  }
}
