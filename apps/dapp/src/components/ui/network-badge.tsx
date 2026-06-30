import { cn } from "@/lib/utils";
import { CLUSTERS, type Cluster } from "@/lib/solana";

interface NetworkBadgeProps {
  cluster: Cluster;
  showDot?: boolean;
  className?: string;
}

const DOT = {
  online: "bg-status-online",
  warning: "bg-status-warning",
  offline: "bg-[#60A5FA]",
};

/** Cluster identity chip: color swatch + name (green=mainnet, yellow=devnet, blue=localnet). */
export function NetworkBadge({ cluster, showDot = true, className }: NetworkBadgeProps) {
  const info = CLUSTERS[cluster];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-ink-400 bg-ink-800 px-2.5 py-1.5 text-caption font-medium text-paper",
        className,
      )}
    >
      <span className="size-2.5 rounded-full" style={{ backgroundColor: info.color }} aria-hidden />
      <span className="truncate">{info.name}</span>
      {showDot && <span className={cn("size-1.5 rounded-full", DOT[info.dot])} />}
    </span>
  );
}
