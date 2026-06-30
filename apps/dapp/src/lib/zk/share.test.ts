import { describe, it, expect } from "vitest";
import { encodeProof, decodeProof } from "./share";
import type { ProofBundle } from "./types";

const bundle: ProofBundle = {
  id: "pf_test",
  kind: "balance",
  circuitName: "balance_proof",
  proof: {
    pi_a: ["1", "2", "1"],
    pi_b: [["3", "4"], ["5", "6"], ["1", "0"]],
    pi_c: ["7", "8", "1"],
    protocol: "groth16",
    curve: "bn128",
  },
  publicSignals: ["100"],
  publicInputs: { threshold: "100", token: "SOL" },
  createdAt: 1_700_000_000_000,
};

describe("share encode/decode", () => {
  it("round-trips a proof bundle", () => {
    const encoded = encodeProof(bundle);
    const decoded = decodeProof(encoded);
    expect(decoded).not.toBeNull();
    expect(decoded?.kind).toBe("balance");
    expect(decoded?.publicSignals).toEqual(["100"]);
    expect(decoded?.proof.protocol).toBe("groth16");
  });

  it("produces url-safe output (no +, /, =)", () => {
    const encoded = encodeProof(bundle);
    expect(encoded).not.toMatch(/[+/=]/);
  });

  it("returns null for malformed input", () => {
    expect(decodeProof("@@@not-base64@@@")).toBeNull();
  });
});
