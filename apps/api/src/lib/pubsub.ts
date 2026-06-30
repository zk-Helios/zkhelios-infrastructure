import Redis from "ioredis";

/** Redis pub/sub channels (kept in sync with the WS subscription model). */
export const Channels = {
  proofsNew: "proofs:new",
  proofsRevoked: "proofs:revoked",
  circuitsNew: "circuits:new",
  statsUpdate: "stats:update",
  userProofs: (pubkey: string) => `user:${pubkey}:proofs`,
  userNotifications: (pubkey: string) => `user:${pubkey}:notifications`,
  addressTxs: (pubkey: string) => `address:${pubkey}:txs`,
} as const;

/** Publish a JSON payload to a channel (uses the shared command client). */
export async function publish(redis: Redis, channel: string, payload: unknown): Promise<void> {
  await redis.publish(channel, JSON.stringify(payload)).catch(() => {});
}

/**
 * A dedicated subscriber connection (a subscribed Redis client can't run normal
 * commands, so it owns its own connection). Bridges messages to handlers.
 */
export class PubSubSubscriber {
  private sub: Redis;
  private handlers = new Map<string, Set<(data: unknown) => void>>();

  constructor(url: string) {
    this.sub = new Redis(url, { maxRetriesPerRequest: null, lazyConnect: true });
    this.sub.on("message", (channel, message) => {
      const set = this.handlers.get(channel);
      if (!set) return;
      let data: unknown;
      try {
        data = JSON.parse(message);
      } catch {
        data = message;
      }
      for (const h of set) h(data);
    });
  }

  async subscribe(channel: string, handler: (data: unknown) => void): Promise<void> {
    if (this.sub.status === "wait") await this.sub.connect().catch(() => {});
    if (!this.handlers.has(channel)) {
      this.handlers.set(channel, new Set());
      await this.sub.subscribe(channel).catch(() => {});
    }
    this.handlers.get(channel)!.add(handler);
  }

  async unsubscribe(channel: string, handler: (data: unknown) => void): Promise<void> {
    const set = this.handlers.get(channel);
    if (!set) return;
    set.delete(handler);
    if (set.size === 0) {
      this.handlers.delete(channel);
      await this.sub.unsubscribe(channel).catch(() => {});
    }
  }

  async close(): Promise<void> {
    await this.sub.quit().catch(() => {});
  }
}
