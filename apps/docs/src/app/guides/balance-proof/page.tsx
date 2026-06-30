import { DocPage } from "@/components/doc-page";
import { CodeBlock } from "@/components/code-block";
import { Callout } from "@/components/callout";

export const metadata = { title: "Generate a balance proof" };

export default function BalanceProofGuide() {
  return (
    <DocPage title="Generate a balance proof" lead="Prove you hold at least a threshold of SOL or an SPL token — without revealing the exact amount.">
      <h2 id="inputs">Inputs</h2>
      <ul>
        <li><strong>Public</strong>: <code>token</code>, <code>threshold</code></li>
        <li><strong>Private</strong>: <code>balance</code> (your actual holdings)</li>
      </ul>

      <h2 id="generate">Generate</h2>
      <CodeBlock
        lang="ts"
        code={`const proof = await zk.proveBalance({
  token: "SOL",
  min: 100,            // public threshold
  balance: 243.5,      // private — stays local
});`}
      />

      <h2 id="submit">Submit and read back</h2>
      <CodeBlock
        lang="ts"
        code={`const { signature, proofAccount } = await zk.submitProof(proof);

// later — anyone can verify
const onchain = await zk.getProof(proofAccount);
console.log(onchain.verified); // true`}
      />

      <Callout variant="tip">
        The verifier only sees the threshold and the validity of the proof — never your balance.
      </Callout>
    </DocPage>
  );
}
