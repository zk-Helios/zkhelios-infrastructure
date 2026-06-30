import type { SessionOptions } from "iron-session";

/**
 * Server session payload. In Sessions 2–3 the "backend" is mocked via Next.js
 * route handlers — the real Fastify API (Session 7) mirrors this SIWS contract.
 */
export interface SessionData {
  nonce?: string;
  siws?: {
    pubkey: string;
    chainId: string;
    issuedAt: string;
    expiresAt: string;
  };
}

/**
 * iron-session config. SESSION_SECRET must be >= 32 chars in production.
 * The dev fallback keeps local builds working without secrets configured.
 */
export const sessionOptions: SessionOptions = {
  password:
    process.env.SESSION_SECRET ?? "zkhelios_dev_session_secret_change_me_please_min32chars",
  cookieName: "zkhelios_session",
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};
