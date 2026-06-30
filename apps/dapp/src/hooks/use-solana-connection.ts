"use client";

import { useConnection } from "@solana/wallet-adapter-react";
import { useClusterStore } from "@/stores/cluster-store";
import { CLUSTERS } from "@/lib/solana";

/** Wraps useConnection with the active cluster info + small helpers. */
export function useSolanaConnection() {
  const { connection } = useConnection();
  const cluster = useClusterStore((s) => s.cluster);

  return {
    connection,
    cluster,
    clusterInfo: CLUSTERS[cluster],
    getSlot: () => connection.getSlot(),
    getLatency: async () => {
      const start = performance.now();
      await connection.getSlot();
      return Math.round(performance.now() - start);
    },
  };
}
