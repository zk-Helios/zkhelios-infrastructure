import nacl from "tweetnacl";
import bs58 from "bs58";

export const SIWS_STATEMENT =
  "Sign in to zkHelios. This signature proves you control this wallet. It costs no SOL and authorizes no transaction.";
export const SIWS_VERSION = "1";
export const SIWS_ALLOWED_CHAINS = ["solana:mainnet", "solana:devnet", "solana:localnet"];

export interface SiwsComponents {
  nonce: string;
  statement: string;
  uri: string;
  version: string;
  domain: string;
  issuedAt: string;
}

/** Build the canonical SIWS message (must match the client's construction). */
export function buildSiwsMessage(pubkey: string, c: SiwsComponents): string {
  return [
    `${c.domain} wants you to sign in with your Solana account:`,
    pubkey,
    "",
    c.statement,
    "",
    `URI: ${c.uri}`,
    `Version: ${c.version}`,
    `Chain ID: solana:devnet`,
    `Nonce: ${c.nonce}`,
    `Issued At: ${c.issuedAt}`,
  ].join("\n");
}

export interface ParsedSiws {
  pubkey: string;
  nonce?: string;
  chainId?: string;
  issuedAt?: string;
  domain?: string;
}

export function parseSiwsMessage(message: string): ParsedSiws {
  const lines = message.split("\n");
  const field = (label: string) =>
    lines.find((l) => l.startsWith(`${label}: `))?.slice(label.length + 2);
  return {
    pubkey: lines[1]?.trim() ?? "",
    nonce: field("Nonce"),
    chainId: field("Chain ID"),
    issuedAt: field("Issued At"),
    domain: lines[0]?.split(" wants you")[0],
  };
}

/** Valid base58 that decodes to exactly 32 bytes (ed25519 pubkey length).
 *  Session 10 hardening can add a PublicKey.isOnCurve check; an off-curve key
 *  also fails signature verification below. */
export function isValidPubkey(value: string): boolean {
  try {
    return bs58.decode(value).length === 32;
  } catch {
    return false;
  }
}

/** Verify an ed25519 signature over a message for a base58 pubkey. */
export function verifySignature(message: string, signatureB58: string, pubkey: string): boolean {
  try {
    const key = bs58.decode(pubkey);
    if (key.length !== 32) return false;
    return nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signatureB58),
      key,
    );
  } catch {
    return false;
  }
}

export function generateNonce(): string {
  return bs58.encode(nacl.randomBytes(16));
}
