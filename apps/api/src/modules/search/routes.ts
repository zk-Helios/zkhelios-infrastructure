import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { prisma } from "@zkhelios/db";
import { classifyQuery } from "./classify";

/** Universal search: detects signature / pubkey / proof id / slot and resolves it. */
export async function searchRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    "/",
    {
      schema: { querystring: z.object({ q: z.string().min(1).max(120) }), tags: ["search"] },
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
    },
    async (req) => {
      const { kind, value } = classifyQuery(req.query.q);

      switch (kind) {
        case "signature": {
          const tx = await prisma.transaction.findUnique({ where: { signature: value }, select: { signature: true } });
          return tx ? { ok: true, type: "transaction", url: `/explorer/tx/${value}`, found: true } : notFound("transaction");
        }
        case "proof": {
          const p = await prisma.proofRecord.findFirst({ where: { proofAccount: value }, select: { proofAccount: true } });
          return p ? { ok: true, type: "proof", url: `/explorer/proof/${value}`, found: true } : notFound("proof");
        }
        case "slot":
          return { ok: true, type: "block", url: `/explorer/block/${value}`, found: true };
        case "pubkey":
          return { ok: true, type: "address", url: `/explorer/address/${value}`, found: true };
        default:
          return notFound("unknown");
      }
    },
  );
}

function notFound(type: string) {
  return { ok: true, type, found: false, url: null };
}
