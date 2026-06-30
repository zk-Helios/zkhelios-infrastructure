"use client";

import { useEffect, useRef, useState } from "react";
import { useConnection } from "@solana/wallet-adapter-react";
import { RPC_PROVIDER } from "@/lib/constants";
import { useClusterStore } from "@/stores/cluster-store";
import { CLUSTERS } from "@/lib/solana";

/**
 * Status strip: live slot (onSlotChange subscription) + sampled TPS +
 * "Powered by Solana" + RPC provider name.
 */
export function AppFooter() {
  const { connection } = useConnection();
  const cluster = useClusterStore((s) => s.cluster);
  const [slot, setSlot] = useState<number | null>(null);
  const [tps, setTps] = useState<number | null>(null);
  const lastRef = useRef<{ slot: number; time: number } | null>(null);

  useEffect(() => {
    let active = true;
    let subId: number | undefined;

    connection
      .getSlot()
      .then((s) => active && setSlot(s))
      .catch(() => {});

    subId = connection.onSlotChange((info) => {
      if (!active) return;
      setSlot(info.slot);
      const now = performance.now();
      const last = lastRef.current;
      if (last && now > last.time) {
        const rate = ((info.slot - last.slot) / (now - last.time)) * 1000 * 2400; // ~2400 tx/slot heuristic
        setTps(Math.max(0, Math.round(rate)));
      }
      lastRef.current = { slot: info.slot, time: now };
    });

    return () => {
      active = false;
      if (subId !== undefined) connection.removeSlotChangeListener(subId).catch(() => {});
    };
  }, [connection]);

  const info = CLUSTERS[cluster];

  return (
    <footer className="flex flex-col items-center justify-between gap-2 border-t border-ink-400 px-6 py-3 text-caption text-paper-faint sm:flex-row">
      <div className="flex items-center gap-2">
        <span className="size-2 animate-pulse rounded-full" style={{ backgroundColor: info.color }} />
        <span className="font-mono" style={{ color: info.color }}>
          {info.name}
        </span>
        <span className="text-ink-300">·</span>
        <span className="font-mono">slot {slot === null ? "…" : slot.toLocaleString("en-US")}</span>
        {tps !== null && (
          <>
            <span className="text-ink-300">·</span>
            <span className="font-mono">{tps.toLocaleString("en-US")} TPS</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2 font-mono">
        <span>Powered by Solana</span>
        <span className="text-ink-300">·</span>
        <span>{RPC_PROVIDER}</span>
      </div>
    </footer>
  );
}
