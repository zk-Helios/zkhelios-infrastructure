import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@zkhelios/db";
import { NotFoundError } from "../../utils/errors";

function serialize(b: {
  slot: bigint;
  blockhash: string;
  parentSlot: bigint;
  blockTime: Date | null;
  txCount: number;
}) {
  return {
    slot: b.slot.toString(),
    blockhash: b.blockhash,
    parentSlot: b.parentSlot.toString(),
    blockTime: b.blockTime?.toISOString() ?? null,
    txCount: b.txCount,
  };
}

export async function blockRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/",
    { schema: { querystring: z.object({ limit: z.coerce.number().int().min(1).max(100).optional() }), tags: ["blocks"] } },
    async (req) => {
      const rows = await prisma.blockSnapshot.findMany({ orderBy: { slot: "desc" }, take: req.query.limit ?? 20 });
      return { ok: true, blocks: rows.map(serialize) };
    },
  );

  app.get(
    "/:slot",
    { schema: { params: z.object({ slot: z.coerce.number().int() }), tags: ["blocks"] } },
    async (req) => {
      const b = await prisma.blockSnapshot.findUnique({ where: { slot: BigInt(req.params.slot) } });
      if (!b) throw new NotFoundError("Block not found");
      return { ok: true, block: serialize(b) };
    },
  );
}
