import { DocPage } from "@/components/doc-page";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

export const metadata = { title: "Quickstart" };

export default function Quickstart() {
  return (
    <DocPage title="Quickstart" lead="Generate your first proof and verify it on Solana devnet in about five minutes.">
      <h2 id="install">1. Install the SDK</h2>
      <CodeBlock lang="bash" code={`pnpm add @zkhelios/sdk @solana/web3.js`} />

      <h2 id="connect">2. Connect a wallet</h2>
      <p>Any Solana wallet works (Phantom, Solflare, Backpack). Point the SDK at devnet to start.</p>
      <CodeBlock
        lang="ts"
        code={`import { ZkHelios } from "@zkhelios/sdk";

const zk = new ZkHelios({ cluster: "devnet", wallet });`}
      />

      <h2 id="airdrop">3. Get devnet SOL</h2>
      <p>Proof submission pays a normal Solana fee. Fund your wallet on devnet:</p>
      <CodeBlock lang="bash" code={`solana airdrop 2 <YOUR_PUBKEY> --url devnet`} />
      <Callout variant="info">You can also use the in-app faucet link shown when your balance is too low.</Callout>

      <h2 id="prove">4. Generate a proof</h2>
      <p>Proving happens entirely in your browser — your private inputs never leave the device.</p>
      <CodeBlock
        lang="ts"
        code={`const proof = await zk.proveBalance({ min: 100 });
// proof.publicSignals -> [threshold], proof.proof -> Groth16`}
      />

      <h2 id="submit">5. Verify on-chain</h2>
      <CodeBlock
        lang="ts"
        code={`const { signature, proofAccount } = await zk.submitProof(proof);
console.log("verified on-chain:", signature);`}
      />

      <Callout variant="tip">
        Prefer the UI? Open the dApp&apos;s <a href="/app">Prove</a> page — same flow with a guided wizard.
      </Callout>
    </DocPage>
  );
}
