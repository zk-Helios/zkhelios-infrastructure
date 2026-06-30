use anchor_lang::prelude::*;

use crate::constants::VERIFIER_CONFIG_SEED;
use crate::state::VerifierConfig;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,
    #[account(
        init,
        payer = payer,
        space = 8 + VerifierConfig::INIT_SPACE,
        seeds = [VERIFIER_CONFIG_SEED],
        bump
    )]
    pub config: Account<'info, VerifierConfig>,
    pub system_program: Program<'info, System>,
}

/// Creates the singleton VerifierConfig. Callable once (the `init` constraint
/// rejects a second call).
pub fn handle_initialize(
    ctx: Context<Initialize>,
    admin: Pubkey,
    treasury: Pubkey,
    proof_fee_lamports: u64,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.admin = admin;
    config.pending_admin = None;
    config.paused = false;
    config.proof_fee_lamports = proof_fee_lamports;
    config.treasury = treasury;
    config.registered_circuits = 0;
    config.total_proofs_verified = 0;
    config.bump = ctx.bumps.config;
    Ok(())
}
