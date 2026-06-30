import { DocPage } from "@/components/doc-page";
import { CodeBlock } from "@/components/code-block";

export const metadata = { title: "Program reference" };

export default function ProgramReference() {
  return (
    <DocPage title="Program reference" lead="Instructions, accounts, and error codes for the zkHelios Anchor verifier program.">
      <h2 id="instructions">Instructions</h2>
      <ul>
        <li><code>initialize(admin, treasury, proof_fee_lamports)</code></li>
        <li><code>register_circuit(circuit_id, name, proof_type, verifying_key, public_input_count)</code></li>
        <li><code>create_user_account()</code></li>
        <li><code>verify_proof(circuit_id, proof_a, proof_b, proof_c, public_inputs)</code></li>
        <li><code>revoke_proof()</code></li>
        <li><code>update_config(new_fee?, new_paused?, new_treasury?)</code></li>
      </ul>

      <h2 id="verify-proof">verify_proof</h2>
      <CodeBlock
        lang="rust"
        code={`verify_proof(
    circuit_id: u32,
    proof_a: [u8; 64],
    proof_b: [u8; 128],
    proof_c: [u8; 64],
    public_inputs: Vec<[u8; 32]>, // max 8
)
// accounts: user (signer), proof_account (PDA), verifier_config (PDA), system_program`}
      />

      <h2 id="errors">Error codes</h2>
      <CodeBlock
        lang="text"
        code={`6000 ProgramPaused          6007 Unauthorized
6001 CircuitNotFound        6008 InvalidAdmin
6002 CircuitDisabled        6010 NonceAlreadyUsed
6003 InvalidPublicInputCount 6011 InvalidVerifyingKey
6004 InvalidProofFormat     6012 ProofAlreadyExists
6005 ProofVerificationFailed
6006 InsufficientFunds`}
      />
    </DocPage>
  );
}
