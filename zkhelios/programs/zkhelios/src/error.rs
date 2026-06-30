use anchor_lang::prelude::*;

/// Custom error codes — these must match what the frontend maps (6000+).
#[error_code]
pub enum ZkHeliosError {
    #[msg("Program is paused")]
    ProgramPaused, // 6000
    #[msg("Circuit not found")]
    CircuitNotFound, // 6001
    #[msg("Circuit is disabled")]
    CircuitDisabled, // 6002
    #[msg("Invalid public input count")]
    InvalidPublicInputCount, // 6003
    #[msg("Invalid proof format")]
    InvalidProofFormat, // 6004
    #[msg("Proof verification failed")]
    ProofVerificationFailed, // 6005
    #[msg("Insufficient funds")]
    InsufficientFunds, // 6006
    #[msg("Unauthorized")]
    Unauthorized, // 6007
    #[msg("Invalid admin")]
    InvalidAdmin, // 6008
    #[msg("No pending admin transfer")]
    NoPendingAdminTransfer, // 6009
    #[msg("Nonce already used")]
    NonceAlreadyUsed, // 6010
    #[msg("Invalid verifying key")]
    InvalidVerifyingKey, // 6011
    #[msg("Proof already exists")]
    ProofAlreadyExists, // 6012
}
