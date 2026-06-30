use anchor_lang::prelude::*;

use crate::constants::USER_SEED;
use crate::state::UserAccount;

#[derive(Accounts)]
pub struct CreateUserAccount<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        init_if_needed,
        payer = authority,
        space = 8 + UserAccount::INIT_SPACE,
        seeds = [USER_SEED, authority.key().as_ref()],
        bump
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

/// Idempotent: initializes the caller's UserAccount if it doesn't exist yet.
pub fn handle_create_user_account(ctx: Context<CreateUserAccount>) -> Result<()> {
    let now = Clock::get()?.unix_timestamp;
    let ua = &mut ctx.accounts.user_account;
    if ua.authority == Pubkey::default() {
        // freshly created
        ua.authority = ctx.accounts.authority.key();
        ua.proof_count = 0;
        ua.first_seen = now;
        ua.bump = ctx.bumps.user_account;
    }
    ua.last_active = now;
    Ok(())
}
