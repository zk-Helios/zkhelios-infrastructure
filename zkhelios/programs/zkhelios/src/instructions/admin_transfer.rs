use anchor_lang::prelude::*;

use crate::constants::VERIFIER_CONFIG_SEED;
use crate::error::ZkHeliosError;
use crate::events::{AdminTransferAccepted, AdminTransferProposed};
use crate::state::VerifierConfig;

#[derive(Accounts)]
pub struct ProposeAdminTransfer<'info> {
    pub admin: Signer<'info>,
    #[account(
        mut,
        seeds = [VERIFIER_CONFIG_SEED],
        bump = config.bump,
        has_one = admin @ ZkHeliosError::Unauthorized,
    )]
    pub config: Account<'info, VerifierConfig>,
}

pub fn handle_propose_admin_transfer(
    ctx: Context<ProposeAdminTransfer>,
    new_admin: Pubkey,
) -> Result<()> {
    let config = &mut ctx.accounts.config;
    config.pending_admin = Some(new_admin);
    emit!(AdminTransferProposed {
        current_admin: config.admin,
        new_admin,
    });
    Ok(())
}

#[derive(Accounts)]
pub struct AcceptAdminTransfer<'info> {
    pub new_admin: Signer<'info>,
    #[account(mut, seeds = [VERIFIER_CONFIG_SEED], bump = config.bump)]
    pub config: Account<'info, VerifierConfig>,
}

pub fn handle_accept_admin_transfer(ctx: Context<AcceptAdminTransfer>) -> Result<()> {
    let config = &mut ctx.accounts.config;
    let pending = config.pending_admin.ok_or(ZkHeliosError::NoPendingAdminTransfer)?;
    require_keys_eq!(pending, ctx.accounts.new_admin.key(), ZkHeliosError::InvalidAdmin);

    let old_admin = config.admin;
    config.admin = ctx.accounts.new_admin.key();
    config.pending_admin = None;

    emit!(AdminTransferAccepted {
        old_admin,
        new_admin: config.admin,
    });
    Ok(())
}
