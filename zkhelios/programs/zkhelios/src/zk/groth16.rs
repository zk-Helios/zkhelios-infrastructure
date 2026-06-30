//! On-chain Groth16 verification over BN254 using Solana's `alt_bn128` syscalls.
//!
//! Verifies `e(A, B) == e(alpha, beta) · e(vk_x, gamma) · e(C, delta)` by
//! rearranging to a single pairing product check:
//! `e(-A, B) · e(alpha, beta) · e(vk_x, gamma) · e(C, delta) == 1`.
//!
//! All points are uncompressed, big-endian (the alt_bn128 / EIP-197 layout):
//! G1 = 64 bytes (x‖y), G2 = 128 bytes. The verifying key is stored as
//! `alpha_g1 ‖ beta_g2 ‖ gamma_g2 ‖ delta_g2 ‖ ic[0..n+1]`.

use anchor_lang::prelude::*;
use solana_bn254::prelude::{
    alt_bn128_g1_addition_be as alt_bn128_addition,
    alt_bn128_g1_multiplication_be as alt_bn128_multiplication,
    alt_bn128_pairing_be as alt_bn128_pairing,
};

use crate::constants::*;
use crate::error::ZkHeliosError;

struct VerifyingKey<'a> {
    alpha: &'a [u8], // G1 (64)
    beta: &'a [u8],  // G2 (128)
    gamma: &'a [u8], // G2 (128)
    delta: &'a [u8], // G2 (128)
    ic: &'a [u8],    // G1 * (n + 1)
}

fn parse_vk(bytes: &[u8], public_input_count: usize) -> Result<VerifyingKey<'_>> {
    let expected = VK_FIXED_LEN + G1_LEN * (public_input_count + 1);
    require!(bytes.len() == expected, ZkHeliosError::InvalidVerifyingKey);
    Ok(VerifyingKey {
        alpha: &bytes[0..G1_LEN],
        beta: &bytes[G1_LEN..G1_LEN + G2_LEN],
        gamma: &bytes[G1_LEN + G2_LEN..G1_LEN + 2 * G2_LEN],
        delta: &bytes[G1_LEN + 2 * G2_LEN..VK_FIXED_LEN],
        ic: &bytes[VK_FIXED_LEN..],
    })
}

/// Negate a G1 point: (x, y) -> (x, q - y mod q). Big-endian in/out.
fn negate_g1(point: &[u8; G1_LEN]) -> [u8; G1_LEN] {
    let mut out = [0u8; G1_LEN];
    out[..FQ_LEN].copy_from_slice(&point[..FQ_LEN]);
    let y = &point[FQ_LEN..];
    if y.iter().any(|&b| b != 0) {
        // q - y, big-endian byte subtraction (y < q assumed for valid points).
        let mut borrow: i16 = 0;
        for i in (0..FQ_LEN).rev() {
            let mut diff = FIELD_MODULUS[i] as i16 - y[i] as i16 - borrow;
            if diff < 0 {
                diff += 256;
                borrow = 1;
            } else {
                borrow = 0;
            }
            out[FQ_LEN + i] = diff as u8;
        }
    }
    out
}

/// Verify a Groth16 proof. Returns `Ok(true)` iff the pairing equation holds.
pub fn verify_groth16(
    vk_bytes: &[u8],
    public_input_count: usize,
    proof_a: &[u8; G1_LEN],
    proof_b: &[u8; G2_LEN],
    proof_c: &[u8; G1_LEN],
    public_inputs: &[[u8; 32]],
) -> Result<bool> {
    require!(
        public_inputs.len() == public_input_count,
        ZkHeliosError::InvalidPublicInputCount
    );
    let vk = parse_vk(vk_bytes, public_input_count)?;

    // vk_x = ic[0] + Σ_i public_inputs[i] · ic[i+1]
    let mut vk_x = [0u8; G1_LEN];
    vk_x.copy_from_slice(&vk.ic[0..G1_LEN]);

    for (i, input) in public_inputs.iter().enumerate() {
        let ic_point = &vk.ic[(i + 1) * G1_LEN..(i + 2) * G1_LEN];

        // ecMul: G1(64) ‖ scalar(32) -> G1(64)
        let mut mul_in = [0u8; G1_LEN + FQ_LEN];
        mul_in[..G1_LEN].copy_from_slice(ic_point);
        mul_in[G1_LEN..].copy_from_slice(input);
        let term =
            alt_bn128_multiplication(&mul_in).map_err(|_| ZkHeliosError::ProofVerificationFailed)?;

        // ecAdd: G1(64) ‖ G1(64) -> G1(64)
        let mut add_in = [0u8; G1_LEN * 2];
        add_in[..G1_LEN].copy_from_slice(&vk_x);
        add_in[G1_LEN..].copy_from_slice(&term);
        let sum =
            alt_bn128_addition(&add_in).map_err(|_| ZkHeliosError::ProofVerificationFailed)?;
        vk_x.copy_from_slice(&sum);
    }

    let neg_a = negate_g1(proof_a);

    // Pairing input: [(-A,B), (alpha,beta), (vk_x,gamma), (C,delta)] (4 × 192 bytes)
    let mut input = Vec::with_capacity((G1_LEN + G2_LEN) * 4);
    input.extend_from_slice(&neg_a);
    input.extend_from_slice(proof_b);
    input.extend_from_slice(vk.alpha);
    input.extend_from_slice(vk.beta);
    input.extend_from_slice(&vk_x);
    input.extend_from_slice(vk.gamma);
    input.extend_from_slice(proof_c);
    input.extend_from_slice(vk.delta);

    let result =
        alt_bn128_pairing(&input).map_err(|_| ZkHeliosError::ProofVerificationFailed)?;

    // 32-byte big-endian; 0x..01 means the pairing product is the identity (valid).
    let mut expected = [0u8; 32];
    expected[31] = 1;
    Ok(result == expected)
}
