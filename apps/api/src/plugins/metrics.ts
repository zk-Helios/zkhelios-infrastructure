import fp from "fastify-plugin";
import { httpRequestDuration, registry } from "../lib/metrics";

/** Records HTTP request durations + exposes GET /metrics. */
export const metricsPlugin = fp(async (fastify) => {
  fastify.addHook("onResponse", async (req, reply) => {
    const route = (req.routeOptions?.url as string | undefined) ?? req.url;
    httpRequestDuration.observe(
      { method: req.method, route, status: reply.statusCode },
      reply.elapsedTime / 1000,
    );
  });

  fastify.get("/metrics", { schema: { hide: true } }, async (_req, reply) => {
    reply.header("Content-Type", registry.contentType);
    return registry.metrics();
  });
});
