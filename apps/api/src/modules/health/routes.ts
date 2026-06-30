import type { FastifyInstance } from "fastify";
import { prisma } from "@zkhelios/db";
import { getRedis } from "../../lib/redis";
import type { Env } from "../../config/env";

/** Liveness/readiness endpoints. Readiness checks DB + Redis dependencies. */
export async function healthRoutes(fastify: FastifyInstance, opts: { env: Env }) {
  const { env } = opts;

  fastify.get("/health", async () => ({ ok: true, service: "zkhelios-api", status: "up" }));

  // Liveness — always 200 if the process is alive.
  fastify.get("/health/live", async () => ({ ok: true, status: "alive" }));

  // Readiness — verifies dependencies.
  fastify.get("/health/ready", async (_req, reply) => {
    const checks: Record<string, "ok" | "fail"> = { db: "fail", redis: "fail" };

    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.db = "ok";
    } catch {
      /* db down */
    }
    try {
      const redis = getRedis(env.REDIS_URL);
      if (redis.status !== "ready") await redis.connect().catch(() => {});
      await redis.ping();
      checks.redis = "ok";
    } catch {
      /* redis down */
    }

    const ready = Object.values(checks).every((s) => s === "ok");
    return reply.code(ready ? 200 : 503).send({ ok: ready, checks });
  });
}
