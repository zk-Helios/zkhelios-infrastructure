import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@zkhelios/db";
import type { Env } from "../../config/env";
import { getRedis } from "../../lib/redis";
import { cached, cacheKey, TTL } from "../../lib/cache";
import { NotFoundError } from "../../utils/errors";

function serialize(c: {
  id: number;
  name: string;
  proofType: string;
  description: string | null;
  publicInputCount: number;
  enabled: boolean;
  registeredSlot: bigint;
  wasmUrl: string | null;
  zkeyUrl: string | null;
}) {
  return {
    id: c.id,
    name: c.name,
    proofType: c.proofType,
    description: c.description,
    publicInputCount: c.publicInputCount,
    enabled: c.enabled,
    registeredSlot: c.registeredSlot.toString(),
    wasmUrl: c.wasmUrl,
    zkeyUrl: c.zkeyUrl,
  };
}

export async function circuitRoutes(fastify: FastifyInstance, opts: { env: Env }) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const redis = getRedis(opts.env.REDIS_URL);

  app.get("/", { schema: { tags: ["circuits"] } }, async () => {
    const items = await cached(redis, cacheKey("circuits"), TTL.circuits, async () => {
      const rows = await prisma.circuit.findMany({ orderBy: { id: "asc" } });
      return rows.map(serialize);
    });
    return { ok: true, circuits: items };
  });

  app.get(
    "/:id",
    { schema: { params: z.object({ id: z.coerce.number().int() }), tags: ["circuits"] } },
    async (req) => {
      const c = await prisma.circuit.findUnique({ where: { id: req.params.id } });
      if (!c) throw new NotFoundError("Circuit not found");
      return { ok: true, circuit: { ...serialize(c), verifyingKey: c.verifyingKey } };
    },
  );

  const setEnabled = (enabled: boolean) => async (req: { params: { id: number } }) => {
    await prisma.circuit.update({ where: { id: req.params.id }, data: { enabled } });
    await redis.del(cacheKey("circuits")).catch(() => {});
    return { ok: true };
  };

  app.post(
    "/:id/disable",
    { preHandler: app.requireAdmin, schema: { params: z.object({ id: z.coerce.number().int() }), tags: ["circuits"] } },
    setEnabled(false),
  );
  app.post(
    "/:id/enable",
    { preHandler: app.requireAdmin, schema: { params: z.object({ id: z.coerce.number().int() }), tags: ["circuits"] } },
    setEnabled(true),
  );
}
