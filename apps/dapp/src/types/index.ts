export interface AuthUser {
  pubkey: string;
  chainId: string;
  issuedAt?: string;
  expiresAt?: string;
}

export type NotificationType = "tx" | "proof" | "verify" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  read: boolean;
  createdAt: number;
}

export type TxLifecycle = "pending" | "success" | "error";

// ──────────────────────────────────────────────────────────────────────────
// Domain models (mocked in Sessions 3; mirrored by the backend in S6–10)
// ──────────────────────────────────────────────────────────────────────────

export type TxType = "transfer" | "proof" | "program-call";
export type TxStatus = "success" | "failed";

export interface Transaction {
  /** base58 signature (88 chars). */
  signature: string;
  type: TxType;
  status: TxStatus;
  feePayer: string; // pubkey
  /** fee in lamports. */
  fee: number;
  instructionCount: number;
  computeUnits: number;
  slot: number;
  blockTime: number; // epoch ms
  programIds: string[];
  proofAccount?: string;
}

export type ProofKind = "balance" | "ownership" | "age" | "membership" | "custom";
export type ProofStatus = "pending" | "generating" | "completed" | "verified" | "failed";

export interface Proof {
  id: string;
  /** ProofAccount PDA (base58). */
  proofAccount?: string;
  kind: ProofKind;
  status: ProofStatus;
  circuitName: string;
  authority: string; // pubkey
  publicInputs: Record<string, string>;
  createdAt: number;
  verifiedAt?: number;
  slotVerified?: number;
  computeUnits?: number;
  /** 0–100 when generating. */
  progress?: number;
  etaSeconds?: number;
}

export interface TokenBalance {
  mint: string;
  symbol: string;
  name: string;
  decimals: number;
  balance: number;
  usdPrice?: number;
  usdValue?: number;
}

export interface OverviewStats {
  tps: number;
  slot: number;
  epoch: number;
  slotInEpoch: number;
  totalProofs: number;
  proofs24h: number;
  avgVerifyTimeMs: number;
  activeUsers24h: number;
  rpcLatencyMs: number;
  status: "online" | "degraded" | "offline";
}

export interface TimeseriesPoint {
  /** epoch ms */
  t: number;
  value: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  date: number;
  tag: string;
}

export type TimeRange = "24h" | "7d" | "30d";

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
}

export interface TransactionFilters {
  search?: string;
  type?: TxType | "all";
  status?: TxStatus | "all";
  fromDate?: string;
  toDate?: string;
}
