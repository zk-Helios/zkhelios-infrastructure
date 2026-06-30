use anchor_lang::prelude::*;

use crate::constants::VERIFIER_CONFIG_SEED;
use crate::error::ZkHeliosError;
use crate::events::ConfigUpdated;
use crate::state::VerifierConfig;

#[derive(Accounts)]
pub struct UpdateConfig<'info> {
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [VERIFIER_CONFIG_SEED],
        bump = config.bump,
        has_one = admin @ ZkHeliosError::Unauthorized,
    )]
    pub config: Account<'info, VerifierConfig>,
}

pub fn handle_update_config(
    ctx: Context<UpdateConfig>,
    new_fee: Option<u64>,
    new_paused: Option<bool>,
    new_treasury: Option<Pubkey>,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    if let Some(fee) = new_fee {
        config.proof_fee_lamports = fee;
    }
    if let Some(paused) = new_paused {
        config.paused = paused;
    }
    if let Some(treasury) = new_treasury {
        config.treasury = treasury;
    }
    emit!(ConfigUpdated { admin: ctx.accounts.admin.key() });
    Ok(())
}
