import { Cpu } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  units: number;
  /** Per-transaction CU cap on Solana. */
  cap?: number;
  className?: string;
}

/** Displays a compute-unit estimate with context against the 1.4M per-tx cap. */
export function ComputeUnitEstimate({ units, cap = 1_400_000, className }: Props) {
  const pct = Math.min(100, (units / cap) * 100);
  const tone =
    pct < 30 ? "text-status-online" : pct < 70 ? "text-amber-400" : "text-status-error";
  return (
    <div className={cn("flex items-center gap-2 font-mono text-caption", className)}>
      <Cpu className={cn("size-4", tone)} />
      <span className="text-paper">{units.toLocaleString("en-US")} CU</span>
      <span className="text-paper-faint">({pct.toFixed(1)}% of cap)</span>
    </div>
  );
}
