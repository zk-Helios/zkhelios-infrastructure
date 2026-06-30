/** Types shared between the zkHelios API and the frontend. DB-agnostic. */

export type ProofType = "BALANCE" | "OWNERSHIP" | "AGE" | "MEMBERSHIP" | "CUSTOM";
export type TxStatus = "SUCCESS" | "FAILED";
export type Role = "USER" | "ADMIN";

/** Stable error codes returned as `{ ok: false, code, error }`. */
export const ErrorCodes = {
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL: "INTERNAL",
  AUTH_NONCE_EXPIRED: "AUTH_NONCE_EXPIRED",
  AUTH_NONCE_INVALID: "AUTH_NONCE_INVALID",
  AUTH_INVALID_SIGNATURE: "AUTH_INVALID_SIGNATURE",
  AUTH_MESSAGE_EXPIRED: "AUTH_MESSAGE_EXPIRED",
  AUTH_UNSUPPORTED_CHAIN: "AUTH_UNSUPPORTED_CHAIN",
  AUTH_ADDRESS_LOCKED: "AUTH_ADDRESS_LOCKED",
  AUTH_SESSION_EXPIRED: "AUTH_SESSION_EXPIRED",
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN: "AUTH_FORBIDDEN",
} as const;
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export interface ApiError {
  ok: false;
  code: ErrorCode;
  error: string;
}

// ── Auth ──────────────────────────────────────────────────────────────────

export interface NonceResponse {
  nonce: string;
  statement: string;
  uri: string;
  version: string;
  domain: string;
  issuedAt: string;
}

export interface VerifyRequest {
  message: string;
  signature: string; // base58
  pubkey: string; // base58
}

export interface AuthUser {
  pubkey: string;
  role: Role;
  displayName: string | null;
  email: string | null;
}

export interface SessionInfo {
  id: string;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  current: boolean;
}

// ── Users ─────────────────────────────────────────────────────────────────

export interface NotificationPreferences {
  channels: { inApp: boolean; email: boolean; push: boolean };
  events: Record<string, boolean>;
}

export interface PublicProfile {
  pubkey: string;
  displayName: string | null;
  joinedAt: string;
  proofCount: number;
}

export interface WatchedAddressDto {
  id: string;
  pubkey: string;
  label: string | null;
  createdAt: string;
}

// ── Pagination ──────────────────────────────────────────────────────────────

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
  total: number;
}
