# Runbook: Program Upgrade (Anchor)

Program upgrades are high-stakes — the upgrade authority is a **Squads multisig (3-of-5)**.

## Procedure

1. `anchor build` → review the diff + IDL diff; bump version.
2. Deploy to **devnet**: `anchor deploy --provider.cluster devnet`; run the full
   `cargo test` suite + a devnet smoke (verify a real proof end-to-end).
3. **Soak on devnet ≥ 1 week** (≥ 4 weeks before the first mainnet release).
4. Write a buffer account: `solana program write-buffer target/deploy/zkhelios.so`.
5. Create a Squads proposal to set the buffer as the upgrade source; collect 3-of-5
   approvals; execute.
6. Publish the IDL: `anchor idl upgrade`. Sync to `packages/idl` (`scripts/sync-idl.sh`).
7. Verify on Solana Explorer; monitor `verify_proof` success rate post-upgrade.

## Rollback

Keep the previous `.so` + buffer. If the new version misbehaves, the multisig
re-points the upgrade to the prior buffer. Account layouts are append-only — never
reorder/remove fields without a migration plan.
