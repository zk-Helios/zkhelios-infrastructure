import fp from "fastify-plugin";
import websocket from "@fastify/websocket";
import type { FastifyRequest } from "fastify";
import { prisma } from "@zkhelios/db";
import type { Env } from "../../config/env";
import { Channels, PubSubSubscriber } from "../../lib/pubsub";
import { verifySession } from "../../lib/jwt";

const MAX_SUBS = 10;
const HEARTBEAT_MS = 30_000;
const IDLE_MS = 5 * 60_000;

/** Resolve the authenticated pubkey from the session cookie (for user channels). */
async function resolveUser(req: FastifyRequest, env: Env): Promise<string | null> {
  const token = req.cookies?.[env.AUTH_COOKIE_NAME];
  if (!token) return null;
  const payload = verifySession(token, env.AUTH_JWT_SECRET);
  if (!payload) return null;
  const session = await prisma.session.findUnique({ where: { id: payload.jti }, include: { user: true } });
  if (!session || session.expiresAt.getTime() < Date.now()) return null;
  return session.user.pubkey;
}

/** Map a client channel name → Redis channel (or null if not allowed). */
function resolveChannel(channel: string, pubkey: string | null): string | null {
  if (channel === "stats") return Channels.statsUpdate;
  if (channel === "proofs") return Channels.proofsNew;
  const addr = channel.match(/^address:([1-9A-HJ-NP-Za-km-z]{32,44}):txs$/);
  if (addr) return Channels.addressTxs(addr[1]);
  if (channel === "user:proofs") return pubkey ? Channels.userProofs(pubkey) : null;
  if (channel === "user:notifications") return pubkey ? Channels.userNotifications(pubkey) : null;
  return null;
}

export const realtimePlugin = fp(async (fastify, opts: { env: Env }) => {
  const { env } = opts;
  await fastify.register(websocket);

  fastify.get("/ws", { websocket: true }, async (socket, req) => {
    const pubkey = await resolveUser(req, env);
    const sub = new PubSubSubscriber(env.REDIS_URL);
    const subscribed = new Map<string, (data: unknown) => void>();
    let lastActivity = Date.now();

    const send = (obj: unknown) => {
      try {
        socket.send(JSON.stringify(obj));
      } catch {
        /* socket closed */
      }
    };

    send({ type: "welcome", authenticated: !!pubkey });

    const heartbeat = setInterval(() => {
      if (Date.now() - lastActivity > IDLE_MS) {
        socket.close(1000, "idle timeout");
        return;
      }
      try {
        socket.ping();
      } catch {
        /* closed */
      }
    }, HEARTBEAT_MS);

    socket.on("message", async (raw: Buffer) => {
      lastActivity = Date.now();
      let msg: { type?: string; channel?: string };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return send({ type: "error", error: "Invalid JSON" });
      }

      if (msg.type === "subscribe" && msg.channel) {
        if (subscribed.size >= MAX_SUBS) return send({ type: "error", error: "Subscription limit reached" });
        const redisChannel = resolveChannel(msg.channel, pubkey);
        if (!redisChannel) return send({ type: "error", error: `Channel not allowed: ${msg.channel}` });
        if (subscribed.has(msg.channel)) return;
        const handler = (data: unknown) => send({ type: msg.channel, data });
        subscribed.set(msg.channel, handler);
        await sub.subscribe(redisChannel, handler);
        send({ type: "subscribed", channel: msg.channel });
      } else if (msg.type === "unsubscribe" && msg.channel) {
        const handler = subscribed.get(msg.channel);
        const redisChannel = resolveChannel(msg.channel, pubkey);
        if (handler && redisChannel) {
          await sub.unsubscribe(redisChannel, handler);
          subscribed.delete(msg.channel);
        }
      }
    });

    socket.on("close", () => {
      clearInterval(heartbeat);
      void sub.close();
    });
  });
});
