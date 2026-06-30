/**
 * SIWS-style ("Sign In With Solana") message construction + parsing.
 *
 * There is no finalized SIWS EIP equivalent, so we use the emerging plaintext
 * format below and verify the signature with ed25519 (tweetnacl) server-side.
 */

export const SIWS_STATEMENT =
  "Sign this message to authenticate with zkHelios. This won't cost any SOL and does not authorize any transaction.";

export const SIWS_VERSION = "1";

/** Chain ids we accept for sign-in. */
export const SIWS_ALLOWED_CHAINS = ["solana:mainnet", "solana:devnet", "solana:localnet"];

export interface SiwsParams {
  pubkey: string;
  nonce: string;
  chainId: string;
  uri: string;
  domain: string;
  issuedAt: string;
  statement?: string;
}

/** Build the canonical message the wallet will sign. */
export function buildSiwsMessage(p: SiwsParams): string {
  return [
    `${p.domain} wants you to sign in with your Solana account:`,
    p.pubkey,
    "",
    p.statement ?? SIWS_STATEMENT,
    "",
    `URI: ${p.uri}`,
    `Version: ${SIWS_VERSION}`,
    `Chain ID: ${p.chainId}`,
    `Nonce: ${p.nonce}`,
    `Issued At: ${p.issuedAt}`,
  ].join("\n");
}

export interface ParsedSiws {
  pubkey: string;
  nonce?: string;
  chainId?: string;
  issuedAt?: string;
  uri?: string;
}

/** Extract the verifiable fields from a signed message. */
export function parseSiwsMessage(message: string): ParsedSiws {
  const lines = message.split("\n");
  const field = (label: string) =>
    lines.find((l) => l.startsWith(`${label}: `))?.slice(label.length + 2);
  return {
    pubkey: lines[1]?.trim() ?? "",
    nonce: field("Nonce"),
    chainId: field("Chain ID"),
    issuedAt: field("Issued At"),
    uri: field("URI"),
  };
}

/** Cryptographically random nonce (16 bytes hex). */
export function generateNonce(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
