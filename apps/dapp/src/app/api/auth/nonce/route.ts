import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { PublicKey } from "@solana/web3.js";
import { sessionOptions, type SessionData } from "@/lib/session";
import { generateNonce, SIWS_STATEMENT, SIWS_VERSION } from "@/lib/siws";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/nonce  { publicKey }
 * Issues a single-use nonce (stored in the httpOnly session) plus the SIWS
 * message components the client uses to construct the message to sign.
 */
export async function POST(req: Request) {
  let publicKey: string | undefined;
  try {
    ({ publicKey } = (await req.json()) as { publicKey?: string });
  } catch {
    /* fallthrough to validation */
  }

  if (!publicKey || !isValidPubkey(publicKey)) {
    return Response.json(
      { ok: false, code: "VALIDATION_FAILED", error: "Invalid Solana public key." },
      { status: 400 },
    );
  }

  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  session.nonce = generateNonce();
  await session.save();

  return Response.json({
    ok: true,
    nonce: session.nonce,
    statement: SIWS_STATEMENT,
    version: SIWS_VERSION,
  });
}

function isValidPubkey(value: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new PublicKey(value);
    return true;
  } catch {
    return false;
  }
}
