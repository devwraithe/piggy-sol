use anchor_lang::prelude::*;

use crate::errors::MyError;
use crate::state::Vault;

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    #[account(
        mut,
        has_one = authority,
    )]
    pub vault: Account<'info, Vault>,
    pub system_program: Program<'info, System>,
}

pub fn _withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let authority = ctx.accounts.authority.key();

    require!(amount > 0, MyError::InvalidWithdrawAmount);
    require!(vault.balance > 0, MyError::LowVaultBalance);
    require!(authority == vault.authority, MyError::InvalidVaultAuthority,);

    vault.balance = vault.balance.checked_sub(amount).expect("Withdraw: Failed");

    Ok(())
}
