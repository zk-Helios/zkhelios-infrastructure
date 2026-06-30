import { prisma, type Prisma } from "@zkhelios/db";
import type { Env } from "../../config/env";
import { getRedis } from "../../lib/redis";
import { clampLimit, decodeCursor, encodeCursor, type Page } from "../../lib/pagination";
import { sendEmail, templates } from "../../services/email";
import { mergePreferences, type NotificationPreferences } from "./preferences";
import { ValidationError } from "../../utils/errors";
import type { z } from "zod";
import type { PreferencesBody, PushSubscribeBody } from "./schemas";

const emailCodeKey = (pubkey: string) => `emailverify:${pubkey}`;
const EMAIL_CODE_TTL = 600;

export class NotificationService {
  constructor(private env: Env) {}
  private redis() {
    return getRedis(this.env.REDIS_URL);
  }
  private async userId(pubkey: string): Promise<string> {
    const u = await prisma.user.findUnique({ where: { pubkey }, select: { id: true } });
    if (!u) throw new ValidationError("User not found");
    return u.id;
  }

  async list(pubkey: string, opts: { cursor?: string; limit?: number }): Promise<Page<unknown>> {
    const userId = await this.userId(pubkey);
    const limit = clampLimit(opts.limit);
    const cursor = decodeCursor(opts.cursor);
    const [total, rows] = await Promise.all([
      prisma.notification.count({ where: { userId } }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      }),
    ]);
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      data: n.data,
      read: n.read,
      createdAt: n.createdAt.toISOString(),
    }));
    return { items, nextCursor: hasMore ? encodeCursor(items[items.length - 1].id) : null, total };
  }

  async markRead(pubkey: string, id: string) {
    await prisma.notification.updateMany({ where: { id, user: { pubkey } }, data: { read: true } });
  }
  async markAllRead(pubkey: string) {
    await prisma.notification.updateMany({ where: { user: { pubkey }, read: false }, data: { read: true } });
  }
  async remove(pubkey: string, id: string) {
    await prisma.notification.deleteMany({ where: { id, user: { pubkey } } });
  }

  async getPreferences(pubkey: string): Promise<NotificationPreferences> {
    const u = await prisma.user.findUnique({ where: { pubkey }, select: { notificationPrefs: true } });
    return mergePreferences(u?.notificationPrefs);
  }
  async updatePreferences(pubkey: string, patch: z.infer<typeof PreferencesBody>) {
    const current = await this.getPreferences(pubkey);
    const merged = mergePreferences(current, patch);
    await prisma.user.update({
      where: { pubkey },
      data: { notificationPrefs: merged as unknown as Prisma.InputJsonValue },
    });
    return merged;
  }

  async emailVerifyStart(pubkey: string, email: string) {
    const code = String(Math.floor(100000 + Math.random() * 900000));
    await this.redis().set(emailCodeKey(pubkey), JSON.stringify({ email, code }), "EX", EMAIL_CODE_TTL);
    await sendEmail(this.env, { to: email, subject: "Verify your email · zkHelios", html: templates.emailVerify(code) });
    return { sent: true };
  }
  async emailVerifyConfirm(pubkey: string, code: string) {
    const stored = await this.redis().get(emailCodeKey(pubkey));
    if (!stored) throw new ValidationError("Code expired");
    const { email, code: expected } = JSON.parse(stored) as { email: string; code: string };
    if (code !== expected) throw new ValidationError("Invalid code");
    await prisma.user.update({ where: { pubkey }, data: { email, emailVerified: true } });
    await this.redis().del(emailCodeKey(pubkey));
    return { verified: true };
  }

  async pushSubscribe(pubkey: string, sub: z.infer<typeof PushSubscribeBody>) {
    const userId = await this.userId(pubkey);
    await prisma.pushSubscription.upsert({
      where: { endpoint: sub.endpoint },
      update: { p256dh: sub.keys.p256dh, auth: sub.keys.auth, userId },
      create: { userId, endpoint: sub.endpoint, p256dh: sub.keys.p256dh, auth: sub.keys.auth },
    });
    return { vapidPublicKey: this.env.VAPID_PUBLIC_KEY ?? null };
  }
  async pushUnsubscribe(pubkey: string, endpoint: string) {
    await prisma.pushSubscription.deleteMany({ where: { endpoint, user: { pubkey } } });
  }
}
