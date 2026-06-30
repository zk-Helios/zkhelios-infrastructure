import { DocPage } from "@/components/doc-page";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

export default function IntroductionPage() {
  return (
    <DocPage
      title="What is zkHelios"
      lead="zkHelios brings privacy-preserving verification to Solana. Prove what matters — balance, ownership, membership, age — and reveal only what you choose."
    >
      <p>
        zkHelios is a zero-knowledge proof protocol on Solana. You generate a Groth16 proof
        client-side, then submit it to an on-chain Anchor program that verifies it in roughly
        200k compute units using Solana&apos;s <code>alt_bn128</code> syscalls. The proof attests
        to a statement (&quot;I hold at least 100 SOL&quot;) without revealing the underlying data.
      </p>

      <h2 id="why">Why ZK proofs on Solana</h2>
      <ul>
        <li><strong>Light-speed verification</strong> — on-chain verification settles in a single ~400ms slot.</li>
        <li><strong>Privacy by default</strong> — public inputs stay public; everything else never leaves your device.</li>
        <li><strong>Composable</strong> — any Anchor program can verify a zkHelios proof via CPI.</li>
      </ul>

      <h2 id="core-concepts">Core concepts</h2>
      <ul>
        <li><strong>Proof</strong> — a ~256-byte Groth16 proof over the BN254 curve.</li>
        <li><strong>Circuit</strong> — defines what is proven (balance, ownership, age, membership, custom).</li>
        <li><strong>Verifier program</strong> — the Anchor program that checks proofs and records attestations as PDAs.</li>
      </ul>

      <h2 id="hello-world">Hello, proof</h2>
      <CodeBlock
        lang="ts"
        code={`import { ZkHelios } from "@zkhelios/sdk";

const zk = new ZkHelios({ cluster: "mainnet-beta", wallet });

// Prove you hold >= 100 SOL without revealing the balance
const proof = await zk.proveBalance({ min: 100 });
const { signature } = await zk.submitProof(proof);`}
      />

      <Callout variant="tip">
        New here? Jump to the <a href="/quickstart">Quickstart</a> to generate and verify your first
        proof in five minutes.
      </Callout>

      <h2 id="use-cases">Use cases</h2>
      <ul>
        <li>Private token transfers and balance attestations</li>
        <li>Anonymous credential verification</li>
        <li>Sybil-resistant airdrops</li>
        <li>Private DAO voting</li>
        <li>KYC without doxxing</li>
      </ul>
    </DocPage>
  );
}
