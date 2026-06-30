# Session 6 Readiness Audit (pre-Anchor)

Baseline snapshot before starting the on-chain track. Frontend track (Solana Sessions 1–5) is complete and green.

## Toolchain

| Tool | Status (audit time) | Needed for |
| --- | --- | --- |
| Rust / Cargo 1.96 | ✅ present | compiling the program |
| C compiler (gcc 13.3) | ✅ present | native deps |
| Solana CLI | ❌ missing → installing | `cargo-build-sbf`, deploy, `solana-test-validator` |
| Anchor CLI + AVM | ❌ missing → installing | `anchor build` / `test`, IDL generation |

Environment: network to Anza + GitHub open; 71 G free disk; repo was **not** git-initialized.

## Decisions (locked for Session 6)

- **ZK verifier**: real Groth16 via Solana `alt_bn128` syscalls (~200k CU target).
- **Nonce strategy — REVISED**: ProofAccount uses a **client-generated cryptographically
  random `u64` nonce** (not a sequential counter, not a timestamp).
  - PDA seeds: `["proof", authority, nonce u64 LE]`, nonce client-provided random.
  - `UserAccount` keeps `proof_count: u64` for stats, **not** as a PDA seed source.
  - Use the Anchor `init` constraint (not `init_if_needed`) so a duplicate nonce auto-rejects.
  - Drop the `user.nonce` field (replay protection is handled by recent blockhash +
    ProofAccount uniqueness; no app-level counter needed).
  - Rationale: no extra RPC fetch, no parallel-submission race, no griefable/predictable
    timestamp. Industry pattern (Candy Machine mint indexes, ME listing IDs).

## Reconciliation items (frontend ↔ program), to apply during Session 6

1. `apps/dapp/src/lib/zk/submit.ts`: replace `BigInt(Date.now())` with
   `crypto.getRandomValues(new BigUint64Array(1))[0]`; document why random over sequential.
2. `apps/dapp/API_CONTRACT.md`: update nonce semantics to "client-generated cryptographically random u64".
3. `anchor init zkhelios --no-git` (root git tracks Anchor changes separately).

## Interface the program must match (from `apps/dapp/src/lib/anchor.ts` + `API_CONTRACT.md`)

- PDAs: `VerifierConfig` `["verifier_config"]` · `UserAccount` `["user", authority]` ·
  `CircuitRegistry` `["circuit", circuit_id u32 LE]` · `ProofAccount` `["proof", authority, nonce u64 LE]`
- `verify_proof(circuit_id: u32, proof_a: [u8;64], proof_b: [u8;128], proof_c: [u8;64], public_inputs: Vec<[u8;32]>)`
- ProofType enum: Balance / Ownership / Age / Membership / Custom
- Error codes 6000–6012
- IDL → `packages/idl` (replaces `MOCK_IDL` in the dApp)
