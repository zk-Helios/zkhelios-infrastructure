use anchor_lang::prelude::*;
use crate::state::ProofType;

#[event]
pub struct CircuitRegistered {
    pub circuit_id: u32,
    pub name: String,
    pub admin: Pubkey,
}

#[event]
pub struct ProofVerified {
    pub authority: Pubkey,
    pub proof_account: Pubkey,
    pub circuit_id: u32,
    pub proof_type: ProofType,
    pub slot: u64,
}

#[event]
pub struct ProofRevoked {
    pub authority: Pubkey,
    pub proof_account: Pubkey,
}

#[event]
pub struct ConfigUpdated {
    pub admin: Pubkey,
}

#[event]
pub struct AdminTransferProposed {
    pub current_admin: Pubkey,
    pub new_admin: Pubkey,
}

#[event]
pub struct AdminTransferAccepted {
    pub old_admin: Pubkey,
    pub new_admin: Pubkey,
}
