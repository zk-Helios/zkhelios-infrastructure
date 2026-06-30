import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { UserService } from "./service";
import { IdParam, PubkeyParam, UpdateMeBody, WatchBody } from "./schemas";

export async function userRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const service = new UserService();

  app.get("/me", { preHandler: app.authenticate, schema: { tags: ["users"] } }, async (req) => ({
    ok: true,
    user: await service.getMe(req.user!.pubkey),
  }));

  app.patch(
    "/me",
    { preHandler: app.authenticate, schema: { body: UpdateMeBody, tags: ["users"] } },
    async (req) => ({ ok: true, user: await service.updateMe(req.user!.pubkey, req.body) }),
  );

  app.get(
    "/me/watched",
    { preHandler: app.authenticate, schema: { tags: ["users"] } },
    async (req) => ({ ok: true, watched: await service.listWatched(req.user!.pubkey) }),
  );

  app.post(
    "/me/watched",
    { preHandler: app.authenticate, schema: { body: WatchBody, tags: ["users"] } },
    async (req) => ({ ok: true, watched: await service.addWatched(req.user!.pubkey, req.body) }),
  );

  app.delete(
    "/me/watched/:id",
    { preHandler: app.authenticate, schema: { params: IdParam, tags: ["users"] } },
    async (req) => {
      await service.removeWatched(req.user!.pubkey, req.params.id);
      return { ok: true };
    },
  );

  // Public — limited profile. Declared last so it doesn't shadow /me.
  app.get("/:pubkey", { schema: { params: PubkeyParam, tags: ["users"] } }, async (req) => ({
    ok: true,
    profile: await service.getPublicProfile(req.params.pubkey),
  }));
}
