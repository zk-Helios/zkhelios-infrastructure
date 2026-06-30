import { randomUUID } from "node:crypto";
import { prisma } from "@zkhelios/db";
import type { Env } from "../../config/env";
import { getRedis } from "../../lib/redis";
import { signSession } from "../../lib/jwt";
import {
  buildSiwsMessage,
  parseSiwsMessage,
  generateNonce,
  isValidPubkey,
  verifySignature,
  SIWS_ALLOWED_CHAINS,
  SIWS_STATEMENT,
  SIWS_VERSION,
} from "../../lib/siws";
import { AuthError, ValidationError } from "../../utils/errors";
import type { ErrorCode } from "@zkhelios/shared-types";
import { signInsTotal } from "../../lib/metrics";

const NONCE_TTL_SEC = 600; // 10 min
const MESSAGE_MAX_AGE_MS = 5 * 60 * 1000;
const LOCK_THRESHOLD = 10;
const LOCK_WINDOW_SEC = 3600;

const nonceKey = (pk: string) => `nonce:${pk}`;
const failKey = (pk: string) => `authfail:${pk}`;

export class AuthService {
  constructor(private env: Env) {}

  private redis() {
    return getRedis(this.env.REDIS_URL);
  }

  async issueNonce(pubkey: string) {
    if (!isValidPubkey(pubkey)) throw new ValidationError("Invalid Solana public key");
    const nonce = generateNonce();
    const issuedAt = new Date().toISOString();

    await this.redis().set(nonceKey(pubkey), nonce, "EX", NONCE_TTL_SEC);
    await prisma.user.upsert({
      where: { pubkey },
      update: { nonce },
      create: { pubkey, nonce },
    });

    return {
      nonce,
      statement: SIWS_STATEMENT,
      uri: `https://${this.env.EXPECTED_DOMAIN}`,
      version: SIWS_VERSION,
      domain: this.env.EXPECTED_DOMAIN,
      issuedAt,
    };
  }

  async verify(input: { message: string; signature: string; pubkey: string; ip?: string; userAgent?: string }) {
    const { message, signature, pubkey, ip, userAgent } = input;

    // Lockout check.
    const fails = Number((await this.redis().get(failKey(pubkey))) ?? 0);
    if (fails >= LOCK_THRESHOLD) {
      await prisma.user.update({ where: { pubkey }, data: { locked: true } }).catch(() => {});
      throw new AuthError("AUTH_ADDRESS_LOCKED", "Too many failed attempts; address temporarily locked");
    }

    const fail = async (code: ErrorCode, msg: string): Promise<never> => {
      const n = await this.redis().incr(failKey(pubkey));
      if (n === 1) await this.redis().expire(failKey(pubkey), LOCK_WINDOW_SEC);
      throw new AuthError(code, msg);
    };

    if (!verifySignature(message, signature, pubkey)) {
      return fail("AUTH_INVALID_SIGNATURE", "Signature verification failed");
    }
    const parsed = parseSiwsMessage(message);
    if (parsed.pubkey !== pubkey) return fail("AUTH_INVALID_SIGNATURE", "Public key mismatch");

    const stored = await this.redis().get(nonceKey(pubkey));
    if (!stored || stored !== parsed.nonce) return fail("AUTH_NONCE_INVALID", "Nonce mismatch or expired");
    if (!parsed.chainId || !SIWS_ALLOWED_CHAINS.includes(parsed.chainId)) {
      return fail("AUTH_UNSUPPORTED_CHAIN", "Unsupported chain");
    }
    const issued = parsed.issuedAt ? Date.parse(parsed.issuedAt) : NaN;
    if (!Number.isFinite(issued) || Math.abs(Date.now() - issued) > MESSAGE_MAX_AGE_MS) {
      return fail("AUTH_MESSAGE_EXPIRED", "Sign-in message expired");
    }

    // Success — consume nonce + reset failures.
    await this.redis().del(nonceKey(pubkey));
    await this.redis().del(failKey(pubkey));

    const isAdmin = this.env.ADMIN_PUBKEYS.split(",").map((s) => s.trim()).includes(pubkey);
    const user = await prisma.user.update({
      where: { pubkey },
      data: { nonce: null, lastSeenAt: new Date(), ...(isAdmin ? { role: "ADMIN" as const } : {}) },
    });
    signInsTotal.inc();

    const expiresAt = new Date(Date.now() + this.env.SESSION_TTL_DAYS * 86_400_000);
    const session = await prisma.session.create({
      data: { userId: user.id, token: randomUUID(), ip, userAgent, expiresAt },
    });
    // jti = session id.
    await prisma.session.update({ where: { id: session.id }, data: { token: session.id } });
    const token = signSession({ jti: session.id, sub: user.pubkey }, this.env.AUTH_JWT_SECRET, this.env.SESSION_TTL_DAYS);

    return {
      token,
      expiresAt,
      user: { pubkey: user.pubkey, role: user.role, displayName: user.displayName, email: user.email },
    };
  }

  async logout(sessionId: string) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }

  async me(pubkey: string) {
    const user = await prisma.user.findUnique({ where: { pubkey } });
    if (!user) throw new AuthError();
    return { pubkey: user.pubkey, role: user.role, displayName: user.displayName, email: user.email };
  }

  /** Sliding refresh: extend expiry if within the last day of the window. */
  async refresh(sessionId: string) {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });
    if (!session) throw new AuthError("AUTH_SESSION_EXPIRED", "Session not found");
    const expiresAt = new Date(Date.now() + this.env.SESSION_TTL_DAYS * 86_400_000);
    await prisma.session.update({ where: { id: sessionId }, data: { expiresAt } });
    return { expiresAt };
  }

  async listSessions(pubkey: string, currentSessionId: string) {
    const sessions = await prisma.session.findMany({
      where: { user: { pubkey } },
      orderBy: { createdAt: "desc" },
    });
    return sessions.map((s) => ({
      id: s.id,
      ip: s.ip,
      userAgent: s.userAgent,
      createdAt: s.createdAt.toISOString(),
      expiresAt: s.expiresAt.toISOString(),
      current: s.id === currentSessionId,
    }));
  }

  async revokeSession(pubkey: string, sessionId: string) {
    await prisma.session.deleteMany({ where: { id: sessionId, user: { pubkey } } });
  }

  async revokeAllExcept(pubkey: string, currentSessionId: string) {
    await prisma.session.deleteMany({ where: { user: { pubkey }, id: { not: currentSessionId } } });
  }
}
