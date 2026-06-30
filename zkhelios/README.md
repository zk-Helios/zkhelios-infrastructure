# zkHelios Anchor Program

On-chain Groth16 verifier for zero-knowledge proofs on Solana. Verifies proofs
in real BN254 pairing checks via Solana's `alt_bn128` syscalls and records
attestations as PDAs.

- Anchor **1.1.2** · Solana CLI 4.0.x · `cargo-build-sbf`
- Tests: **litesvm** (`cargo test`) — no validator needed; the happy-path test
  generates a **real Groth16 proof with arkworks** and verifies it on-chain.

## Build / test / deploy

```bash
# from this directory (zkhelios/)
anchor build                      # → target/deploy/zkhelios.so + target/idl/zkhelios.json
cargo test -p zkhelios -- --nocapture   # runs the litesvm integration suite

# devnet
anchor deploy --provider.cluster devnet
npx ts-node scripts/bootstrap-localnet.ts   # init config + register circuits

# sync the generated IDL into the JS monorepo
bash scripts/sync-idl.sh          # → packages/idl
```

## Program interface

| Instruction | Purpose |
| --- | --- |
| `initialize(admin, treasury, proof_fee_lamports)` | create singleton config (once) |
| `register_circuit(id, name, proof_type, verifying_key, public_input_count)` | admin |
| `set_circuit_enabled(id, enabled)` | admin enable/disable |
| `create_user_account()` | idempotent user PDA |
| `verify_proof(circuit_id, proof_a, proof_b, proof_c, public_inputs, nonce)` | **on-chain Groth16 verify** |
| `revoke_proof()` / `close_proof()` | soft-revoke / reclaim rent (author) |
| `update_config(new_fee?, new_paused?, new_treasury?)` | admin |
| `propose_admin_transfer(new_admin)` / `accept_admin_transfer()` | two-step admin |

**PDAs**: `VerifierConfig ["verifier_config"]` · `CircuitRegistry ["circuit", id u32 LE]` ·
`UserAccount ["user", authority]` · `ProofAccount ["proof", authority, nonce u64 LE]`.

**Nonce**: client-generated random `u64`; `verify_proof` uses an `init` constraint on
the ProofAccount so a reused nonce is auto-rejected. `UserAccount.proof_count` is a
stats counter, never a seed.

## ZK verification

`verify_proof` checks `e(-A, B)·e(α, β)·e(vk_x, γ)·e(C, δ) == 1` where
`vk_x = ic[0] + Σ publicInputs[i]·ic[i+1]`, using `alt_bn128_g1_multiplication_be`,
`alt_bn128_g1_addition_be`, and `alt_bn128_pairing_be`. Points are uncompressed
big-endian (EIP-197 layout); the verifying key is `α‖β‖γ‖δ‖ic…`.

**CU benchmark**: a 1-public-input verification consumes **~101,582 CU** (well under
the 1.4M per-tx cap and the 300k target).

## Security checklist (met)

- PDA seeds + bump on every account; `has_one`/`address` ownership checks
- All signers checked; admin ops gated by `has_one = admin`
- Checked arithmetic (`checked_add` / `saturating_add`); no unbounded loops
- Public-input length validated before reading; VK size validated on registration
- Fee via System Program transfer; no direct lamport manipulation
- Replay/duplicate protection via `init` + random nonce; single-instruction (no reentrancy)
