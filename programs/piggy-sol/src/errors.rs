use anchor_lang::error_code;

#[error_code]
pub enum MyError {
    #[msg("Invalid deposit amount")]
    InvalidDepositAmount,
    #[msg("Invalid withdrawal amount")]
    InvalidWithdrawAmount,
    #[msg("Vault. balance is too low")]
    LowVaultBalance,
    #[msg("Invalid vault authority")]
    InvalidVaultAuthority,
}
