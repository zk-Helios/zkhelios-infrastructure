use anchor_lang::prelude::*;

#[constant]
pub const VERIFIER_CONFIG_SEED: &[u8] = b"verifier_config";
#[constant]
pub const CIRCUIT_SEED: &[u8] = b"circuit";
#[constant]
pub const USER_SEED: &[u8] = b"user";
#[constant]
pub const PROOF_SEED: &[u8] = b"proof";

/// Maximum public inputs a circuit may declare.
pub const MAX_PUBLIC_INPUTS: usize = 8;
/// Maximum circuit name length (chars).
pub const MAX_CIRCUIT_NAME_LEN: usize = 32;

/// Groth16/BN254 byte sizes (uncompressed, big-endian) for the alt_bn128 syscalls.
pub const G1_LEN: usize = 64; // (x, y), 32 bytes each
pub const G2_LEN: usize = 128; // ((x.c1,x.c0),(y.c1,y.c0)), 32 bytes each
pub const FQ_LEN: usize = 32;

/// Fixed portion of a verifying key: alpha_g1 + beta_g2 + gamma_g2 + delta_g2.
pub const VK_FIXED_LEN: usize = G1_LEN + G2_LEN + G2_LEN + G2_LEN; // 448
/// Max VK size = fixed + (MAX_PUBLIC_INPUTS + 1) IC points (G1 each).
pub const VK_MAX_LEN: usize = VK_FIXED_LEN + G1_LEN * (MAX_PUBLIC_INPUTS + 1); // 1024

/// BN254 base field modulus q (big-endian), used to negate G1 points.
pub const FIELD_MODULUS: [u8; 32] = [
    0x30, 0x64, 0x4e, 0x72, 0xe1, 0x31, 0xa0, 0x29, 0xb8, 0x50, 0x45, 0xb6, 0x81, 0x81, 0x58, 0x5d,
    0x97, 0x81, 0x6a, 0x91, 0x68, 0x71, 0xca, 0x8d, 0x3c, 0x20, 0x8c, 0x16, 0xd8, 0x7c, 0xfd, 0x47,
];
