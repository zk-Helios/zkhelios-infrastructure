import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";

export const dynamic = "force-dynamic";

/** POST /api/auth/logout — destroys the session + clears the cookie. */
export async function POST() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);
  session.destroy();
  return Response.json({ ok: true });
}
