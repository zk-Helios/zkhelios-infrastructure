import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import type { Env } from "../../config/env";
import { getRedis } from "../../lib/redis";
import { cached, cacheKey, TTL } from "../../lib/cache";
import { StatsService } from "./service";

export async function statsRoutes(fastify: FastifyInstance, opts: { env: Env }) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const redis = getRedis(opts.env.REDIS_URL);
  const service = new StatsService();

  app.get("/overview", { schema: { tags: ["stats"] } }, async () => ({
    ok: true,
    stats: await cached(redis, cacheKey("stats", "overview"), TTL.statsOverview, () => service.overview()),
  }));

  app.get("/network", { schema: { tags: ["stats"] } }, async () => ({
    ok: true,
    stats: await cached(redis, cacheKey("stats", "network"), TTL.statsOverview, () => service.overview()),
  }));

  app.get(
    "/timeseries",
    {
      schema: {
        querystring: z.object({
          metric: z.enum(["tps", "proofs24h", "activeUsers24h"]).default("proofs24h"),
          period: z.enum(["24h", "7d", "30d"]).default("7d"),
        }),
        tags: ["stats"],
      },
    },
    async (req) => {
      const { metric, period } = req.query;
      const data = await cached(redis, cacheKey("stats", "ts", metric, period), TTL.timeseries, () =>
        service.timeseries(metric, period),
      );
      return { ok: true, metric, period, data };
    },
  );

  app.get(
    "/leaderboard",
    { schema: { querystring: z.object({ limit: z.coerce.number().int().min(1).max(100).optional() }), tags: ["stats"] } },
    async (req) => ({ ok: true, leaderboard: await service.leaderboard(req.query.limit ?? 10) }),
  );
}
