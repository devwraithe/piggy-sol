use anchor_lang::prelude::*;

use crate::errors::MyError;
use crate::state::UserAccount;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user_authority: Signer<'info>,
    #[account(mut)]
    pub user_account: Account<'info, UserAccount>,
    pub system_program: Program<'info, System>,
}

pub fn _deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    msg!("Deposit: Initialize");

    let user_account = &mut ctx.accounts.user_account;
    let user_authority = ctx.accounts.user_authority.key();

    require!(amount > 0, MyError::InvalidDepositAmount);
    require!(
        user_authority == user_account.user_authority,
        MyError::InvalidUserAuthority,
    );

    user_account.balance = user_account
        .balance
        .checked_add(amount)
        .expect("Deposit: Failed");

    msg!("Deposit: Complete");
    msg!("Account Balance: {}", user_account.balance);

    Ok(())
}
