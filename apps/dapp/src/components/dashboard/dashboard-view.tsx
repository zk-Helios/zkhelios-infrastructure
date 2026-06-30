"use client";

import dynamic from "next/dynamic";
import { Gauge, Timer, ShieldCheck, Users } from "lucide-react";
import { BalanceCard } from "./balance-card";
import { ActiveProofsCard } from "./active-proofs-card";
import { EpochCard } from "./epoch-card";
import { RecentActivityCard } from "./recent-activity-card";
import { QuickActions } from "./quick-actions";

// Recharts is heavy — split it out of the initial bundle behind a client-only boundary.
const chartFallback = <div className="skeleton h-64 w-full rounded-lg" />;
const StatCard = dynamic(() => import("./stat-card").then((m) => m.StatCard), {
  ssr: false,
  loading: () => <div className="skeleton h-32 w-full rounded-lg" />,
});
const ProofsLineChart = dynamic(() => import("./proofs-line-chart").then((m) => m.ProofsLineChart), { ssr: false, loading: () => chartFallback });
const CuBarChart = dynamic(() => import("./cu-bar-chart").then((m) => m.CuBarChart), { ssr: false, loading: () => chartFallback });
const ProofDistributionDonut = dynamic(() => import("./proof-distribution-donut").then((m) => m.ProofDistributionDonut), { ssr: false, loading: () => chartFallback });
import { AnnouncementCard } from "./announcement-card";
import { NetworkHealthCard } from "./network-health-card";
import { ConnectionStatus } from "./connection-status";
import { useRealtimeStats } from "@/hooks/use-realtime-stats";
import { useOverviewStats } from "@/hooks/use-dashboard";
import { makeSparkline } from "@/lib/mock/solana";
import { formatAmount } from "@/lib/utils";

export function DashboardView() {
  const { stats: live, status } = useRealtimeStats();
  const { data: overview, isLoading } = useOverviewStats();

  return (
    <div className="space-y-6">
      {/* Top overview */}
      <div className="grid gap-6 lg:grid-cols-3">
        <BalanceCard />
        <div className="flex flex-col gap-6">
          <ActiveProofsCard />
          <EpochCard />
        </div>
        <RecentActivityCard />
      </div>

      {/* Network stats with sparklines */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-mono text-caption uppercase tracking-[0.16em] text-paper-faint">Network</h2>
          <ConnectionStatus status={status} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Current TPS" icon={Gauge} value={live?.tps ?? 0} pulse sparkline={makeSparkline(1)} loading={!live} />
          <StatCard
            label="Avg. verify time"
            icon={Timer}
            value={overview?.avgVerifyTimeMs ?? 0}
            format={(n) => `${Math.round(n)} ms`}
            sparkline={makeSparkline(2)}
            loading={isLoading}
          />
          <StatCard
            label="Proofs (24h)"
            icon={ShieldCheck}
            value={live?.proofs24h ?? overview?.proofs24h ?? 0}
            pulse
            format={(n) => formatAmount(n, 0)}
            sparkline={makeSparkline(3)}
            loading={!live && isLoading}
          />
          <StatCard
            label="Active users (24h)"
            icon={Users}
            value={overview?.activeUsers24h ?? 0}
            format={(n) => formatAmount(n, 0)}
            sparkline={makeSparkline(4)}
            loading={isLoading}
          />
        </div>
      </div>

      {/* Primary chart + right rail */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ProofsLineChart />
        </div>
        <div className="flex flex-col gap-6">
          <QuickActions />
          <NetworkHealthCard stats={live} status={status} />
        </div>
      </div>

      {/* Secondary charts + announcements */}
      <div className="grid gap-6 lg:grid-cols-3">
        <CuBarChart />
        <ProofDistributionDonut />
        <AnnouncementCard />
      </div>
    </div>
  );
}
