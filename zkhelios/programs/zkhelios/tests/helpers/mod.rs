//! Shared test helpers: litesvm setup, PDA derivation, and a real Groth16
//! proof generated with arkworks (converted to the alt_bn128 big-endian layout
//! the on-chain verifier expects).

use anchor_lang::{prelude::Pubkey, InstructionData, ToAccountMetas};
use anchor_lang::solana_program::instruction::Instruction;
use litesvm::LiteSVM;
use solana_keypair::Keypair;
use solana_message::{Message, VersionedMessage};
use solana_signer::Signer;
use solana_transaction::versioned::VersionedTransaction;

pub fn load_svm() -> LiteSVM {
    let mut svm = LiteSVM::new();
    let bytes = include_bytes!(concat!(env!("CARGO_TARGET_TMPDIR"), "/../deploy/zkhelios.so"));
    svm.add_program(zkhelios::id(), bytes).unwrap();
    svm
}

pub fn funded_keypair(svm: &mut LiteSVM, lamports: u64) -> Keypair {
    let kp = Keypair::new();
    svm.airdrop(&kp.pubkey(), lamports).unwrap();
    kp
}

pub fn config_pda() -> Pubkey {
    Pubkey::find_program_address(&[b"verifier_config"], &zkhelios::id()).0
}
pub fn circuit_pda(circuit_id: u32) -> Pubkey {
    Pubkey::find_program_address(&[b"circuit", &circuit_id.to_le_bytes()], &zkhelios::id()).0
}
pub fn user_pda(authority: &Pubkey) -> Pubkey {
    Pubkey::find_program_address(&[b"user", authority.as_ref()], &zkhelios::id()).0
}
pub fn proof_pda(authority: &Pubkey, nonce: u64) -> Pubkey {
    Pubkey::find_program_address(
        &[b"proof", authority.as_ref(), &nonce.to_le_bytes()],
        &zkhelios::id(),
    )
    .0
}

/// Build + send a transaction; returns Ok/Err so failure paths can assert.
pub fn send(
    svm: &mut LiteSVM,
    ix: Instruction,
    payer: &Keypair,
    signers: &[&Keypair],
) -> Result<(), String> {
    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), signers)
        .map_err(|e| e.to_string())?;
    svm.send_transaction(tx).map(|_| ()).map_err(|e| format!("{:?}", e.err))
}

pub fn ix(data: impl InstructionData, accounts: impl ToAccountMetas) -> Instruction {
    Instruction::new_with_bytes(zkhelios::id(), &data.data(), accounts.to_account_metas(None))
}

/// Like `send`, but returns compute units consumed on success.
pub fn send_cu(
    svm: &mut LiteSVM,
    ix: Instruction,
    payer: &Keypair,
    signers: &[&Keypair],
) -> Result<u64, String> {
    let blockhash = svm.latest_blockhash();
    let msg = Message::new_with_blockhash(&[ix], Some(&payer.pubkey()), &blockhash);
    let tx = VersionedTransaction::try_new(VersionedMessage::Legacy(msg), signers)
        .map_err(|e| e.to_string())?;
    svm.send_transaction(tx)
        .map(|m| m.compute_units_consumed)
        .map_err(|e| format!("{:?}", e.err))
}

// ── Real Groth16 proof via arkworks, in alt_bn128 (EIP-197) byte layout ──────

use ark_bn254::{Bn254, Fr, G1Affine, G2Affine};
use ark_groth16::Groth16;
use ark_relations::r1cs::{ConstraintSynthesizer, ConstraintSystemRef, SynthesisError};
use ark_serialize::CanonicalSerialize;
use ark_snark::SNARK;

/// Trivial circuit: prove knowledge of a, b such that a * b == c (c public).
#[derive(Clone)]
struct MulCircuit {
    a: Option<Fr>,
    b: Option<Fr>,
}

impl ConstraintSynthesizer<Fr> for MulCircuit {
    fn generate_constraints(self, cs: ConstraintSystemRef<Fr>) -> Result<(), SynthesisError> {
        let a = cs.new_witness_variable(|| self.a.ok_or(SynthesisError::AssignmentMissing))?;
        let b = cs.new_witness_variable(|| self.b.ok_or(SynthesisError::AssignmentMissing))?;
        let c = cs.new_input_variable(|| {
            let a = self.a.ok_or(SynthesisError::AssignmentMissing)?;
            let b = self.b.ok_or(SynthesisError::AssignmentMissing)?;
            Ok(a * b)
        })?;
        cs.enforce_constraint(
            ark_relations::lc!() + a,
            ark_relations::lc!() + b,
            ark_relations::lc!() + c,
        )?;
        Ok(())
    }
}

fn rev32(s: &[u8]) -> [u8; 32] {
    let mut o = [0u8; 32];
    for i in 0..32 {
        o[i] = s[31 - i];
    }
    o
}

fn g1_to_be(p: &G1Affine) -> [u8; 64] {
    let mut buf = Vec::new();
    p.serialize_uncompressed(&mut buf).unwrap(); // x(32 LE) || y(32 LE)
    let mut out = [0u8; 64];
    out[..32].copy_from_slice(&rev32(&buf[0..32]));
    out[32..].copy_from_slice(&rev32(&buf[32..64]));
    out
}

fn g2_to_be(p: &G2Affine) -> [u8; 128] {
    let mut buf = Vec::new();
    p.serialize_uncompressed(&mut buf).unwrap(); // x.c0,x.c1,y.c0,y.c1 (each 32 LE)
    let mut out = [0u8; 128];
    // EIP-197 order: x.c1, x.c0, y.c1, y.c0 (big-endian)
    out[0..32].copy_from_slice(&rev32(&buf[32..64])); // x.c1
    out[32..64].copy_from_slice(&rev32(&buf[0..32])); // x.c0
    out[64..96].copy_from_slice(&rev32(&buf[96..128])); // y.c1
    out[96..128].copy_from_slice(&rev32(&buf[64..96])); // y.c0
    out
}

fn fr_to_be(f: &Fr) -> [u8; 32] {
    let mut buf = Vec::new();
    f.serialize_uncompressed(&mut buf).unwrap(); // 32 LE
    rev32(&buf)
}

pub struct TestProof {
    pub vk_bytes: Vec<u8>,
    pub proof_a: [u8; 64],
    pub proof_b: [u8; 128],
    pub proof_c: [u8; 64],
    pub public_inputs: Vec<[u8; 32]>,
}

/// Generate a genuinely valid Groth16 proof (a=3, b=11, c=33) and serialize it
/// in the layout the on-chain verifier consumes.
pub fn generate_valid_proof() -> TestProof {
    use ark_std::rand::{rngs::StdRng, SeedableRng};
    // Concrete CryptoRng + RngCore (ark-std's rand) — `test_rng()` returns only
    // `impl Rng`, which doesn't expose the CryptoRng bound ark-snark requires.
    let mut rng = StdRng::seed_from_u64(20_260_630);
    let a = Fr::from(3u64);
    let b = Fr::from(11u64);
    let c = a * b;

    let (pk, vk) = Groth16::<Bn254>::circuit_specific_setup(
        MulCircuit { a: Some(a), b: Some(b) },
        &mut rng,
    )
    .unwrap();
    let proof =
        Groth16::<Bn254>::prove(&pk, MulCircuit { a: Some(a), b: Some(b) }, &mut rng).unwrap();

    // Sanity: arkworks itself accepts the proof before we hand bytes on-chain.
    assert!(Groth16::<Bn254>::verify(&vk, &[c], &proof).unwrap());

    let mut vk_bytes = Vec::new();
    vk_bytes.extend_from_slice(&g1_to_be(&vk.alpha_g1));
    vk_bytes.extend_from_slice(&g2_to_be(&vk.beta_g2));
    vk_bytes.extend_from_slice(&g2_to_be(&vk.gamma_g2));
    vk_bytes.extend_from_slice(&g2_to_be(&vk.delta_g2));
    for ic in &vk.gamma_abc_g1 {
        vk_bytes.extend_from_slice(&g1_to_be(ic));
    }

    TestProof {
        vk_bytes,
        proof_a: g1_to_be(&proof.a),
        proof_b: g2_to_be(&proof.b),
        proof_c: g1_to_be(&proof.c),
        public_inputs: vec![fr_to_be(&c)],
    }
}
