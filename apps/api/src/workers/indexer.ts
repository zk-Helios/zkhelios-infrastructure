import { PublicKey, type ConfirmedSignatureInfo } from "@solana/web3.js";
import { prisma, type PrismaClient } from "@zkhelios/db";
import { loadEnv, type Env } from "../config/env";
import { getRedis } from "../lib/redis";
import { getConnection } from "../lib/solana-rpc";
import { parseEvents } from "../lib/anchor-events";
import { dispatchEvent, type IndexerCtx } from "../modules/indexer/handlers";

const CURSOR_KEY = "indexer:cursor";
const POLL_INTERVAL_MS = 2000;
const BATCH = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Direct-RPC indexer: polls the program's signatures, decodes Anchor events,
 * and writes Transaction + ProofRecord rows. Webhooks (Helius) are the primary
 * path in production; this is the dev/fallback reconciler. Resumes from a Redis
 * cursor and is resilient to RPC failures (exponential backoff).
 */
export async function runIndexer(env: Env, signal?: { stopped: boolean }): Promise<void> {
  const connection = getConnection(env, "devnet");
  const redis = getRedis(env.REDIS_URL);
  const programId = new PublicKey(env.PROGRAM_ID);
  const ctx: IndexerCtx = { prisma: prisma as unknown as PrismaClient, redis };
  let backoff = POLL_INTERVAL_MS;

  // eslint-disable-next-line no-console
  console.log(`[indexer] polling ${programId.toBase58()} on devnet`);

  while (!signal?.stopped) {
    try {
      const until = (await redis.get(CURSOR_KEY)) ?? undefined;
      const sigs = await connection.getSignaturesForAddress(programId, { until, limit: BATCH });
      if (sigs.length > 0) {
        // Oldest → newest so the cursor advances monotonically.
        for (const info of sigs.slice().reverse()) await processSignature(info, connection, env, ctx);
        await redis.set(CURSOR_KEY, sigs[0].signature);
      }
      backoff = POLL_INTERVAL_MS;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[indexer] poll error:", (err as Error).message);
      backoff = Math.min(backoff * 2, 30_000);
    }
    await sleep(backoff);
  }
}

async function processSignature(
  info: ConfirmedSignatureInfo,
  connection: ReturnType<typeof getConnection>,
  env: Env,
  ctx: IndexerCtx,
): Promise<void> {
  // Idempotency — skip already-indexed signatures.
  const existing = await ctx.prisma.transaction.findUnique({ where: { signature: info.signature }, select: { signature: true } });
  if (existing) return;

  const tx = await connection.getTransaction(info.signature, { maxSupportedTransactionVersion: 0 });
  if (!tx || !tx.meta) return;

  const logs = tx.meta.logMessages ?? [];
  const accountKeys = tx.transaction.message.getAccountKeys();
  const feePayer = accountKeys.get(0)?.toBase58() ?? "";
  const programIds = Array.from(
    new Set(tx.transaction.message.compiledInstructions.map((ix) => accountKeys.get(ix.programIdIndex)?.toBase58() ?? "")),
  ).filter(Boolean);

  await ctx.prisma.transaction.create({
    data: {
      signature: info.signature,
      slot: BigInt(tx.slot),
      blockTime: tx.blockTime ? new Date(tx.blockTime * 1000) : null,
      fee: BigInt(tx.meta.fee),
      feePayer,
      status: tx.meta.err ? "FAILED" : "SUCCESS",
      computeUnits: tx.meta.computeUnitsConsumed ?? null,
      programIds,
      rawLogs: logs,
      errorMessage: tx.meta.err ? JSON.stringify(tx.meta.err) : null,
    },
  });

  for (const evt of parseEvents(logs, env.PROGRAM_ID)) {
    await dispatchEvent(evt.name, evt.data, info.signature, BigInt(tx.slot), ctx).catch(() => {});
  }
}

if (require.main === module) {
  runIndexer(loadEnv()).catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
}
