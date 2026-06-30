import Redis from "ioredis";

/**
 * Redis clients. Separate connections for cache, pub/sub, and BullMQ (BullMQ
 * requires `maxRetriesPerRequest: null`). Lazily connected.
 */
let cacheClient: Redis | null = null;
let bullClient: Redis | null = null;

export function getRedis(url: string): Redis {
  if (!cacheClient) cacheClient = new Redis(url, { lazyConnect: true, maxRetriesPerRequest: 3 });
  return cacheClient;
}

/** Connection for BullMQ (must not cap retries). */
export function getBullConnection(url: string): Redis {
  if (!bullClient) bullClient = new Redis(url, { maxRetriesPerRequest: null });
  return bullClient;
}

export async function closeRedis(): Promise<void> {
  await Promise.allSettled([cacheClient?.quit(), bullClient?.quit()]);
  cacheClient = null;
  bullClient = null;
}
