import type { FastifyInstance, FastifyReply } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Env } from "../../config/env";
import { AuthService } from "./service";
import { NonceBody, VerifyBody } from "./schemas";

export async function authRoutes(fastify: FastifyInstance, opts: { env: Env }) {
  const { env } = opts;
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const service = new AuthService(env);

  const setSessionCookie = (reply: FastifyReply, token: string) => {
    reply.setCookie(env.AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      domain: env.AUTH_COOKIE_DOMAIN,
      maxAge: env.SESSION_TTL_DAYS * 86_400,
    });
  };

  // POST /nonce — 10/min per IP
  app.post(
    "/nonce",
    { schema: { body: NonceBody, tags: ["auth"] }, config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req) => ({ ok: true, ...(await service.issueNonce(req.body.pubkey)) }),
  );

  // POST /verify — 5/min per IP
  app.post(
    "/verify",
    { schema: { body: VerifyBody, tags: ["auth"] }, config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const result = await service.verify({
        message: req.body.message,
        signature: req.body.signature,
        pubkey: req.body.pubkey,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      });
      setSessionCookie(reply, result.token);
      return { ok: true, user: result.user, expiresAt: result.expiresAt.toISOString() };
    },
  );

  app.post("/logout", { preHandler: app.authenticate, schema: { tags: ["auth"] } }, async (req, reply) => {
    await service.logout(req.user!.sessionId);
    reply.clearCookie(env.AUTH_COOKIE_NAME, { path: "/" });
    return { ok: true };
  });

  app.get("/me", { preHandler: app.authenticate, schema: { tags: ["auth"] } }, async (req) => ({
    ok: true,
    user: await service.me(req.user!.pubkey),
  }));

  app.post("/refresh", { preHandler: app.authenticate, schema: { tags: ["auth"] } }, async (req) => {
    const { expiresAt } = await service.refresh(req.user!.sessionId);
    return { ok: true, expiresAt: expiresAt.toISOString() };
  });

  app.get("/sessions", { preHandler: app.authenticate, schema: { tags: ["auth"] } }, async (req) => ({
    ok: true,
    sessions: await service.listSessions(req.user!.pubkey, req.user!.sessionId),
  }));

  app.delete(
    "/sessions/:id",
    { preHandler: app.authenticate, schema: { params: z.object({ id: z.string() }), tags: ["auth"] } },
    async (req) => {
      await service.revokeSession(req.user!.pubkey, req.params.id);
      return { ok: true };
    },
  );

  app.delete("/sessions", { preHandler: app.authenticate, schema: { tags: ["auth"] } }, async (req) => {
    await service.revokeAllExcept(req.user!.pubkey, req.user!.sessionId);
    return { ok: true };
  });
}
