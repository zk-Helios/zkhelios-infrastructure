use anchor_lang::prelude::*;

use crate::constants::{
    CIRCUIT_SEED, G1_LEN, MAX_CIRCUIT_NAME_LEN, MAX_PUBLIC_INPUTS, VERIFIER_CONFIG_SEED,
    VK_FIXED_LEN,
};
use crate::error::ZkHeliosError;
use crate::events::CircuitRegistered;
use crate::state::{CircuitRegistry, ProofType, VerifierConfig};

#[derive(Accounts)]
#[instruction(circuit_id: u32)]
pub struct RegisterCircuit<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [VERIFIER_CONFIG_SEED],
        bump = config.bump,
        has_one = admin @ ZkHeliosError::Unauthorized,
    )]
    pub config: Account<'info, VerifierConfig>,
    #[account(
        init,
        payer = admin,
        space = 8 + CircuitRegistry::INIT_SPACE,
        seeds = [CIRCUIT_SEED, &circuit_id.to_le_bytes()],
        bump
    )]
    pub circuit: Account<'info, CircuitRegistry>,
    pub system_program: Program<'info, System>,
}

pub fn handle_register_circuit(
    ctx: Context<RegisterCircuit>,
    circuit_id: u32,
    name: String,
    proof_type: ProofType,
    verifying_key: Vec<u8>,
    public_input_count: u8,
) -> Result<()> {
    require!(name.len() <= MAX_CIRCUIT_NAME_LEN, ZkHeliosError::InvalidProofFormat);
    require!(
        (public_input_count as usize) <= MAX_PUBLIC_INPUTS,
        ZkHeliosError::InvalidPublicInputCount
    );
    // VK must contain exactly the fixed points + (n + 1) IC points.
    let expected_vk_len = VK_FIXED_LEN + G1_LEN * (public_input_count as usize + 1);
    require!(
        verifying_key.len() == expected_vk_len,
        ZkHeliosError::InvalidVerifyingKey
    );

    let circuit = &mut ctx.accounts.circuit;
    circuit.circuit_id = circuit_id;
    circuit.name = name.clone();
    circuit.proof_type = proof_type;
    circuit.verifying_key = verifying_key;
    circuit.public_input_count = public_input_count;
    circuit.enabled = true;
    circuit.created_at = Clock::get()?.unix_timestamp;
    circuit.bump = ctx.bumps.circuit;

    let config = &mut ctx.accounts.config;
    config.registered_circuits = config.registered_circuits.saturating_add(1);

    emit!(CircuitRegistered {
        circuit_id,
        name,
        admin: ctx.accounts.admin.key(),
    });
    Ok(())
}

#[derive(Accounts)]
#[instruction(circuit_id: u32)]
pub struct SetCircuitEnabled<'info> {
    pub admin: Signer<'info>,
    #[account(
        seeds = [VERIFIER_CONFIG_SEED],
        bump = config.bump,
        has_one = admin @ ZkHeliosError::Unauthorized,
    )]
    pub config: Account<'info, VerifierConfig>,
    #[account(mut, seeds = [CIRCUIT_SEED, &circuit_id.to_le_bytes()], bump = circuit.bump)]
    pub circuit: Account<'info, CircuitRegistry>,
}

/// Enable/disable a circuit (admin only).
pub fn handle_set_circuit_enabled(
    ctx: Context<SetCircuitEnabled>,
    _circuit_id: u32,
    enabled: bool,
) -> Result<()> {
    ctx.accounts.circuit.enabled = enabled;
    Ok(())
}
