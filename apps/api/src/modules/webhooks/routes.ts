import type { FastifyInstance } from "fastify";
import { prisma, type PrismaClient } from "@zkhelios/db";
import type { Env } from "../../config/env";
import { getRedis } from "../../lib/redis";
import { parseEvents } from "../../lib/anchor-events";
import { dispatchEvent, type IndexerCtx } from "../indexer/handlers";

interface HeliusTx {
  signature: string;
  slot: number;
  timestamp?: number;
  fee?: number;
  feePayer?: string;
  meta?: { logMessages?: string[]; err?: unknown };
  transactionError?: unknown;
}

/**
 * Helius enhanced-transaction webhook. Validates the shared auth header, then
 * processes parsed transactions idempotently. Returns 200 fast.
 */
export async function webhookRoutes(fastify: FastifyInstance, opts: { env: Env }) {
  const { env } = opts;
  const ctx: IndexerCtx = { prisma: prisma as unknown as PrismaClient, redis: getRedis(env.REDIS_URL) };
  const expectedAuth = process.env.HELIUS_WEBHOOK_AUTH;

  fastify.post("/helius", async (req, reply) => {
    if (expectedAuth && req.headers["authorization"] !== expectedAuth) {
      return reply.code(401).send({ ok: false, code: "AUTH_UNAUTHORIZED", error: "Invalid webhook auth" });
    }

    const txs = (Array.isArray(req.body) ? req.body : []) as HeliusTx[];
    // Process async-ish but within the request; production would enqueue.
    for (const tx of txs) {
      try {
        const existing = await ctx.prisma.transaction.findUnique({ where: { signature: tx.signature }, select: { signature: true } });
        if (existing) continue;
        const logs = tx.meta?.logMessages ?? [];
        await ctx.prisma.transaction.create({
          data: {
            signature: tx.signature,
            slot: BigInt(tx.slot ?? 0),
            blockTime: tx.timestamp ? new Date(tx.timestamp * 1000) : null,
            fee: BigInt(tx.fee ?? 0),
            feePayer: tx.feePayer ?? "",
            status: tx.transactionError || tx.meta?.err ? "FAILED" : "SUCCESS",
            programIds: [env.PROGRAM_ID],
            rawLogs: logs,
          },
        });
        for (const evt of parseEvents(logs, env.PROGRAM_ID)) {
          await dispatchEvent(evt.name, evt.data, tx.signature, BigInt(tx.slot ?? 0), ctx).catch(() => {});
        }
      } catch {
        /* skip malformed entry */
      }
    }
    return reply.code(200).send({ ok: true, processed: txs.length });
  });
}
