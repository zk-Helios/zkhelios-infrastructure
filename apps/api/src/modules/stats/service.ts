import { prisma } from "@zkhelios/db";

export type TimeRange = "24h" | "7d" | "30d";

export class StatsService {
  /** Latest snapshot, falling back to a live DB computation if none exists. */
  async overview() {
    const latest = await prisma.networkStat.findFirst({ orderBy: { timestamp: "desc" } });
    if (latest) {
      return {
        tps: latest.tps,
        slot: latest.slot.toString(),
        totalProofs: latest.totalProofs.toString(),
        proofs24h: latest.proofs24h,
        avgVerifyTimeMs: latest.avgVerifyTimeMs,
        activeUsers24h: latest.activeUsers24h,
        rpcLatencyMs: latest.rpcLatencyMs,
        status: "online" as const,
      };
    }
    const since = new Date(Date.now() - 86_400_000);
    const [totalProofs, proofs24h, distinct] = await Promise.all([
      prisma.proofRecord.count(),
      prisma.proofRecord.count({ where: { verifiedAt: { gte: since } } }),
      prisma.proofRecord.findMany({ where: { verifiedAt: { gte: since } }, select: { authority: true }, distinct: ["authority"] }),
    ]);
    return {
      tps: 0,
      slot: "0",
      totalProofs: totalProofs.toString(),
      proofs24h,
      avgVerifyTimeMs: 0,
      activeUsers24h: distinct.length,
      rpcLatencyMs: 0,
      status: "degraded" as const,
    };
  }

  async timeseries(metric: "tps" | "proofs24h" | "activeUsers24h", range: TimeRange) {
    const windowMs = range === "24h" ? 86_400_000 : range === "7d" ? 7 * 86_400_000 : 30 * 86_400_000;
    const rows = await prisma.networkStat.findMany({
      where: { timestamp: { gte: new Date(Date.now() - windowMs) } },
      orderBy: { timestamp: "asc" },
      select: { timestamp: true, tps: true, proofs24h: true, activeUsers24h: true },
    });
    return rows.map((r) => ({ t: r.timestamp.getTime(), value: r[metric] }));
  }

  async leaderboard(limit = 10) {
    const since = new Date(Date.now() - 86_400_000);
    const grouped = await prisma.proofRecord.groupBy({
      by: ["authority"],
      where: { verifiedAt: { gte: since } },
      _count: { authority: true },
      orderBy: { _count: { authority: "desc" } },
      take: limit,
    });
    return grouped.map((g) => ({ pubkey: g.authority, proofCount: g._count.authority }));
  }
}
