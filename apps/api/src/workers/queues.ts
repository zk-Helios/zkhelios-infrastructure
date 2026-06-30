import { Queue } from "bullmq";
import { getBullConnection } from "../lib/redis";

/** Named queues. Processors are implemented in later sessions (8–9). */
export const QUEUE_NAMES = {
  indexerBackfill: "indexer-backfill",
  notificationSender: "notification-sender",
  statsAggregator: "stats-aggregator",
} as const;

export function createQueues(redisUrl: string) {
  const connection = getBullConnection(redisUrl);
  return {
    indexerBackfill: new Queue(QUEUE_NAMES.indexerBackfill, { connection }),
    notificationSender: new Queue(QUEUE_NAMES.notificationSender, { connection }),
    statsAggregator: new Queue(QUEUE_NAMES.statsAggregator, { connection }),
  };
}

export type Queues = ReturnType<typeof createQueues>;
