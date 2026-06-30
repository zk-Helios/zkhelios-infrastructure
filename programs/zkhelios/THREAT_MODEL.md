# Threat Model — zkHelios Verifier Program

## Assets
- Integrity of on-chain proof attestations (`ProofAccount.verified`).
- `VerifierConfig` admin authority + treasury.
- Registered circuit verifying keys (consensus-critical).

## Trust assumptions
- The Groth16 verifying key per circuit is honest (trusted setup). A malicious VK
  could validate false proofs → registration is **admin-only** and should require a
  multisig + published ceremony transcript.
- `alt_bn128` syscalls are correct (Solana runtime).

## Threats & mitigations
| Threat | Mitigation |
| --- | --- |
| Forged proof accepted | Real Groth16 pairing check via `alt_bn128` (tested with a real arkworks proof + tampered-proof rejection). |
| Replay / duplicate proof | `ProofAccount` PDA seeded by client-random `u64` nonce + `init` constraint (reuse fails). |
| Wrong public-input count | Validated against `circuit.public_input_count`; VK size validated on registration. |
| Unauthorized admin action | `has_one = admin`; two-step admin transfer; signer checks on every admin ix. |
| Disabled/paused bypass | `verify_proof` checks `config.paused` + `circuit.enabled`. |
| Fee manipulation | Fee transfer via System Program `transfer` (no direct lamport edits). |
| Arithmetic overflow | `checked_add` / `saturating_add`; no unbounded loops. |
| Reentrancy | Single-instruction execution; no CPI to untrusted programs. |
| Rent griefing | Author can `close_proof` to reclaim rent; accounts owned by the program. |
| Malicious VK on registration | Admin-only + (prod) multisig + audited circuits. |

## Pre-audit checklist
See the checklist in `zkhelios/README.md`. Run `cargo clippy -D warnings`,
`cargo-audit`, and an external audit (Halborn/Neodyme/OtterSec/Zellic) before mainnet.
Minimum 4 weeks devnet soak; bug bounty on Immunefi.
