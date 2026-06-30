//! Integration tests (litesvm). Loads the compiled .so and exercises the full
//! program — including a REAL Groth16 proof generated with arkworks.

mod helpers;
use helpers::*;

use anchor_lang::{prelude::Pubkey, solana_program::system_program, AccountDeserialize};
use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_signer::Signer;
use zkhelios::state::{CircuitRegistry, ProofAccount, ProofType, UserAccount, VerifierConfig};

const CIRCUIT_ID: u32 = 1;

fn do_initialize(svm: &mut LiteSVM, admin: &Keypair, treasury: Pubkey, fee: u64) -> Result<(), String> {
    let data = zkhelios::instruction::Initialize {
        admin: admin.pubkey(),
        treasury,
        proof_fee_lamports: fee,
    };
    let accts = zkhelios::accounts::Initialize {
        payer: admin.pubkey(),
        config: config_pda(),
        system_program: system_program::ID,
    };
    send(svm, ix(data, accts), admin, &[admin])
}

fn do_register(svm: &mut LiteSVM, admin: &Keypair, id: u32, proof: &TestProof) -> Result<(), String> {
    let data = zkhelios::instruction::RegisterCircuit {
        circuit_id: id,
        name: "balance_proof".to_string(),
        proof_type: ProofType::Balance,
        verifying_key: proof.vk_bytes.clone(),
        public_input_count: proof.public_inputs.len() as u8,
    };
    let accts = zkhelios::accounts::RegisterCircuit {
        admin: admin.pubkey(),
        config: config_pda(),
        circuit: circuit_pda(id),
        system_program: system_program::ID,
    };
    send(svm, ix(data, accts), admin, &[admin])
}

fn verify_ix(user: &Keypair, treasury: Pubkey, id: u32, proof: &TestProof, nonce: u64) -> anchor_lang::solana_program::instruction::Instruction {
    let data = zkhelios::instruction::VerifyProof {
        circuit_id: id,
        proof_a: proof.proof_a,
        proof_b: proof.proof_b,
        proof_c: proof.proof_c,
        public_inputs: proof.public_inputs.clone(),
        nonce,
    };
    let accts = zkhelios::accounts::VerifyProof {
        user: user.pubkey(),
        config: config_pda(),
        circuit: circuit_pda(id),
        user_account: user_pda(&user.pubkey()),
        proof_account: proof_pda(&user.pubkey(), nonce),
        treasury,
        system_program: system_program::ID,
    };
    ix(data, accts)
}

fn read<T: AccountDeserialize>(svm: &LiteSVM, key: &Pubkey) -> T {
    let acc = svm.get_account(key).expect("account exists");
    T::try_deserialize(&mut &acc.data[..]).expect("deserialize")
}

// ── Initialization ──────────────────────────────────────────────────────────

#[test]
fn initialize_sets_config_and_rejects_second_call() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();

    let config: VerifierConfig = read(&svm, &config_pda());
    assert_eq!(config.admin, admin.pubkey());
    assert!(!config.paused);
    assert_eq!(config.total_proofs_verified, 0);

    // Second initialize must fail (account already exists).
    assert!(do_initialize(&mut svm, &admin, admin.pubkey(), 0).is_err());
}

// ── Circuit registration ──────────────────────────────────────────────────────

#[test]
fn register_circuit_admin_only_and_no_duplicates() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let proof = generate_valid_proof();
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();

    // Non-admin cannot register.
    let stranger = funded_keypair(&mut svm, 10_000_000_000);
    let data = zkhelios::instruction::RegisterCircuit {
        circuit_id: CIRCUIT_ID,
        name: "x".to_string(),
        proof_type: ProofType::Balance,
        verifying_key: proof.vk_bytes.clone(),
        public_input_count: 1,
    };
    let accts = zkhelios::accounts::RegisterCircuit {
        admin: stranger.pubkey(),
        config: config_pda(),
        circuit: circuit_pda(CIRCUIT_ID),
        system_program: system_program::ID,
    };
    assert!(send(&mut svm, ix(data, accts), &stranger, &[&stranger]).is_err());

    // Admin can register, and a duplicate id is rejected.
    do_register(&mut svm, &admin, CIRCUIT_ID, &proof).unwrap();
    let circuit: CircuitRegistry = read(&svm, &circuit_pda(CIRCUIT_ID));
    assert_eq!(circuit.public_input_count, 1);
    assert!(circuit.enabled);
    assert!(do_register(&mut svm, &admin, CIRCUIT_ID, &proof).is_err());
}

#[test]
fn register_circuit_rejects_mismatched_vk_size() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let proof = generate_valid_proof();
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();

    // Claim 2 public inputs but supply a VK sized for 1 → InvalidVerifyingKey.
    let data = zkhelios::instruction::RegisterCircuit {
        circuit_id: CIRCUIT_ID,
        name: "bad".to_string(),
        proof_type: ProofType::Balance,
        verifying_key: proof.vk_bytes.clone(),
        public_input_count: 2,
    };
    let accts = zkhelios::accounts::RegisterCircuit {
        admin: admin.pubkey(),
        config: config_pda(),
        circuit: circuit_pda(CIRCUIT_ID),
        system_program: system_program::ID,
    };
    assert!(send(&mut svm, ix(data, accts), &admin, &[&admin]).is_err());
}

// ── Proof verification — happy path with a REAL proof ─────────────────────────

#[test]
fn verify_valid_proof_succeeds_and_records_attestation() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let proof = generate_valid_proof();
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();
    do_register(&mut svm, &admin, CIRCUIT_ID, &proof).unwrap();

    let user = funded_keypair(&mut svm, 10_000_000_000);
    let nonce = 0xDEAD_BEEF_u64;
    let cu = send_cu(&mut svm, verify_ix(&user, admin.pubkey(), CIRCUIT_ID, &proof, nonce), &user, &[&user])
        .expect("valid proof should verify on-chain");

    // CU budget assertion (spec target < 300k for standard circuits).
    println!("verify_proof consumed {cu} CU");
    assert!(cu < 300_000, "verify_proof used {cu} CU (>300k budget)");

    let pa: ProofAccount = read(&svm, &proof_pda(&user.pubkey(), nonce));
    assert!(pa.verified);
    assert_eq!(pa.authority, user.pubkey());
    assert_eq!(pa.circuit_id, CIRCUIT_ID);
    assert_eq!(pa.public_inputs.len(), 1);

    let ua: UserAccount = read(&svm, &user_pda(&user.pubkey()));
    assert_eq!(ua.proof_count, 1);

    let config: VerifierConfig = read(&svm, &config_pda());
    assert_eq!(config.total_proofs_verified, 1);
}

// ── Proof verification — failure paths ────────────────────────────────────────

#[test]
fn verify_rejects_tampered_proof() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let mut proof = generate_valid_proof();
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();
    do_register(&mut svm, &admin, CIRCUIT_ID, &proof).unwrap();

    // Flip a byte in proof A → pairing must fail.
    proof.proof_a[10] ^= 0xff;
    let user = funded_keypair(&mut svm, 10_000_000_000);
    assert!(send(&mut svm, verify_ix(&user, admin.pubkey(), CIRCUIT_ID, &proof, 1), &user, &[&user]).is_err());
}

#[test]
fn verify_rejects_wrong_public_input_count() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let mut proof = generate_valid_proof();
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();
    do_register(&mut svm, &admin, CIRCUIT_ID, &proof).unwrap();

    proof.public_inputs.push([0u8; 32]); // now 2, circuit expects 1
    let user = funded_keypair(&mut svm, 10_000_000_000);
    assert!(send(&mut svm, verify_ix(&user, admin.pubkey(), CIRCUIT_ID, &proof, 2), &user, &[&user]).is_err());
}

#[test]
fn verify_rejects_duplicate_nonce() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let proof = generate_valid_proof();
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();
    do_register(&mut svm, &admin, CIRCUIT_ID, &proof).unwrap();

    let user = funded_keypair(&mut svm, 10_000_000_000);
    let nonce = 42;
    send(&mut svm, verify_ix(&user, admin.pubkey(), CIRCUIT_ID, &proof, nonce), &user, &[&user]).unwrap();
    // Same nonce → ProofAccount already exists → init fails.
    assert!(send(&mut svm, verify_ix(&user, admin.pubkey(), CIRCUIT_ID, &proof, nonce), &user, &[&user]).is_err());
}

#[test]
fn verify_rejects_when_paused_or_disabled() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let proof = generate_valid_proof();
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();
    do_register(&mut svm, &admin, CIRCUIT_ID, &proof).unwrap();
    let user = funded_keypair(&mut svm, 10_000_000_000);

    // Disable circuit → CircuitDisabled.
    let data = zkhelios::instruction::SetCircuitEnabled { circuit_id: CIRCUIT_ID, enabled: false };
    let accts = zkhelios::accounts::SetCircuitEnabled {
        admin: admin.pubkey(),
        config: config_pda(),
        circuit: circuit_pda(CIRCUIT_ID),
    };
    send(&mut svm, ix(data, accts), &admin, &[&admin]).unwrap();
    assert!(send(&mut svm, verify_ix(&user, admin.pubkey(), CIRCUIT_ID, &proof, 7), &user, &[&user]).is_err());

    // Re-enable, then pause the whole program → ProgramPaused.
    let data = zkhelios::instruction::SetCircuitEnabled { circuit_id: CIRCUIT_ID, enabled: true };
    let accts = zkhelios::accounts::SetCircuitEnabled {
        admin: admin.pubkey(),
        config: config_pda(),
        circuit: circuit_pda(CIRCUIT_ID),
    };
    send(&mut svm, ix(data, accts), &admin, &[&admin]).unwrap();

    let data = zkhelios::instruction::UpdateConfig { new_fee: None, new_paused: Some(true), new_treasury: None };
    let accts = zkhelios::accounts::UpdateConfig { admin: admin.pubkey(), config: config_pda() };
    send(&mut svm, ix(data, accts), &admin, &[&admin]).unwrap();
    assert!(send(&mut svm, verify_ix(&user, admin.pubkey(), CIRCUIT_ID, &proof, 8), &user, &[&user]).is_err());
}

// ── Fee, revoke, close, admin ─────────────────────────────────────────────────

#[test]
fn verify_collects_fee_to_treasury() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let treasury = funded_keypair(&mut svm, 1_000_000_000);
    let proof = generate_valid_proof();
    let fee = 5_000_000u64;
    do_initialize(&mut svm, &admin, treasury.pubkey(), fee).unwrap();
    do_register(&mut svm, &admin, CIRCUIT_ID, &proof).unwrap();

    let before = svm.get_account(&treasury.pubkey()).unwrap().lamports;
    let user = funded_keypair(&mut svm, 10_000_000_000);
    send(&mut svm, verify_ix(&user, treasury.pubkey(), CIRCUIT_ID, &proof, 3), &user, &[&user]).unwrap();
    let after = svm.get_account(&treasury.pubkey()).unwrap().lamports;
    assert_eq!(after - before, fee);
}

#[test]
fn revoke_and_close_proof() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let proof = generate_valid_proof();
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();
    do_register(&mut svm, &admin, CIRCUIT_ID, &proof).unwrap();
    let user = funded_keypair(&mut svm, 10_000_000_000);
    let nonce = 99;
    send(&mut svm, verify_ix(&user, admin.pubkey(), CIRCUIT_ID, &proof, nonce), &user, &[&user]).unwrap();
    let proof_acc = proof_pda(&user.pubkey(), nonce);

    // A stranger cannot revoke.
    let stranger = funded_keypair(&mut svm, 1_000_000_000);
    let data = zkhelios::instruction::RevokeProof {};
    let accts = zkhelios::accounts::RevokeProof { authority: stranger.pubkey(), proof_account: proof_acc };
    assert!(send(&mut svm, ix(data, accts), &stranger, &[&stranger]).is_err());

    // Author revokes (soft delete).
    let data = zkhelios::instruction::RevokeProof {};
    let accts = zkhelios::accounts::RevokeProof { authority: user.pubkey(), proof_account: proof_acc };
    send(&mut svm, ix(data, accts), &user, &[&user]).unwrap();
    let pa: ProofAccount = read(&svm, &proof_acc);
    assert!(!pa.verified);

    // Author closes → account gone, rent reclaimed.
    let data = zkhelios::instruction::CloseProof {};
    let accts = zkhelios::accounts::CloseProof { authority: user.pubkey(), proof_account: proof_acc };
    send(&mut svm, ix(data, accts), &user, &[&user]).unwrap();
    assert!(svm.get_account(&proof_acc).map(|a| a.data.is_empty()).unwrap_or(true));
}

#[test]
fn two_step_admin_transfer() {
    let mut svm = load_svm();
    let admin = funded_keypair(&mut svm, 10_000_000_000);
    let new_admin = funded_keypair(&mut svm, 10_000_000_000);
    do_initialize(&mut svm, &admin, admin.pubkey(), 0).unwrap();

    // Propose.
    let data = zkhelios::instruction::ProposeAdminTransfer { new_admin: new_admin.pubkey() };
    let accts = zkhelios::accounts::ProposeAdminTransfer { admin: admin.pubkey(), config: config_pda() };
    send(&mut svm, ix(data, accts), &admin, &[&admin]).unwrap();

    // Wrong acceptor fails.
    let stranger = funded_keypair(&mut svm, 1_000_000_000);
    let data = zkhelios::instruction::AcceptAdminTransfer {};
    let accts = zkhelios::accounts::AcceptAdminTransfer { new_admin: stranger.pubkey(), config: config_pda() };
    assert!(send(&mut svm, ix(data, accts), &stranger, &[&stranger]).is_err());

    // Correct acceptor succeeds.
    let data = zkhelios::instruction::AcceptAdminTransfer {};
    let accts = zkhelios::accounts::AcceptAdminTransfer { new_admin: new_admin.pubkey(), config: config_pda() };
    send(&mut svm, ix(data, accts), &new_admin, &[&new_admin]).unwrap();
    let config: VerifierConfig = read(&svm, &config_pda());
    assert_eq!(config.admin, new_admin.pubkey());
    assert!(config.pending_admin.is_none());
}
