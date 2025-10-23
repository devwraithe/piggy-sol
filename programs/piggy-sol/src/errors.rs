use anchor_lang::error_code;

#[error_code]
pub enum MyError {
    #[msg("Invalid deposit amount")]
    InvalidDepositAmount,
    #[msg("Invalid withdrawal amount")]
    InvalidWithdrawAmount,
    #[msg("User account balance is too low")]
    LowAccountBalance,
    #[msg("Invalid user authority")]
    InvalidUserAuthority,
}
