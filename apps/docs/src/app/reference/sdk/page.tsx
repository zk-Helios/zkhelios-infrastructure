import { DocPage } from "@/components/doc-page";
import { CodeBlock } from "@/components/code-block";

export const metadata = { title: "TypeScript SDK" };

export default function SdkReference() {
  return (
    <DocPage title="TypeScript SDK" lead="@zkhelios/sdk — a typed client over the Anchor program and circuit tooling.">
      <h2 id="constructor">Constructor</h2>
      <CodeBlock lang="ts" code={`new ZkHelios({ cluster: "mainnet-beta" | "devnet" | "localnet", wallet? })`} />

      <h2 id="proving">Proving</h2>
      <ul>
        <li><code>proveBalance({'{ token?, min, balance }'})</code> → <code>ProofBundle</code></li>
        <li><code>proveOwnership({'{ collection, mint }'})</code></li>
        <li><code>proveAge({'{ minAgeDays, createdAtSlot }'})</code></li>
        <li><code>proveMembership({'{ root, leaf }'})</code></li>
        <li><code>proveCustom({'{ circuit, inputs }'})</code></li>
      </ul>

      <h2 id="submit-verify">Submit &amp; verify</h2>
      <CodeBlock
        lang="ts"
        code={`const { signature, proofAccount } = await zk.submitProof(bundle);
const proof = await zk.getProof(proofAccount);
const ok = await zk.verify(bundle); // off-chain re-check`}
      />

      <h2 id="format">Formatting helpers</h2>
      <CodeBlock
        lang="ts"
        code={`import { groth16ToSolana, encodeProof } from "@zkhelios/sdk";

const args = groth16ToSolana(bundle.proof, bundle.publicSignals);
const shareLink = encodeProof(bundle); // for /verify?proof=…`}
      />
    </DocPage>
  );
}
