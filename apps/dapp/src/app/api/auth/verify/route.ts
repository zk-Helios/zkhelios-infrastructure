import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { PublicKey } from "@solana/web3.js";
import nacl from "tweetnacl";
import bs58 from "bs58";
import { sessionOptions, type SessionData } from "@/lib/session";
import { parseSiwsMessage, SIWS_ALLOWED_CHAINS } from "@/lib/siws";

export const dynamic = "force-dynamic";

const FIVE_MIN = 5 * 60 * 1000;

/**
 * POST /api/auth/verify  { message, signature, publicKey }
 * Verifies an ed25519 signature over a SIWS message, then establishes a session.
 */
export async function POST(req: Request) {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  try {
    const { message, signature, publicKey } = (await req.json()) as {
      message?: string;
      signature?: string;
      publicKey?: string;
    };

    if (!message || !signature || !publicKey) {
      return fail("VALIDATION_FAILED", "Missing message, signature, or publicKey.", 400);
    }

    // 1. Signature must verify for the claimed pubkey.
    const pubkeyBytes = new PublicKey(publicKey).toBytes();
    const ok = nacl.sign.detached.verify(
      new TextEncoder().encode(message),
      bs58.decode(signature),
      pubkeyBytes,
    );
    if (!ok) return fail("AUTH_INVALID_SIGNATURE", "Signature verification failed.", 401);

    const parsed = parseSiwsMessage(message);

    // 2. The signed pubkey line must match the claimed signer.
    if (parsed.pubkey !== publicKey) {
      return fail("AUTH_INVALID_SIGNATURE", "Public key mismatch.", 401);
    }
    // 3. Nonce must match the one we issued (replay protection).
    if (!parsed.nonce || parsed.nonce !== session.nonce) {
      return fail("AUTH_NONCE_INVALID", "Nonce mismatch or expired.", 401);
    }
    // 4. Chain id must be supported.
    if (!parsed.chainId || !SIWS_ALLOWED_CHAINS.includes(parsed.chainId)) {
      return fail("AUTH_UNSUPPORTED_CHAIN", "Unsupported chain.", 400);
    }
    // 5. Message must be fresh.
    const issued = parsed.issuedAt ? Date.parse(parsed.issuedAt) : NaN;
    if (!Number.isFinite(issued) || Math.abs(Date.now() - issued) > FIVE_MIN) {
      return fail("AUTH_MESSAGE_EXPIRED", "Sign-in message expired.", 401);
    }

    // Establish the authenticated session; consume the nonce.
    session.nonce = undefined;
    session.siws = {
      pubkey: publicKey,
      chainId: parsed.chainId,
      issuedAt: parsed.issuedAt!,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString(),
    };
    await session.save();

    return Response.json({
      ok: true,
      user: { pubkey: publicKey, chainId: parsed.chainId },
      expiresAt: session.siws.expiresAt,
    });
  } catch (err) {
    return fail(
      "AUTH_VERIFY_ERROR",
      err instanceof Error ? err.message : "Verification error.",
      401,
    );
  }
}

function fail(code: string, error: string, status: number) {
  return Response.json({ ok: false, code, error }, { status });
}
