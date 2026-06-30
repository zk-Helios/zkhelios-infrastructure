import { describe, it, expect } from "vitest";
import { fieldToBytes32, groth16ToSolana, isWellFormedProof } from "./format";
import type { Groth16Proof } from "./types";

describe("fieldToBytes32", () => {
  it("encodes 0 as 32 zero bytes", () => {
    expect(fieldToBytes32("0")).toEqual(new Array(32).fill(0));
  });

  it("encodes 1 big-endian (last byte = 1)", () => {
    const b = fieldToBytes32("1");
    expect(b.length).toBe(32);
    expect(b[31]).toBe(1);
    expect(b[30]).toBe(0);
  });

  it("encodes 256 as ...,1,0", () => {
    const b = fieldToBytes32("256");
    expect(b[31]).toBe(0);
    expect(b[30]).toBe(1);
  });

  it("is invertible back to the original bigint", () => {
    const value = "123456789012345678901234567890";
    const bytes = fieldToBytes32(value);
    const back = bytes.reduce((acc, byte) => (acc << 8n) | BigInt(byte), 0n);
    expect(back).toBe(BigInt(value));
  });

  it("falls back to zero on garbage input", () => {
    expect(fieldToBytes32("not-a-number")).toEqual(new Array(32).fill(0));
  });
});

const PROOF: Groth16Proof = {
  pi_a: ["1", "2", "1"],
  pi_b: [
    ["3", "4"],
    ["5", "6"],
    ["1", "0"],
  ],
  pi_c: ["7", "8", "1"],
  protocol: "groth16",
  curve: "bn128",
};

describe("groth16ToSolana", () => {
  it("produces the correct byte lengths", () => {
    const args = groth16ToSolana(PROOF, ["9", "10"]);
    expect(args.proofA.length).toBe(64);
    expect(args.proofB.length).toBe(128);
    expect(args.proofC.length).toBe(64);
    expect(args.publicInputs.length).toBe(2);
    expect(args.publicInputs[0].length).toBe(32);
  });
});

describe("isWellFormedProof", () => {
  it("accepts a valid groth16 proof", () => {
    expect(isWellFormedProof(PROOF)).toBe(true);
  });
  it("rejects junk", () => {
    expect(isWellFormedProof({ foo: "bar" })).toBe(false);
    expect(isWellFormedProof(null)).toBe(false);
  });
});
