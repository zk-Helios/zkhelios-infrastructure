import { describe, it, expect } from "vitest";
import { normalizeProofType, toBigInt, toBase58 } from "./normalize";

describe("normalizeProofType", () => {
  it("handles Anchor enum objects", () => {
    expect(normalizeProofType({ balance: {} })).toBe("BALANCE");
    expect(normalizeProofType({ membership: {} })).toBe("MEMBERSHIP");
  });
  it("handles strings (any case)", () => {
    expect(normalizeProofType("ownership")).toBe("OWNERSHIP");
    expect(normalizeProofType("AGE")).toBe("AGE");
  });
  it("falls back to CUSTOM for unknown", () => {
    expect(normalizeProofType("nope")).toBe("CUSTOM");
    expect(normalizeProofType(undefined)).toBe("CUSTOM");
  });
});

describe("toBigInt", () => {
  it("coerces numbers, strings, and BN-likes", () => {
    expect(toBigInt(42)).toBe(42n);
    expect(toBigInt("100")).toBe(100n);
    expect(toBigInt({ toString: () => "7" })).toBe(7n);
    expect(toBigInt(undefined)).toBe(0n);
  });
});

describe("toBase58", () => {
  it("passes through strings and unwraps PublicKey-likes", () => {
    expect(toBase58("abc")).toBe("abc");
    expect(toBase58({ toBase58: () => "XYZ" })).toBe("XYZ");
  });
});
