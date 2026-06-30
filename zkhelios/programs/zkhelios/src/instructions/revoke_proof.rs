use anchor_lang::prelude::*;

use crate::error::ZkHeliosError;
use crate::events::ProofRevoked;
use crate::state::ProofAccount;

#[derive(Accounts)]
pub struct RevokeProof<'info> {
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority @ ZkHeliosError::Unauthorized)]
    pub proof_account: Account<'info, ProofAccount>,
}

/// Soft-delete: marks a proof unverified (kept for explorer history).
pub fn handle_revoke_proof(ctx: Context<RevokeProof>) -> Result<()> {
    let pa = &mut ctx.accounts.proof_account;
    pa.verified = false;
    emit!(ProofRevoked {
        authority: ctx.accounts.authority.key(),
        proof_account: pa.key(),
    });
    Ok(())
}

#[derive(Accounts)]
pub struct CloseProof<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(mut, has_one = authority @ ZkHeliosError::Unauthorized, close = authority)]
    pub proof_account: Account<'info, ProofAccount>,
}

/// Closes a proof account and reclaims its rent to the author.
pub fn handle_close_proof(ctx: Context<CloseProof>) -> Result<()> {
    emit!(ProofRevoked {
        authority: ctx.accounts.authority.key(),
        proof_account: ctx.accounts.proof_account.key(),
    });
    Ok(())
}
