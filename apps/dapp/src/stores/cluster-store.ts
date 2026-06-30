import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_CLUSTER, type Cluster } from "@/lib/solana";

interface ClusterState {
  cluster: Cluster;
  setCluster: (cluster: Cluster) => void;
}

/** User's selected Solana cluster, persisted to localStorage. */
export const useClusterStore = create<ClusterState>()(
  persist(
    (set) => ({
      cluster: DEFAULT_CLUSTER,
      setCluster: (cluster) => set({ cluster }),
    }),
    { name: "zkhelios-cluster" },
  ),
);
