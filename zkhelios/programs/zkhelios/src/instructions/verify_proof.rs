use anchor_lang::prelude::*;
use anchor_lang::system_program::{transfer, Transfer};
use solana_keccak_hasher::hashv;

use crate::constants::{
    CIRCUIT_SEED, MAX_PUBLIC_INPUTS, PROOF_SEED, USER_SEED, VERIFIER_CONFIG_SEED,
};
use crate::error::ZkHeliosError;
use crate::events::ProofVerified;
use crate::state::{CircuitRegistry, ProofAccount, UserAccount, VerifierConfig};
use crate::zk::groth16;

#[derive(Accounts)]
#[instruction(
    circuit_id: u32,
    proof_a: [u8; 64],
    proof_b: [u8; 128],
    proof_c: [u8; 64],
    public_inputs: Vec<[u8; 32]>,
    nonce: u64
)]
pub struct VerifyProof<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(mut, seeds = [VERIFIER_CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, VerifierConfig>,
    #[account(
        seeds = [CIRCUIT_SEED, &circuit_id.to_le_bytes()],
        bump = circuit.bump,
    )]
    pub circuit: Account<'info, CircuitRegistry>,
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [USER_SEED, user.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    // `init` (not init_if_needed): a reused nonce already exists → auto-rejected.
    #[account(
        init,
        payer = user,
        space = 8 + ProofAccount::INIT_SPACE,
        seeds = [PROOF_SEED, user.key().as_ref(), &nonce.to_le_bytes()],
        bump
    )]
    pub proof_account: Account<'info, ProofAccount>,
    /// CHECK: validated to equal `config.treasury`; receives the proof fee.
    #[account(mut, address = config.treasury)]
    pub treasury: SystemAccount<'info>,
    pub system_program: Program<'info, System>,
}

#[allow(clippy::too_many_arguments)]
pub fn handle_verify_proof(
    ctx: Context<VerifyProof>,
    circuit_id: u32,
    proof_a: [u8; 64],
    proof_b: [u8; 128],
    proof_c: [u8; 64],
    public_inputs: Vec<[u8; 32]>,
    _nonce: u64,
) -> Result<()> {
    let config = &ctx.accounts.config;
    let circuit = &ctx.accounts.circuit;

    require!(!config.paused, ZkHeliosError::ProgramPaused);
    require!(circuit.enabled, ZkHeliosError::CircuitDisabled);
    require!(
        public_inputs.len() == circuit.public_input_count as usize,
        ZkHeliosError::InvalidPublicInputCount
    );
    require!(public_inputs.len() <= MAX_PUBLIC_INPUTS, ZkHeliosError::InvalidPublicInputCount);

    // The real Groth16 verification (alt_bn128 syscalls).
    let valid = groth16::verify_groth16(
        &circuit.verifying_key,
        circuit.public_input_count as usize,
        &proof_a,
        &proof_b,
        &proof_c,
        &public_inputs,
    )?;
    require!(valid, ZkHeliosError::ProofVerificationFailed);

    // Collect fee (if any) before writing state.
    let fee = config.proof_fee_lamports;
    if fee > 0 {
        require!(ctx.accounts.user.lamports() >= fee, ZkHeliosError::InsufficientFunds);
        transfer(
            CpiContext::new(
                anchor_lang::system_program::ID,
                Transfer {
                    from: ctx.accounts.user.to_account_info(),
                    to: ctx.accounts.treasury.to_account_info(),
                },
            ),
            fee,
        )?;
    }

    let now = Clock::get()?.unix_timestamp;
    let slot = Clock::get()?.slot;

    // User account (init_if_needed may have just created it).
    let user_key = ctx.accounts.user.key();
    let proof_type = circuit.proof_type;
    let ua = &mut ctx.accounts.user_account;
    if ua.authority == Pubkey::default() {
        ua.authority = user_key;
        ua.first_seen = now;
        ua.proof_count = 0;
        ua.bump = ctx.bumps.user_account;
    }
    ua.proof_count = ua.proof_count.checked_add(1).ok_or(ZkHeliosError::InvalidProofFormat)?;
    ua.last_active = now;

    // Proof attestation.
    let proof_hash = hashv(&[proof_a.as_slice(), proof_b.as_slice(), proof_c.as_slice()]).to_bytes();
    let pa = &mut ctx.accounts.proof_account;
    pa.authority = user_key;
    pa.circuit_id = circuit_id;
    pa.proof_type = proof_type;
    pa.public_inputs = public_inputs;
    pa.proof_hash = proof_hash;
    pa.verified = true;
    pa.verified_at = now;
    pa.slot_verified = slot;
    pa.bump = ctx.bumps.proof_account;

    let proof_key = pa.key();
    let config = &mut ctx.accounts.config;
    config.total_proofs_verified = config.total_proofs_verified.saturating_add(1);

    emit!(ProofVerified {
        authority: user_key,
        proof_account: proof_key,
        circuit_id,
        proof_type,
        slot,
    });
    Ok(())
}
