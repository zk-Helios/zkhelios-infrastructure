"use client";

import { Clock } from "lucide-react";
import { Card, CardTitle } from "@zkhelios/ui";
import { SlotProgressBar } from "@/components/ui/slot-progress-bar";
import { useEpochInfo } from "@/hooks/use-epoch-info";

/** Live epoch + slot progress from the connected RPC. */
export function EpochCard() {
  const { info, error } = useEpochInfo();

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-h6">Epoch progress</CardTitle>
        <Clock className="size-4 text-amber-400" />
      </div>
      {error || !info ? (
        <div className="flex flex-col gap-3">
          <div className="skeleton h-4 w-full rounded" />
          <div className="skeleton h-1.5 w-full rounded-full" />
          <p className="text-caption text-paper-faint">
            {error ? "RPC unavailable — connect to a reachable cluster." : "Loading slot data…"}
          </p>
        </div>
      ) : (
        <>
          <SlotProgressBar epoch={info.epoch} slotIndex={info.slotIndex} slotsInEpoch={info.slotsInEpoch} />
          <div className="font-mono text-caption text-paper-faint">
            Absolute slot {info.absoluteSlot.toLocaleString("en-US")}
          </div>
        </>
      )}
    </Card>
  );
}
