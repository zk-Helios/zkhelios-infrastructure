import { PublicKey } from "@solana/web3.js";
import { findProofAccountPDA } from "@/lib/anchor";
import { PROGRAM_ID } from "@/lib/solana";
import { groth16ToSolana } from "./format";
import { makeSignature } from "@/lib/mock/solana";
import type { ProofBundle, SolanaProofArgs } from "./types";

export type SubmitStage = "building" | "sending" | "confirmed" | "finalized" | "error";

export interface SubmitProgress {
  stage: SubmitStage;
  signature?: string;
  proofAccount?: string;
  message: string;
}

const SYSTEM_PROGRAM = "11111111111111111111111111111111";

/**
 * Submits a proof to the zkHelios verifier program.
 *
 * The Anchor program isn't deployed yet (Session 6), so when PROGRAM_ID is the
 * placeholder we SIMULATE the transaction lifecycle. Once a real program id is
 * configured, build + send the real instruction (sketch below):
 *
 *   const args = groth16ToSolana(bundle.proof, bundle.publicSignals);
 *   const [proofPda] = findProofAccountPDA(wallet.publicKey, nonce);
 *   await program.methods
 *     .verifyProof(circuitId, args.proofA, args.proofB, args.proofC, args.publicInputs)
 *     .accounts({ user, proofAccount: proofPda, verifierConfig, systemProgram })
 *     .rpc({ commitment: "confirmed" });
 */
export async function submitProof(
  bundle: ProofBundle,
  authority: PublicKey,
  onProgress: (p: SubmitProgress) => void,
): Promise<{ signature: string; proofAccount: string; args: SolanaProofArgs }> {
  const args = groth16ToSolana(bundle.proof, bundle.publicSignals);
  const nonce = BigInt(Date.now());
  const [proofPda] = findProofAccountPDA(authority, nonce);
  const proofAccount = proofPda.toBase58();

  onProgress({ stage: "building", message: "Building transaction…", proofAccount });
  await wait(700);

  const isPlaceholder = PROGRAM_ID.toBase58() === SYSTEM_PROGRAM;
  if (!isPlaceholder) {
    // Real submission path would run here once the program is deployed.
    throw new Error("On-chain submission requires the deployed program (Session 6).");
  }

  const signature = makeSignature();
  onProgress({ stage: "sending", message: "Sending transaction…", signature, proofAccount });
  await wait(1100);
  onProgress({ stage: "confirmed", message: "Confirmed on Solana", signature, proofAccount });
  await wait(1200);
  onProgress({ stage: "finalized", message: "Finalized", signature, proofAccount });

  return { signature, proofAccount, args };
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
