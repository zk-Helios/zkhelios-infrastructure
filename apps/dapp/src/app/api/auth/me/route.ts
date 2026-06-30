import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

export const dynamic = "force-dynamic";

/** GET /api/auth/me — returns the current authenticated pubkey (or null). */
export async function GET() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.siws) {
    return Response.json({ ok: true, user: null });
  }
  if (new Date(session.siws.expiresAt).getTime() < Date.now()) {
    session.destroy();
    return Response.json({ ok: true, user: null });
  }

  return Response.json({
    ok: true,
    user: {
      pubkey: session.siws.pubkey,
      chainId: session.siws.chainId,
      issuedAt: session.siws.issuedAt,
      expiresAt: session.siws.expiresAt,
    },
  });
}
