import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import type { Env } from "../../config/env";
import { AdminService } from "./service";
import { AnnounceBody, PubkeyParam, UsersQuery } from "./schemas";

export async function adminRoutes(fastify: FastifyInstance, opts: { env: Env }) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const service = new AdminService(opts.env);
  const admin = { preHandler: app.requireAdmin };

  app.post("/announcements", { ...admin, schema: { body: AnnounceBody, tags: ["admin"] } }, async (req) => ({
    ok: true,
    ...(await service.announce(req.body)),
  }));

  app.get("/users", { ...admin, schema: { querystring: UsersQuery, tags: ["admin"] } }, async (req) => ({
    ok: true,
    ...(await service.listUsers(req.query)),
  }));

  app.post("/users/:pubkey/lock", { ...admin, schema: { params: PubkeyParam, tags: ["admin"] } }, async (req) => {
    await service.setLocked(req.params.pubkey, true);
    return { ok: true };
  });
  app.post("/users/:pubkey/unlock", { ...admin, schema: { params: PubkeyParam, tags: ["admin"] } }, async (req) => {
    await service.setLocked(req.params.pubkey, false);
    return { ok: true };
  });

  app.get("/queues", { ...admin, schema: { tags: ["admin"] } }, async () => ({ ok: true, queues: await service.queueStats() }));
  app.get("/stats", { ...admin, schema: { tags: ["admin"] } }, async () => ({ ok: true, stats: await service.internalStats() }));
  app.get("/health/detailed", { ...admin, schema: { tags: ["admin"] } }, async () => ({ ok: true, checks: await service.detailedHealth() }));
}
