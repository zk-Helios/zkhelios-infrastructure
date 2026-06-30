import { describe, it, expect } from "vitest";
import { classifyQuery } from "./classify";

describe("classifyQuery", () => {
  it("detects a slot (numeric)", () => {
    expect(classifyQuery("287400000").kind).toBe("slot");
  });
  it("detects a signature (88-char base58)", () => {
    expect(classifyQuery("a".repeat(88)).kind).toBe("signature");
  });
  it("detects a pubkey (32-44 base58)", () => {
    expect(classifyQuery("So11111111111111111111111111111111111111112").kind).toBe("pubkey");
  });
  it("detects a short proof id", () => {
    expect(classifyQuery("abcdEFGH").kind).toBe("proof");
  });
  it("rejects non-base58 / empty", () => {
    expect(classifyQuery("not a key!").kind).toBe("unknown");
    expect(classifyQuery("").kind).toBe("unknown");
  });
});
