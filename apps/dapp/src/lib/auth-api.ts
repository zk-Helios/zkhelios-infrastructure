import type { AuthUser } from "@/types";

/** Thin client for the (currently mocked) SIWS auth endpoints. */

export interface NonceResponse {
  nonce: string;
  statement: string;
  version: string;
}

export async function fetchNonce(publicKey: string): Promise<NonceResponse> {
  const res = await fetch("/api/auth/nonce", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ publicKey }),
  });
  if (!res.ok) throw new Error("Failed to fetch nonce");
  return res.json();
}

export async function fetchMe(): Promise<AuthUser | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) return null;
  const data = (await res.json()) as { ok: boolean; user: AuthUser | null };
  return data.user ?? null;
}

export async function verifySiws(
  message: string,
  signature: string,
  publicKey: string,
): Promise<boolean> {
  const res = await fetch("/api/auth/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message, signature, publicKey }),
  });
  const data = (await res.json().catch(() => ({ ok: false }))) as { ok: boolean };
  return Boolean(data.ok);
}

export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
}
