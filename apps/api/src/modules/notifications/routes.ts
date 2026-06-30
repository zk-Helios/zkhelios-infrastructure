import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Env } from "../../config/env";
import { NotificationService } from "./service";
import {
  EmailConfirmBody,
  EmailStartBody,
  IdParam,
  ListQuery,
  PreferencesBody,
  PushSubscribeBody,
} from "./schemas";

export async function notificationRoutes(fastify: FastifyInstance, opts: { env: Env }) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const service = new NotificationService(opts.env);
  const auth = { preHandler: app.authenticate };

  app.get("/", { ...auth, schema: { querystring: ListQuery, tags: ["notifications"] } }, async (req) => ({
    ok: true,
    ...(await service.list(req.user!.pubkey, req.query)),
  }));

  app.post("/:id/read", { ...auth, schema: { params: IdParam, tags: ["notifications"] } }, async (req) => {
    await service.markRead(req.user!.pubkey, req.params.id);
    return { ok: true };
  });
  app.post("/read-all", { ...auth, schema: { tags: ["notifications"] } }, async (req) => {
    await service.markAllRead(req.user!.pubkey);
    return { ok: true };
  });
  app.delete("/:id", { ...auth, schema: { params: IdParam, tags: ["notifications"] } }, async (req) => {
    await service.remove(req.user!.pubkey, req.params.id);
    return { ok: true };
  });

  app.get("/preferences", { ...auth, schema: { tags: ["notifications"] } }, async (req) => ({
    ok: true,
    preferences: await service.getPreferences(req.user!.pubkey),
  }));
  app.patch(
    "/preferences",
    { ...auth, schema: { body: PreferencesBody, tags: ["notifications"] } },
    async (req) => ({ ok: true, preferences: await service.updatePreferences(req.user!.pubkey, req.body) }),
  );

  app.post("/email/verify-start", { ...auth, schema: { body: EmailStartBody, tags: ["notifications"] } }, async (req) => ({
    ok: true,
    ...(await service.emailVerifyStart(req.user!.pubkey, req.body.email)),
  }));
  app.post("/email/verify-confirm", { ...auth, schema: { body: EmailConfirmBody, tags: ["notifications"] } }, async (req) => ({
    ok: true,
    ...(await service.emailVerifyConfirm(req.user!.pubkey, req.body.code)),
  }));

  app.post("/push/subscribe", { ...auth, schema: { body: PushSubscribeBody, tags: ["notifications"] } }, async (req) => ({
    ok: true,
    ...(await service.pushSubscribe(req.user!.pubkey, req.body)),
  }));
  app.delete(
    "/push/subscribe",
    { ...auth, schema: { body: z.object({ endpoint: z.string().url() }), tags: ["notifications"] } },
    async (req) => {
      await service.pushUnsubscribe(req.user!.pubkey, req.body.endpoint);
      return { ok: true };
    },
  );
}
