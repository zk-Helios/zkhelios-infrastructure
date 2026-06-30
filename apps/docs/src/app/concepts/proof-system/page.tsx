import { DocPage } from "@/components/doc-page";
import { Callout } from "@/components/callout";

export const metadata = { title: "Proof system" };

export default function ProofSystem() {
  return (
    <DocPage title="Proof system" lead="A short primer on the Groth16 proofs zkHelios uses and how Solana verifies them.">
      <h2 id="groth16">Groth16</h2>
      <p>
        zkHelios uses Groth16 SNARKs over the BN254 (alt_bn128) pairing-friendly curve. Groth16
        proofs are tiny — three group elements, about 256 bytes — and cheap to verify, which is
        exactly what you want for on-chain verification on Solana.
      </p>
      <ul>
        <li><strong>A</strong> — a G1 point (2 × 32 bytes)</li>
        <li><strong>B</strong> — a G2 point (4 × 32 bytes)</li>
        <li><strong>C</strong> — a G1 point (2 × 32 bytes)</li>
      </ul>

      <h2 id="onchain">On-chain verification</h2>
      <p>
        The verifier computes <code>vk_x = ic[0] + Σ publicInputs[i]·ic[i+1]</code>, then runs a
        single pairing check: <code>e(A, B) == e(α, β) · e(vk_x, γ) · e(C, δ)</code>. On Solana this
        is one <code>sol_alt_bn128_pairing</code> syscall — the whole verification fits in ~200k CU,
        well under the 1.4M per-transaction cap.
      </p>

      <Callout variant="warning">
        Each circuit ships with a verifying key produced by a trusted setup. Production circuits
        should use a multi-party ceremony (e.g. Powers of Tau) — see <a href="/reference/circuits">Circuits</a>.
      </Callout>

      <h2 id="public-private">Public vs private inputs</h2>
      <p>
        Public inputs are committed in the proof and visible to the verifier (and on-chain). Private
        inputs (the witness) are used only to generate the proof and are never transmitted. The
        circuit defines which is which.
      </p>
    </DocPage>
  );
}
