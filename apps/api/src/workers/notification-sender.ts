import { prisma, type NotificationType } from "@zkhelios/db";
import { loadEnv, type Env } from "../config/env";
import { getRedis } from "../lib/redis";
import { Channels, PubSubSubscriber, publish } from "../lib/pubsub";
import { mergePreferences, wants, type NotificationPreferences } from "../modules/notifications/preferences";
import { sendEmail, templates } from "../services/email";
import { sendPush } from "../services/push";

const DAILY_INAPP_CAP = 100;
const APP_URL = "https://app.zkhelios.app";

async function underDailyCap(redis: ReturnType<typeof getRedis>, userId: string): Promise<boolean> {
  const key = `notifcount:${userId}:${new Date().toISOString().slice(0, 10)}`;
  const n = await redis.incr(key);
  if (n === 1) await redis.expire(key, 86_400);
  return n <= DAILY_INAPP_CAP;
}

/** Create an in-app notification + fan out to email/push per preferences. */
async function notify(
  env: Env,
  user: { id: string; pubkey: string; email: string | null; emailVerified: boolean; notificationPrefs: unknown },
  args: {
    type: NotificationType;
    event: keyof NotificationPreferences["events"];
    title: string;
    body: string;
    url?: string;
  },
) {
  const redis = getRedis(env.REDIS_URL);
  const prefs = mergePreferences(user.notificationPrefs);

  if (wants(prefs, args.event, "inApp") && (await underDailyCap(redis, user.id))) {
    const n = await prisma.notification.create({
      data: { userId: user.id, type: args.type, title: args.title, body: args.body, data: args.url ? { url: args.url } : undefined },
    });
    await publish(redis, Channels.userNotifications(user.pubkey), { id: n.id, type: n.type, title: n.title, body: n.body });
  }
  if (wants(prefs, args.event, "email") && user.email && user.emailVerified) {
    await sendEmail(env, { to: user.email, subject: args.title, html: templates.announcement(args.title, args.body) });
  }
  if (wants(prefs, args.event, "push")) {
    await sendPush(env, user.id, { title: args.title, body: args.body, url: args.url });
  }
}

/** Subscribe to indexer pub/sub events and dispatch notifications. */
export async function startNotificationSender(env: Env): Promise<PubSubSubscriber> {
  const sub = new PubSubSubscriber(env.REDIS_URL);

  await sub.subscribe(Channels.proofsNew, (data) => void onProofNew(env, data as Record<string, unknown>));
  await sub.subscribe(Channels.proofsRevoked, (data) => void onProofRevoked(env, data as Record<string, unknown>));
  await sub.subscribe(Channels.circuitsNew, (data) => void onCircuitNew(env, data as Record<string, unknown>));

  // eslint-disable-next-line no-console
  console.log("[notification-sender] subscribed to proofs:new / proofs:revoked / circuits:new");
  return sub;
}

async function onProofNew(env: Env, data: Record<string, unknown>) {
  const authority = String(data.authority ?? "");
  const proofAccount = String(data.proofAccount ?? "");
  const url = `${APP_URL}/explorer/proof/${proofAccount}`;

  // 1. Notify the proof author.
  const author = await prisma.user.findUnique({ where: { pubkey: authority } });
  if (author) {
    await notify(env, author, { type: "PROOF_VERIFIED", event: "proofVerified", title: "Proof verified ✓", body: "Your proof was verified on-chain.", url });
  }

  // 2. Notify anyone watching the author's address.
  const watchers = await prisma.watchedAddress.findMany({ where: { pubkey: authority }, include: { user: true } });
  for (const w of watchers) {
    if (w.user.pubkey === authority) continue;
    await notify(env, w.user, {
      type: "SYSTEM",
      event: "watchedAddressActivity",
      title: "Watched address activity",
      body: `${authority.slice(0, 8)}… verified a proof.`,
      url: `${APP_URL}/explorer/address/${authority}`,
    });
  }
}

async function onProofRevoked(env: Env, data: Record<string, unknown>) {
  const author = await prisma.user.findUnique({ where: { pubkey: String(data.authority ?? "") } });
  if (author) {
    await notify(env, author, { type: "PROOF_REVOKED", event: "proofRevoked", title: "Proof revoked", body: "One of your proofs was revoked." });
  }
}

async function onCircuitNew(env: Env, data: Record<string, unknown>) {
  const name = String(data.name ?? "a circuit");
  const recipients = await prisma.user.findMany({ where: { notificationPrefs: { path: ["events", "circuitRegistered"], equals: true } } });
  for (const u of recipients) {
    await notify(env, u, { type: "CIRCUIT_REGISTERED", event: "circuitRegistered", title: "New circuit registered", body: `Circuit "${name}" is now available.` });
  }
}

if (require.main === module) {
  startNotificationSender(loadEnv()).catch((e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
  });
}
