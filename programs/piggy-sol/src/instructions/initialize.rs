use anchor_lang::prelude::*;

use crate::state::UserAccount;

#[derive(Accounts)]
pub struct InitializeAccount<'info> {
    #[account(mut)]
    pub user_authority: Signer<'info>,
    #[account(
        init,
        payer = user_authority,
        space = 8 + UserAccount::INIT_SPACE,
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

pub fn _init_account(ctx: Context<InitializeAccount>) -> Result<()> {
    msg!("InitUserAccount: Initialize");

    let user_account = &mut ctx.accounts.user_account;

    user_account.user_authority = ctx.accounts.user_authority.key();
    user_account.balance = 0;

    msg!("InitUserAccount: Complete");
    msg!("Account Balance: {}", user_account.balance);

    Ok(())
}
