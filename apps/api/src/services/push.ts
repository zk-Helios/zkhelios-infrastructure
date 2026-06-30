import webpush from "web-push";
import { prisma } from "@zkhelios/db";
import type { Env } from "../config/env";

let configured = false;

function ensureVapid(env: Env): boolean {
  if (!env.VAPID_PUBLIC_KEY || !env.VAPID_PRIVATE_KEY) return false;
  if (!configured) {
    webpush.setVapidDetails(env.VAPID_SUBJECT, env.VAPID_PUBLIC_KEY, env.VAPID_PRIVATE_KEY);
    configured = true;
  }
  return true;
}

/** Send a web-push notification to all of a user's subscriptions. Prunes dead ones (410/404). */
export async function sendPush(
  env: Env,
  userId: string,
  payload: { title: string; body: string; url?: string },
): Promise<{ sent: number }> {
  if (!ensureVapid(env)) return { sent: 0 };
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  let sent = 0;
  await Promise.all(
    subs.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload),
        );
        sent++;
      } catch (err) {
        const code = (err as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) {
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        }
      }
    }),
  );
  return { sent };
}
