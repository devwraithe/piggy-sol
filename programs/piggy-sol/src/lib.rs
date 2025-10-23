#![allow(deprecated)]
#![allow(unexpected_cfgs)]

use anchor_lang::prelude::*;

mod errors;
mod instructions;
mod state;

use instructions::*;

declare_id!("2RgCQ7K7meNPprtSvXNpdkohA4ude2LpFnratZg8yytR");

#[program]
pub mod piggy_sol {

    use super::*;

    pub fn initialize_account(ctx: Context<InitializeAccount>) -> Result<()> {
        _init_account(ctx)
    }

    pub fn deposit(ctx: Context<Deposit>, amount: u64) -> Result<()> {
        _deposit(ctx, amount)
    }

    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        _withdraw(ctx, amount)
    }
}
