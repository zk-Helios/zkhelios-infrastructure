import { DocPage } from "@/components/doc-page";
import { CodeBlock } from "@/components/code-block";

export const metadata = { title: "Account model" };

export default function AccountModel() {
  return (
    <DocPage title="Account model" lead="The PDAs the zkHelios verifier program uses to store config, circuits, users, and proofs.">
      <h2 id="pdas">Program-derived addresses</h2>
      <CodeBlock
        lang="text"
        code={`VerifierConfig   seeds: ["verifier_config"]                   (singleton)
CircuitRegistry  seeds: ["circuit", circuit_id u32 LE]        (per circuit)
UserAccount      seeds: ["user", authority]                   (per user)
ProofAccount     seeds: ["proof", authority, nonce u64 LE]    (per proof)`}
      />

      <h2 id="proof-account">ProofAccount</h2>
      <p>Each verified proof writes a <code>ProofAccount</code> attestation:</p>
      <CodeBlock
        lang="rust"
        code={`pub struct ProofAccount {
    pub authority: Pubkey,
    pub circuit_id: u32,
    pub proof_type: ProofType,
    pub public_inputs: Vec<[u8; 32]>, // max 8
    pub proof_hash: [u8; 32],
    pub verified: bool,
    pub verified_at: i64,
    pub slot_verified: u64,
    pub bump: u8,
}`}
      />

      <h2 id="rent">Rent</h2>
      <p>
        Proof accounts are rent-exempt and owned by the verifier program. The author can close their
        own <code>ProofAccount</code> to reclaim rent once it&apos;s no longer needed.
      </p>
    </DocPage>
  );
}
