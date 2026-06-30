"use client";

import { Activity } from "lucide-react";
import { Card, CardTitle } from "@zkhelios/ui";
import { ConnectionStatus } from "./connection-status";
import type { OverviewStats } from "@/types";
import type { RealtimeStatus } from "@/hooks/use-realtime-stats";
import { cn } from "@/lib/utils";

interface Props {
  stats: OverviewStats | null;
  status: RealtimeStatus;
}

function healthTone(latency: number) {
  if (latency < 80) return { label: "Healthy", color: "text-status-online" };
  if (latency < 200) return { label: "Degraded", color: "text-status-warning" };
  return { label: "Slow", color: "text-status-error" };
}

/** RPC latency + slot lag, fed by the realtime stats stream. */
export function NetworkHealthCard({ stats, status }: Props) {
  const latency = stats?.rpcLatencyMs ?? 0;
  const tone = healthTone(latency);

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-h6">Network health</CardTitle>
        <Activity className="size-4 text-amber-400" />
      </div>
      <ConnectionStatus status={status} />
      <dl className="flex flex-col gap-2.5 text-caption">
        <div className="flex items-center justify-between">
          <dt className="text-paper-faint">RPC latency</dt>
          <dd className={cn("font-mono", tone.color)}>{stats ? `${latency} ms` : "…"}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-paper-faint">Status</dt>
          <dd className={cn("font-mono", tone.color)}>{stats ? tone.label : "…"}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-paper-faint">Slot</dt>
          <dd className="font-mono text-paper">{stats ? stats.slot.toLocaleString("en-US") : "…"}</dd>
        </div>
      </dl>
    </Card>
  );
}
