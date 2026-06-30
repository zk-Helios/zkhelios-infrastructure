import type {
  Transaction,
  Proof,
  Page,
  TransactionFilters,
  OverviewStats,
  TimeseriesPoint,
  TimeRange,
  Announcement,
  ProofKind,
} from "@/types";
import {
  MOCK_TRANSACTIONS,
  MOCK_PROOFS,
  makeOverviewStats,
  makeProofsTimeseries,
  makeCuByType,
  makeProofDistribution,
  makeAnnouncements,
} from "@/lib/mock/solana";

/**
 * Mock API client — simulates the zkHelios backend (Sessions 7–8) with
 * realistic latency and the occasional transient error so loading/error UI is
 * exercised. Swapped for the real REST client once the backend lands.
 */

function delay(min = 250, max = 650) {
  return new Promise((r) => setTimeout(r, min + Math.random() * (max - min)));
}

/** ~6% transient failure rate so retry/error states are real. */
function maybeFail(rate = 0.06) {
  if (Math.random() < rate) throw new Error("Upstream RPC timeout. Please retry.");
}

export async function getOverviewStats(): Promise<OverviewStats> {
  await delay(150, 400);
  maybeFail(0.04);
  return makeOverviewStats();
}

export async function getProofsTimeseries(range: TimeRange): Promise<TimeseriesPoint[]> {
  await delay();
  maybeFail();
  return makeProofsTimeseries(range);
}

export async function getCuByType(): Promise<{ kind: ProofKind; cu: number }[]> {
  await delay();
  return makeCuByType();
}

export async function getProofDistribution(): Promise<{ kind: ProofKind; count: number }[]> {
  await delay();
  return makeProofDistribution();
}

export async function getAnnouncements(): Promise<Announcement[]> {
  await delay(120, 300);
  return makeAnnouncements();
}

export async function getActiveProofs(): Promise<{ total: number; pending: number }> {
  await delay(150, 350);
  const mine = MOCK_PROOFS;
  return {
    total: mine.length,
    pending: mine.filter((p) => p.status === "pending").length,
  };
}

export async function getRecentActivity(limit = 5): Promise<Transaction[]> {
  await delay(150, 400);
  return [...MOCK_TRANSACTIONS].slice(0, limit);
}

export async function getProofs(limit = 50): Promise<Proof[]> {
  await delay();
  return MOCK_PROOFS.slice(0, limit);
}

function matches(tx: Transaction, f: TransactionFilters): boolean {
  if (f.type && f.type !== "all" && tx.type !== f.type) return false;
  if (f.status && f.status !== "all" && tx.status !== f.status) return false;
  if (f.fromDate && tx.blockTime < Date.parse(f.fromDate)) return false;
  if (f.toDate && tx.blockTime > Date.parse(f.toDate) + 86_400_000) return false;
  if (f.search) {
    const q = f.search.toLowerCase();
    const hay = [tx.signature, tx.feePayer, ...tx.programIds, tx.proofAccount ?? ""]
      .join(" ")
      .toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

/** Cursor-paginated, filtered transaction list (cursor = last signature). */
export async function getTransactions(
  filters: TransactionFilters = {},
  cursor: string | null = null,
  limit = 25,
): Promise<Page<Transaction>> {
  await delay();
  maybeFail();
  const all = MOCK_TRANSACTIONS.filter((tx) => matches(tx, filters));
  const start = cursor ? all.findIndex((tx) => tx.signature === cursor) + 1 : 0;
  const items = all.slice(start, start + limit);
  const nextCursor = start + limit < all.length ? items[items.length - 1]?.signature ?? null : null;
  return { items, nextCursor, total: all.length };
}

export async function getLatestProofs(limit = 10): Promise<Proof[]> {
  await delay(150, 400);
  return MOCK_PROOFS.slice(0, limit);
}

export async function getLatestTransactions(limit = 10): Promise<Transaction[]> {
  await delay(150, 400);
  return MOCK_TRANSACTIONS.slice(0, limit);
}

export interface LeaderboardEntry {
  pubkey: string;
  proofCount: number;
}

export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  await delay(200, 450);
  // Aggregate proof counts per authority from the mock proof set.
  const counts = new Map<string, number>();
  for (const p of MOCK_PROOFS) counts.set(p.authority, (counts.get(p.authority) ?? 0) + 1);
  // Pad with deterministic-ish entries so the board always looks populated.
  const entries = Array.from(counts, ([pubkey, proofCount]) => ({ pubkey, proofCount }));
  return entries
    .map((e) => ({ ...e, proofCount: e.proofCount + 1 }))
    .sort((a, b) => b.proofCount - a.proofCount)
    .slice(0, limit);
}

export async function getProofById(idOrAccount: string): Promise<Proof | null> {
  await delay(200, 450);
  return MOCK_PROOFS.find((p) => p.id === idOrAccount || p.proofAccount === idOrAccount) ?? null;
}

export interface AddressOverview {
  pubkey: string;
  solLamports: number;
  tokens: { mint: string; symbol: string; amount: number }[];
  recentTransactions: Transaction[];
  proofs: Proof[];
  /** 90-day activity counts for the heatmap. */
  heatmap: number[];
}

export async function getAddressOverview(pubkey: string): Promise<AddressOverview> {
  await delay(250, 550);
  return {
    pubkey,
    solLamports: 12_482_900_000,
    tokens: [
      { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", amount: 1240.5 },
      { mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", symbol: "JUP", amount: 880 },
    ],
    recentTransactions: MOCK_TRANSACTIONS.slice(0, 8),
    proofs: MOCK_PROOFS.slice(0, 6),
    heatmap: Array.from({ length: 90 }, (_, i) => (i * 37) % 5),
  };
}

export interface ProgramOverview {
  programId: string;
  deployer: string;
  upgradeAuthority: string;
  lastUpgradeSlot: number;
  accountTypes: string[];
  recentInvocations: Transaction[];
  successRate: number;
  invocations24h: number;
}

export async function getProgramOverview(programId: string): Promise<ProgramOverview> {
  await delay(250, 500);
  return {
    programId,
    deployer: MOCK_TRANSACTIONS[0].feePayer,
    upgradeAuthority: MOCK_TRANSACTIONS[1].feePayer,
    lastUpgradeSlot: 287_001_240,
    accountTypes: ["VerifierConfig", "CircuitRegistry", "UserAccount", "ProofAccount"],
    recentInvocations: MOCK_TRANSACTIONS.filter((t) => t.type === "proof").slice(0, 8),
    successRate: 99.2,
    invocations24h: 11_842,
  };
}

export type SearchResult =
  | { type: "tx"; value: string }
  | { type: "address"; value: string }
  | { type: "proof"; value: string }
  | { type: "slot"; value: string }
  | { type: "unknown"; value: string };

/** Classify a universal-search query into a destination. */
export function classifySearch(q: string): SearchResult {
  const v = q.trim();
  if (!v) return { type: "unknown", value: v };
  if (/^\d+$/.test(v)) return { type: "slot", value: v };
  if (/^[1-9A-HJ-NP-Za-km-z]{80,90}$/.test(v)) return { type: "tx", value: v };
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(v)) return { type: "address", value: v };
  if (/^[1-9A-HJ-NP-Za-km-z]{8,32}$/.test(v)) return { type: "proof", value: v };
  return { type: "unknown", value: v };
}

export interface TransactionDetail extends Transaction {
  logs: string[];
  accountKeys: string[];
  tokenBalanceChanges: { mint: string; owner: string; pre: number; post: number }[];
}

export async function getTransaction(signature: string): Promise<TransactionDetail | null> {
  await delay(200, 500);
  const tx = MOCK_TRANSACTIONS.find((t) => t.signature === signature);
  if (!tx) return null;
  const logs = [
    `Program ${tx.programIds[0]} invoke [1]`,
    tx.type === "proof" ? "Program log: Instruction: VerifyProof" : "Program log: Instruction: Transfer",
    tx.type === "proof" ? "Program log: Groth16 pairing check ok" : "Program log: Transfer complete",
    `Program ${tx.programIds[0]} consumed ${tx.computeUnits} of 1400000 compute units`,
    `Program ${tx.programIds[0]} ${tx.status === "success" ? "success" : "failed"}`,
  ];
  return {
    ...tx,
    logs,
    accountKeys: [tx.feePayer, ...tx.programIds, ...(tx.proofAccount ? [tx.proofAccount] : [])],
    tokenBalanceChanges:
      tx.type === "transfer"
        ? [
            {
              mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
              owner: tx.feePayer,
              pre: 1240.5,
              post: 1190.5,
            },
          ]
        : [],
  };
}
