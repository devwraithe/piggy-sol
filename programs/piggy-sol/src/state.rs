use anchor_lang::prelude::*;

#[account]
#[derive(InitSpace)]
pub struct UserAccount {
    pub user_authority: Pubkey, // user's wallet
    pub balance: u64,           // user's balance
}
