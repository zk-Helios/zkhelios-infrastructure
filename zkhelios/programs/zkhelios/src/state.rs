use anchor_lang::prelude::*;
use crate::constants::{MAX_CIRCUIT_NAME_LEN, MAX_PUBLIC_INPUTS, VK_MAX_LEN};

/// The kind of statement a circuit proves.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq, Debug, InitSpace)]
pub enum ProofType {
    Balance,
    Ownership,
    Age,
    Membership,
    Custom,
}

/// Singleton program config. PDA seeds: ["verifier_config"].
#[account]
#[derive(InitSpace)]
pub struct VerifierConfig {
    pub admin: Pubkey,
    pub pending_admin: Option<Pubkey>,
    pub paused: bool,
    pub proof_fee_lamports: u64,
    pub treasury: Pubkey,
    pub registered_circuits: u32,
    pub total_proofs_verified: u64,
    pub bump: u8,
}

/// Per-circuit registry entry. PDA seeds: ["circuit", circuit_id u32 LE].
#[account]
#[derive(InitSpace)]
pub struct CircuitRegistry {
    pub circuit_id: u32,
    #[max_len(MAX_CIRCUIT_NAME_LEN)]
    pub name: String,
    pub proof_type: ProofType,
    /// Serialized Groth16 verifying key (alpha|beta|gamma|delta|ic…), big-endian.
    #[max_len(VK_MAX_LEN)]
    pub verifying_key: Vec<u8>,
    pub public_input_count: u8,
    pub enabled: bool,
    pub created_at: i64,
    pub bump: u8,
}

/// Per-user account. PDA seeds: ["user", authority]. `proof_count` is for stats
/// only — it is NOT a PDA seed source (nonces are client-random).
#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub authority: Pubkey,
    pub proof_count: u64,
    pub first_seen: i64,
    pub last_active: i64,
    pub bump: u8,
}

/// Per-proof attestation. PDA seeds: ["proof", authority, nonce u64 LE], where
/// `nonce` is a client-generated cryptographically random u64. The `init`
/// constraint makes a reused nonce fail (auto duplicate rejection).
#[account]
#[derive(InitSpace)]
pub struct ProofAccount {
    pub authority: Pubkey,
    pub circuit_id: u32,
    pub proof_type: ProofType,
    #[max_len(MAX_PUBLIC_INPUTS)]
    pub public_inputs: Vec<[u8; 32]>,
    pub proof_hash: [u8; 32],
    pub verified: bool,
    pub verified_at: i64,
    pub slot_verified: u64,
    pub bump: u8,
}
