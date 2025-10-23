use anchor_lang::prelude::*;

use crate::errors::MyError;
use crate::state::UserAccount;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user_authority: Signer<'info>,
    #[account(
        mut,
        has_one = user_authority,
    )]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    msg!("Withdraw: Initialize");

    let user_account = &mut ctx.accounts.user_account;
    let user_authority = ctx.accounts.user_authority.key();

    require!(amount > 0, MyError::InvalidWithdrawAmount);
    require!(user_account.balance > 0, MyError::LowAccountBalance);
    require!(
        user_authority == user_account.user_authority,
        MyError::InvalidUserAuthority,
    );

    user_account.balance = user_account
        .balance
        .checked_sub(amount)
        .expect("Withdraw: Failed");

    msg!("Withdraw: Complete");
    msg!("Account Balance: {}", user_account.balance);

    Ok(())
}
