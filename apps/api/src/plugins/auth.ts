import fp from "fastify-plugin";
import type { FastifyReply, FastifyRequest } from "fastify";
import { prisma } from "@zkhelios/db";
import type { Env } from "../config/env";
import { verifySession } from "../lib/jwt";
import { AuthError, ForbiddenError } from "../utils/errors";

export interface RequestUser {
  pubkey: string;
  role: "USER" | "ADMIN";
  sessionId: string;
}

declare module "fastify" {
  interface FastifyRequest {
    user?: RequestUser;
  }
  interface FastifyInstance {
    /** preHandler: requires a valid session; sets request.user or 401s. */
    authenticate: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
    /** preHandler: requires an ADMIN session. */
    requireAdmin: (req: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

export const authPlugin = fp(async (fastify, opts: { env: Env }) => {
  const { env } = opts;

  async function resolveUser(req: FastifyRequest): Promise<RequestUser> {
    const token = req.cookies?.[env.AUTH_COOKIE_NAME];
    if (!token) throw new AuthError("AUTH_UNAUTHORIZED", "Not authenticated");

    const payload = verifySession(token, env.AUTH_JWT_SECRET);
    if (!payload) throw new AuthError("AUTH_SESSION_EXPIRED", "Invalid or expired session");

    const session = await prisma.session.findUnique({
      where: { id: payload.jti },
      include: { user: true },
    });
    if (!session || session.expiresAt.getTime() < Date.now()) {
      throw new AuthError("AUTH_SESSION_EXPIRED", "Session expired");
    }
    if (session.user.locked) throw new ForbiddenError("Account locked");

    return { pubkey: session.user.pubkey, role: session.user.role, sessionId: session.id };
  }

  fastify.decorate("authenticate", async (req: FastifyRequest) => {
    req.user = await resolveUser(req);
  });

  fastify.decorate("requireAdmin", async (req: FastifyRequest) => {
    req.user = await resolveUser(req);
    if (req.user.role !== "ADMIN") throw new ForbiddenError("Admin only");
  });
});
