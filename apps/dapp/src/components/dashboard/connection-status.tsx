import { cn } from "@/lib/utils";
import type { RealtimeStatus } from "@/hooks/use-realtime-stats";

const META: Record<RealtimeStatus, { label: string; color: string }> = {
  connecting: { label: "Connecting", color: "bg-status-warning" },
  live: { label: "Live", color: "bg-status-online" },
  reconnecting: { label: "Reconnecting", color: "bg-status-warning" },
};

/** Small live-data indicator for realtime sections. */
export function ConnectionStatus({ status, className }: { status: RealtimeStatus; className?: string }) {
  const m = META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-caption text-paper-faint", className)}>
      <span className={cn("size-1.5 rounded-full", m.color, status === "live" && "animate-pulse")} />
      {m.label}
    </span>
  );
}
