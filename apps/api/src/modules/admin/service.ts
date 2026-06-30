import { prisma, type Prisma } from "@zkhelios/db";
import type { z } from "zod";
import type { Env } from "../../config/env";
import { getRedis } from "../../lib/redis";
import { createQueues } from "../../workers/queues";
import { sendEmail, templates } from "../../services/email";
import { clampLimit, decodeCursor, encodeCursor } from "../../lib/pagination";
import type { AnnounceBody, UsersQuery } from "./schemas";

export class AdminService {
  constructor(private env: Env) {}

  async announce(input: z.infer<typeof AnnounceBody>) {
    let where: Prisma.UserWhereInput = {};
    if (input.audience === "active") where = { lastSeenAt: { gte: new Date(Date.now() - 7 * 86_400_000) } };
    else if (Array.isArray(input.audience)) where = { pubkey: { in: input.audience } };

    const users = await prisma.user.findMany({ where, select: { id: true, email: true, emailVerified: true } });
    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((u) => ({ userId: u.id, type: "SYSTEM" as const, title: input.title, body: input.body })),
      });
    }
    if (input.email) {
      await Promise.all(
        users
          .filter((u) => u.email && u.emailVerified)
          .map((u) => sendEmail(this.env, { to: u.email!, subject: input.title, html: templates.announcement(input.title, input.body) })),
      );
    }
    return { recipients: users.length };
  }

  async listUsers(opts: z.infer<typeof UsersQuery>) {
    const limit = clampLimit(opts.limit);
    const cursor = decodeCursor(opts.cursor);
    const where: Prisma.UserWhereInput = opts.search
      ? { OR: [{ pubkey: { contains: opts.search } }, { displayName: { contains: opts.search, mode: "insensitive" } }] }
      : {};
    const [total, rows] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
        select: { id: true, pubkey: true, displayName: true, email: true, role: true, locked: true, createdAt: true, lastSeenAt: true },
      }),
    ]);
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit).map((u) => ({
      pubkey: u.pubkey,
      displayName: u.displayName,
      email: u.email,
      role: u.role,
      locked: u.locked,
      joinedAt: u.createdAt.toISOString(),
      lastSeen: u.lastSeenAt?.toISOString() ?? null,
    }));
    return { items, nextCursor: hasMore ? encodeCursor(rows[limit - 1].id) : null, total };
  }

  async setLocked(pubkey: string, locked: boolean) {
    await prisma.user.update({ where: { pubkey }, data: { locked } });
    if (locked) await prisma.session.deleteMany({ where: { user: { pubkey } } }); // force logout
  }

  async queueStats() {
    const queues = createQueues(this.env.REDIS_URL);
    const entries = await Promise.all(
      Object.entries(queues).map(async ([name, q]) => [name, await q.getJobCounts()] as const),
    );
    return Object.fromEntries(entries);
  }

  async internalStats() {
    const since24h = new Date(Date.now() - 86_400_000);
    const since30d = new Date(Date.now() - 30 * 86_400_000);
    const [users, dau, mau, proofs24h, totalProofs] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastSeenAt: { gte: since24h } } }),
      prisma.user.count({ where: { lastSeenAt: { gte: since30d } } }),
      prisma.proofRecord.count({ where: { verifiedAt: { gte: since24h } } }),
      prisma.proofRecord.count(),
    ]);
    return { users, dau, mau, proofs24h, totalProofs };
  }

  async detailedHealth() {
    const checks: Record<string, "ok" | "fail"> = { db: "fail", redis: "fail" };
    try {
      await prisma.$queryRaw`SELECT 1`;
      checks.db = "ok";
    } catch {
      /* down */
    }
    try {
      const redis = getRedis(this.env.REDIS_URL);
      await redis.ping();
      checks.redis = "ok";
    } catch {
      /* down */
    }
    return checks;
  }
}
