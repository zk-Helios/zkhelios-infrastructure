import { describe, it, expect } from "vitest";
import nacl from "tweetnacl";
import bs58 from "bs58";
import {
  buildSiwsMessage,
  parseSiwsMessage,
  verifySignature,
  isValidPubkey,
  generateNonce,
} from "./siws";

function makeWallet() {
  const kp = nacl.sign.keyPair();
  return { kp, pubkey: bs58.encode(kp.publicKey) };
}

const components = (nonce: string) => ({
  nonce,
  statement: "Sign in to zkHelios.",
  uri: "https://localhost:3001",
  version: "1",
  domain: "localhost:3001",
  issuedAt: new Date().toISOString(),
});

describe("SIWS message + signature", () => {
  it("verifies a genuine ed25519 signature", () => {
    const { kp, pubkey } = makeWallet();
    const msg = buildSiwsMessage(pubkey, components(generateNonce()));
    const sig = bs58.encode(nacl.sign.detached(new TextEncoder().encode(msg), kp.secretKey));
    expect(verifySignature(msg, sig, pubkey)).toBe(true);
  });

  it("rejects a tampered message", () => {
    const { kp, pubkey } = makeWallet();
    const msg = buildSiwsMessage(pubkey, components(generateNonce()));
    const sig = bs58.encode(nacl.sign.detached(new TextEncoder().encode(msg), kp.secretKey));
    expect(verifySignature(msg + "x", sig, pubkey)).toBe(false);
  });

  it("rejects a signature from a different key", () => {
    const a = makeWallet();
    const b = makeWallet();
    const msg = buildSiwsMessage(a.pubkey, components(generateNonce()));
    const sig = bs58.encode(nacl.sign.detached(new TextEncoder().encode(msg), b.kp.secretKey));
    expect(verifySignature(msg, sig, a.pubkey)).toBe(false);
  });

  it("parses nonce / chain id / issuedAt / pubkey", () => {
    const { pubkey } = makeWallet();
    const nonce = generateNonce();
    const msg = buildSiwsMessage(pubkey, components(nonce));
    const parsed = parseSiwsMessage(msg);
    expect(parsed.pubkey).toBe(pubkey);
    expect(parsed.nonce).toBe(nonce);
    expect(parsed.chainId).toBe("solana:devnet");
    expect(parsed.issuedAt).toBeTruthy();
  });
});

describe("pubkey validation", () => {
  it("accepts a real on-curve pubkey", () => {
    const { pubkey } = makeWallet();
    expect(isValidPubkey(pubkey)).toBe(true);
  });
  it("rejects garbage", () => {
    expect(isValidPubkey("not-a-key")).toBe(false);
    expect(isValidPubkey("")).toBe(false);
  });
});

describe("generateNonce", () => {
  it("is unique and base58", () => {
    const a = generateNonce();
    const b = generateNonce();
    expect(a).not.toBe(b);
    expect(() => bs58.decode(a)).not.toThrow();
  });
});
