import { LAMPORTS_PER_SOL } from "@/lib/solana";

export { cn } from "@zkhelios/ui/cn";

/** Truncate a base58 pubkey/signature: ABCD…wxyz */
export function truncate(value?: string, chars = 4): string {
  if (!value) return "";
  if (value.length <= chars * 2 + 1) return value;
  return `${value.slice(0, chars)}…${value.slice(-chars)}`;
}

/** Lamports → SOL number. */
export function lamportsToSol(lamports: number | bigint): number {
  return Number(lamports) / LAMPORTS_PER_SOL;
}

/** Format a SOL amount with adaptive precision. */
export function formatSol(lamportsOrSol: number, opts: { fromLamports?: boolean } = {}): string {
  const sol = opts.fromLamports ? lamportsOrSol / LAMPORTS_PER_SOL : lamportsOrSol;
  const dp = sol === 0 ? 0 : sol < 0.001 ? 6 : sol < 1 ? 4 : 3;
  return sol.toLocaleString("en-US", { maximumFractionDigits: dp });
}

/** Format a token amount string with thousands separators + up to `dp` decimals. */
export function formatAmount(value: number | string, dp = 4): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "0";
  return n.toLocaleString("en-US", { maximumFractionDigits: dp });
}

/** Format a USD value. */
export function formatUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  });
}

/** Estimate wall-clock time from a slot delta (~400ms/slot). */
export function slotsToDuration(slots: number): string {
  const seconds = Math.round((slots * 400) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `${mins}m`;
  return `${Math.round(mins / 60)}h`;
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
