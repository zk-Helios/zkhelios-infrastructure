# @zkhelios/sdk

TypeScript SDK for **zkHelios** — generate, format, submit, and verify zero-knowledge
proofs on Solana.

```bash
pnpm add @zkhelios/sdk @solana/web3.js
```

```ts
import { ZkHelios } from "@zkhelios/sdk";

const zk = new ZkHelios({ cluster: "mainnet-beta", wallet });
const proof = await zk.proveBalance({ min: 100 });
const { signature } = await zk.submitProof(proof);
```

## Exports

- `ZkHelios` — high-level client (prove\* / submitProof / getProof / verify)
- `groth16ToSolana`, `fieldToBytes32` — Groth16 → Anchor byte layout
- `encodeProof`, `decodeProof` — shareable verification links
- Types: `Cluster`, `ProofKind`, `Groth16Proof`, `ProofBundle`, `SolanaProofArgs`

> **Status:** scaffold. The proving methods + `submitProof` are wired to the deployed
> Anchor program in Session 6; `groth16ToSolana` / `encodeProof` are production-ready.
See `examples/`.
