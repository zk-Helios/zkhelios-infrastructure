import { DocPage } from "@/components/doc-page";
import { CodeBlock } from "@/components/code-block";
import { Callout } from "@/components/callout";

export const metadata = { title: "Build a custom circuit" };

export default function CustomCircuitGuide() {
  return (
    <DocPage title="Build a custom circuit" lead="Bring your own circom circuit and verify its proofs through the zkHelios program.">
      <h2 id="write">1. Write the circuit</h2>
      <CodeBlock
        lang="circom"
        code={`pragma circom 2.1.6;

template Membership(depth) {
  signal input leaf;
  signal input path[depth];
  signal input root;     // public
  signal output ok;
  // ... Merkle inclusion constraints ...
}
component main { public [root] } = Membership(20);`}
      />

      <h2 id="compile">2. Compile + trusted setup</h2>
      <CodeBlock
        lang="bash"
        code={`circom membership.circom --r1cs --wasm
snarkjs groth16 setup membership.r1cs pot.ptau membership_0.zkey
snarkjs zkey contribute membership_0.zkey membership_final.zkey
snarkjs zkey export verificationkey membership_final.zkey vkey.json`}
      />

      <h2 id="register">3. Register the circuit on-chain</h2>
      <p>An admin registers the verifying key so the program can verify proofs for it:</p>
      <CodeBlock
        lang="ts"
        code={`await zk.admin.registerCircuit({
  name: "membership_v1",
  proofType: "membership",
  verifyingKey: vkeyToBytes(vkey),
  publicInputCount: 1,
});`}
      />

      <Callout variant="danger">
        The verifying key is consensus-critical. Only register keys from a circuit you have audited
        and whose trusted setup you trust.
      </Callout>

      <h2 id="prove">4. Prove with it</h2>
      <CodeBlock
        lang="ts"
        code={`const proof = await zk.proveCustom({
  circuit: "membership_v1",
  inputs: { leaf, path, root },
});
await zk.submitProof(proof);`}
      />
    </DocPage>
  );
}
