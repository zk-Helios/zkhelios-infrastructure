import { cn } from "@/lib/utils";

interface SlotProgressBarProps {
  /** Slot within the current epoch. */
  slotIndex: number;
  /** Total slots in the epoch (default 432,000 on mainnet). */
  slotsInEpoch?: number;
  epoch?: number;
  className?: string;
}

/** Visualizes epoch progress via the current slot position. */
export function SlotProgressBar({
  slotIndex,
  slotsInEpoch = 432_000,
  epoch,
  className,
}: SlotProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (slotIndex / slotsInEpoch) * 100));
  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-center justify-between font-mono text-caption text-paper-faint">
        <span>{epoch !== undefined ? `Epoch ${epoch}` : "Epoch"}</span>
        <span>{pct.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
        <div
          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 text-right font-mono text-[0.7rem] text-paper-faint">
        slot {slotIndex.toLocaleString("en-US")} / {slotsInEpoch.toLocaleString("en-US")}
      </div>
    </div>
  );
}
