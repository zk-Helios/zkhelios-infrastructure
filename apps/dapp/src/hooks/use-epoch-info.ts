"use client";

import { useEffect, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";

export interface EpochInfo {
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
}

/**
 * Real epoch/slot info from the connected RPC, kept fresh via onSlotChange.
 * Falls back to nulls if the RPC is unreachable (e.g. localnet down).
 */
export function useEpochInfo() {
  const { connection } = useConnection();
  const [info, setInfo] = useState<EpochInfo | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    let subId: number | undefined;

    connection
      .getEpochInfo()
      .then((e) => {
        if (!active) return;
        setInfo({
          epoch: e.epoch,
          slotIndex: e.slotIndex,
          slotsInEpoch: e.slotsInEpoch,
          absoluteSlot: e.absoluteSlot,
        });
      })
      .catch(() => active && setError(true));

    subId = connection.onSlotChange(({ slot }) => {
      if (!active) return;
      setInfo((prev) =>
        prev
          ? {
              ...prev,
              absoluteSlot: slot,
              slotIndex: Math.min(prev.slotsInEpoch, prev.slotIndex + 1),
            }
          : prev,
      );
    });

    return () => {
      active = false;
      if (subId !== undefined) connection.removeSlotChangeListener(subId).catch(() => {});
    };
  }, [connection]);

  return { info, error };
}
