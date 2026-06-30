import { Worker } from "bullmq";
import { prisma } from "@zkhelios/db";
import { loadEnv, type Env } from "../config/env";
import { getBullConnection, getRedis } from "../lib/redis";
import { getConnection, rpcLatencyMs } from "../lib/solana-rpc";
import { Channels, publish } from "../lib/pubsub";
import { QUEUE_NAMES } from "./queues";
import { Queue } from "bullmq";

/** Compute a NetworkStat snapshot from indexed data + RPC, persist, publish. */
export async function aggregateStats(env: Env) {
  const connection = getConnection(env, "devnet");
  const redis = getRedis(env.REDIS_URL);
  const since24h = new Date(Date.now() - 86_400_000);
  const since60s = new Date(Date.now() - 60_000);

  const [tx60s, totalProofs, proofs24h, distinct, slot, latency] = await Promise.all([
    prisma.transaction.count({ where: { createdAt: { gte: since60s } } }),
    prisma.proofRecord.count(),
    prisma.proofRecord.count({ where: { verifiedAt: { gte: since24h } } }),
    prisma.proofRecord.findMany({ where: { verifiedAt: { gte: since24h } }, select: { authority: true }, distinct: ["authority"] }),
    connection.getSlot().catch(() => 0),
    rpcLatencyMs(connection).catch(() => 0),
  ]);

  const snapshot = {
    timestamp: new Date(),
    tps: tx60s / 60,
    slot: BigInt(slot),
    totalProofs: BigInt(totalProofs),
    proofs24h,
    avgVerifyTimeMs: 0,
    activeUsers24h: distinct.length,
    rpcLatencyMs: latency,
  };

  await prisma.networkStat.create({ data: snapshot });
  await publish(redis, Channels.statsUpdate, {
    ...snapshot,
    slot: snapshot.slot.toString(),
    totalProofs: snapshot.totalProofs.toString(),
    timestamp: snapshot.timestamp.toISOString(),
  });
}

/** Start the BullMQ worker + schedule the repeatable (every minute) job. */
export async function startStatsAggregator(env: Env) {
  const connection = getBullConnection(env.REDIS_URL);
  const queue = new Queue(QUEUE_NAMES.statsAggregator, { connection });
  await queue.add("aggregate", {}, { repeat: { every: 60_000 }, removeOnComplete: true, removeOnFail: 100 });

  return new Worker(QUEUE_NAMES.statsAggregator, async () => aggregateStats(env), { connection });
}

if (require.main === module) {
  startStatsAggregator(loadEnv())
    // eslint-disable-next-line no-console
    .then(() => console.log("[stats-aggregator] running"))
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    });
}
