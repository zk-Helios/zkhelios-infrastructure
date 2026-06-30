import { PROGRAM_ERRORS } from "./anchor";

/**
 * Maps noisy wallet / Solana RPC / Anchor program errors to friendly messages.
 * Returns `null` for user-rejected actions so callers can stay quiet.
 */
export function parseWalletError(error: unknown): string | null {
  const message = extractMessage(error);
  const lower = message.toLowerCase();

  // Wallet rejection — intentional cancel, no toast.
  if (
    lower.includes("user rejected") ||
    lower.includes("user denied") ||
    lower.includes("rejected the request") ||
    lower.includes("request rejected")
  ) {
    return null;
  }

  // Anchor custom program error codes (e.g. "custom program error: 0x1771").
  const codeMatch = message.match(/custom program error: 0x([0-9a-fA-F]+)/);
  if (codeMatch) {
    const code = parseInt(codeMatch[1], 16);
    if (PROGRAM_ERRORS[code]) return PROGRAM_ERRORS[code];
  }

  if (lower.includes("insufficient lamports") || lower.includes("insufficient funds")) {
    return "Not enough SOL to cover this transaction and fees.";
  }
  if (lower.includes("blockhash not found") || lower.includes("block height exceeded")) {
    return "The transaction expired (blockhash too old). Please try again.";
  }
  if (lower.includes("compute") && lower.includes("exceeded")) {
    return "Transaction exceeded the compute budget. Try a simpler proof.";
  }
  if (lower.includes("wallet not connected") || lower.includes("walletnotconnected")) {
    return "Connect your wallet to continue.";
  }
  if (lower.includes("no wallet") || lower.includes("walletnotselected")) {
    return "No wallet selected. Choose a wallet to connect.";
  }
  if (lower.includes("failed to fetch") || lower.includes("timeout") || lower.includes("network")) {
    return "Network error talking to the Solana RPC. Please retry.";
  }

  return message.length > 0 && message.length < 160
    ? message
    : "Something went wrong. Please try again.";
}

function extractMessage(error: unknown): string {
  if (typeof error === "string") return error;
  if (error && typeof error === "object") {
    const e = error as { message?: string; error?: { message?: string }; logs?: string[] };
    if (e.logs?.length) {
      const failLog = e.logs.find((l) => l.includes("failed") || l.includes("Error"));
      if (failLog) return `${e.message ?? ""} ${failLog}`.trim();
    }
    return e.message ?? e.error?.message ?? "";
  }
  return "";
}
