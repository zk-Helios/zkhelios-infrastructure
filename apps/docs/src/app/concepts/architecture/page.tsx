import { DocPage } from "@/components/doc-page";
import { CodeBlock } from "@/components/code-block";

export const metadata = { title: "Architecture" };

export default function Architecture() {
  return (
    <DocPage title="Architecture" lead="How a statement becomes an on-chain attestation, end to end.">
      <p>zkHelios splits responsibilities across three layers: the client (proving), the verifier program (on-chain verification), and the indexer/API (read access).</p>

      <h2 id="flow">The Commit → Prove → Verify flow</h2>
      <CodeBlock
        lang="text"
        code={`Client (browser)            Solana                         Indexer / API
─────────────────           ──────                         ─────────────
1. Commit inputs
2. snarkjs.fullProve  ──▶    (nothing on-chain yet)
3. format → [u8;32]
4. verify_proof tx    ──▶    Anchor program
                            · alt_bn128 pairing check
                            · writes ProofAccount PDA  ──▶  ProofRecord
                            · emits ProofVerified           (queryable)`}
      />

      <h2 id="layers">Layers</h2>
      <ul>
        <li><strong>Client</strong> — circuit artifacts (wasm + zkey) run in a Web Worker; private inputs never leave the device.</li>
        <li><strong>Verifier program</strong> — an Anchor program performs the Groth16 pairing check using Solana&apos;s native <code>alt_bn128</code> syscalls.</li>
        <li><strong>Indexer</strong> — subscribes to program logs (Helius webhooks or RPC polling) and exposes proofs/transactions via REST + WebSocket.</li>
      </ul>

      <h2 id="trust">Trust model</h2>
      <p>Verification is trustless: the pairing check runs on-chain and anyone can re-verify a proof in the browser. The indexer is a convenience layer for reads — it never gates verification.</p>
    </DocPage>
  );
}
