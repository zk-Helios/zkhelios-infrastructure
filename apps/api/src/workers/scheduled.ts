import { Queue, Worker } from "bullmq";
import { prisma } from "@zkhelios/db";
import { loadEnv, type Env } from "../config/env";
import { getBullConnection } from "../lib/redis";

const QUEUE = "scheduled";

/** Delete sessions past their expiry. */
export async function cleanupExpiredSessions(): Promise<number> {
  const { count } = await prisma.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  return count;
}

/** Daily digest: notify users with unread notifications (email opted-in elsewhere). */
export async function sendDailyDigest(): Promise<number> {
  const users = await prisma.user.findMany({
    where: { notifications: { some: { read: false } } },
    select: { id: true },
  });
  // Real send happens via the email service per-user; here we just report scope.
  return users.length;
}

/**
 * Re-sync the circuit registry from on-chain (catch admin drift). Requires RPC +
 * Anchor account decoding — wired against a live program in deployment.
 */
export async function resyncCircuits(_env: Env): Promise<void> {
  // eslint-disable-next-line no-console
  console.log("[scheduled] circuit resync — implement against deployed program");
}

/** Register repeatable jobs + the worker that runs them. */
export async function startScheduledJobs(env: Env): Promise<Worker> {
  const connection = getBullConnection(env.REDIS_URL);
  const queue = new Queue(QUEUE, { connection });

  const opts = { removeOnComplete: true, removeOnFail: 50 };
  await queue.add("session-cleanup", {}, { repeat: { every: 3_600_000 }, ...opts }); // hourly
  await queue.add("digest", {}, { repeat: { pattern: "0 9 * * *" }, ...opts }); // daily 09:00
  await queue.add("circuit-resync", {}, { repeat: { every: 3_600_000 }, ...opts });

  return new Worker(
    QUEUE,
    async (job) => {
      switch (job.name) {
        case "session-cleanup":
          return cleanupExpiredSessions();
        case "digest":
          return sendDailyDigest();
        case "circuit-resync":
          return resyncCircuits(env);
        default:
          return;
      }
    },
    { connection },
  );
}

if (require.main === module) {
  startScheduledJobs(loadEnv())
    // eslint-disable-next-line no-console
    .then(() => console.log("[scheduled] jobs registered"))
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.error(e);
      process.exit(1);
    });
}
