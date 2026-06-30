pub mod constants;
pub mod error;
pub mod events;
pub mod instructions;
pub mod state;
pub mod zk;

use anchor_lang::prelude::*;

pub use instructions::*;
pub use state::*;

declare_id!("Ei5ZkTC2M631gSpBoz3wz8szq7rikrUgRbzfwQ353w8Q");

#[program]
pub mod zkhelios {
    use super::*;

    /// Create the singleton VerifierConfig (once).
    pub fn initialize(
        ctx: Context<Initialize>,
        admin: Pubkey,
        treasury: Pubkey,
        proof_fee_lamports: u64,
    ) -> Result<()> {
        instructions::initialize::handle_initialize(ctx, admin, treasury, proof_fee_lamports)
    }

    /// Register a circuit + its verifying key (admin only).
    pub fn register_circuit(
        ctx: Context<RegisterCircuit>,
        circuit_id: u32,
        name: String,
        proof_type: ProofType,
        verifying_key: Vec<u8>,
        public_input_count: u8,
    ) -> Result<()> {
        instructions::register_circuit::handle_register_circuit(
            ctx,
            circuit_id,
            name,
            proof_type,
            verifying_key,
            public_input_count,
        )
    }

    /// Enable or disable a registered circuit (admin only).
    pub fn set_circuit_enabled(
        ctx: Context<SetCircuitEnabled>,
        circuit_id: u32,
        enabled: bool,
    ) -> Result<()> {
        instructions::register_circuit::handle_set_circuit_enabled(ctx, circuit_id, enabled)
    }

    /// Initialize the caller's UserAccount (idempotent).
    pub fn create_user_account(ctx: Context<CreateUserAccount>) -> Result<()> {
        instructions::create_user_account::handle_create_user_account(ctx)
    }

    /// Verify a Groth16 proof on-chain and record an attestation.
    pub fn verify_proof(
        ctx: Context<VerifyProof>,
        circuit_id: u32,
        proof_a: [u8; 64],
        proof_b: [u8; 128],
        proof_c: [u8; 64],
        public_inputs: Vec<[u8; 32]>,
        nonce: u64,
    ) -> Result<()> {
        instructions::verify_proof::handle_verify_proof(
            ctx,
            circuit_id,
            proof_a,
            proof_b,
            proof_c,
            public_inputs,
            nonce,
        )
    }

    /// Soft-revoke one of your own proofs.
    pub fn revoke_proof(ctx: Context<RevokeProof>) -> Result<()> {
        instructions::revoke_proof::handle_revoke_proof(ctx)
    }

    /// Close one of your own proof accounts and reclaim rent.
    pub fn close_proof(ctx: Context<CloseProof>) -> Result<()> {
        instructions::revoke_proof::handle_close_proof(ctx)
    }

    /// Update config fields (admin only).
    pub fn update_config(
        ctx: Context<UpdateConfig>,
        new_fee: Option<u64>,
        new_paused: Option<bool>,
        new_treasury: Option<Pubkey>,
    ) -> Result<()> {
        instructions::update_config::handle_update_config(ctx, new_fee, new_paused, new_treasury)
    }

    /// Two-step admin transfer: current admin proposes.
    pub fn propose_admin_transfer(
        ctx: Context<ProposeAdminTransfer>,
        new_admin: Pubkey,
    ) -> Result<()> {
        instructions::admin_transfer::handle_propose_admin_transfer(ctx, new_admin)
    }

    /// Two-step admin transfer: proposed admin accepts.
    pub fn accept_admin_transfer(ctx: Context<AcceptAdminTransfer>) -> Result<()> {
        instructions::admin_transfer::handle_accept_admin_transfer(ctx)
    }
}
