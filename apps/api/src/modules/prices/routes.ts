import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Env } from "../../config/env";
import { getRedis } from "../../lib/redis";
import { getPrices } from "../../services/prices";

export async function priceRoutes(fastify: FastifyInstance, opts: { env: Env }) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const { env } = opts;

  app.get(
    "/",
    { schema: { querystring: z.object({ mints: z.string().optional() }), tags: ["prices"] } },
    async (req) => {
      const mints = req.query.mints ? req.query.mints.split(",").filter(Boolean) : [];
      const prices = await getPrices(getRedis(env.REDIS_URL), mints);
      return { ok: true, prices };
    },
  );
}
