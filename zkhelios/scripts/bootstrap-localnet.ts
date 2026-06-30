/**
 * Localnet bootstrap for the zkHelios verifier program.
 *
 * Initializes the VerifierConfig and registers the five standard circuit slots,
 * so the dApp can exercise the full flow against a local validator.
 *
 * Usage (after `anchor build` + a running `solana-test-validator`):
 *   anchor deploy --provider.cluster localnet
 *   npx ts-node scripts/bootstrap-localnet.ts
 *
 * Requires: @coral-xyz/anchor, @solana/web3.js, and target/idl/zkhelios.json.
 * NOTE: dev convenience script — not part of CI. Real circuit verifying keys
 * come from each circuit's trusted setup; here we register dev placeholders.
 */
import * as anchor from "@coral-xyz/anchor";
import { PublicKey, Keypair } from "@solana/web3.js";
import fs from "node:fs";

const IDL = JSON.parse(fs.readFileSync(`${__dirname}/../target/idl/zkhelios.json`, "utf8"));

const STANDARD_CIRCUITS = [
  { id: 1, name: "balance_proof", proofType: { balance: {} }, publicInputs: 2 },
  { id: 2, name: "ownership_proof", proofType: { ownership: {} }, publicInputs: 1 },
  { id: 3, name: "age_proof", proofType: { age: {} }, publicInputs: 1 },
  { id: 4, name: "membership_proof", proofType: { membership: {} }, publicInputs: 1 },
  { id: 5, name: "custom_circuit", proofType: { custom: {} }, publicInputs: 1 },
];

const VK_FIXED = 448;
const G1 = 64;
/** Dev-only placeholder VK (correctly sized; replace with a real trusted-setup VK). */
const devVk = (publicInputs: number) => Buffer.alloc(VK_FIXED + G1 * (publicInputs + 1));

async function main() {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const program = new anchor.Program(IDL, provider);
  const admin = (provider.wallet as anchor.Wallet).payer;

  const [config] = PublicKey.findProgramAddressSync([Buffer.from("verifier_config")], program.programId);

  console.log("Initializing VerifierConfig…");
  await program.methods
    .initialize(admin.publicKey, admin.publicKey, new anchor.BN(0))
    .accounts({ payer: admin.publicKey, config })
    .rpc()
    .catch((e) => console.log("  (already initialized?)", e.message));

  for (const c of STANDARD_CIRCUITS) {
    const idBuf = Buffer.alloc(4);
    idBuf.writeUInt32LE(c.id, 0);
    const [circuit] = PublicKey.findProgramAddressSync([Buffer.from("circuit"), idBuf], program.programId);
    console.log(`Registering circuit ${c.id} (${c.name})…`);
    await program.methods
      .registerCircuit(c.id, c.name, c.proofType, devVk(c.publicInputs), c.publicInputs)
      .accounts({ admin: admin.publicKey, config, circuit })
      .rpc()
      .catch((e) => console.log("  (already registered?)", e.message));
  }

  console.log("Bootstrap complete. Program:", program.programId.toBase58());
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

// Keep imports referenced for linters even if unused in some paths.
void Keypair;
