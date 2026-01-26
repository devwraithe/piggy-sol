use anchor_lang::prelude::*;

use crate::errors::MyError;
use crate::state::Vault;

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,

    #[account(mut)]
    pub vault: Account<'info, Vault>,

    pub system_program: Program<'info, System>,
}

pub fn _deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
    let vault = &mut ctx.accounts.vault;
    let authority = ctx.accounts.authority.key();

    require!(amount > 0, MyError::InvalidDepositAmount);
    require!(authority == vault.authority, MyError::InvalidVaultAuthority,);

    vault.balance = vault.balance.checked_add(amount).expect("Deposit: Failed");

    Ok(())
}
