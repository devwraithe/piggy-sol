use anchor_lang::prelude::*;

declare_id!("2RgCQ7K7meNPprtSvXNpdkohA4ude2LpFnratZg8yytR");

#[program]
pub mod piggy_sol {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
