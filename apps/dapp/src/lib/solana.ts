import { clusterApiUrl, PublicKey } from "@solana/web3.js";

/** The clusters zkHelios supports. */
export type Cluster = "mainnet-beta" | "devnet" | "localnet";

export interface ClusterInfo {
  id: Cluster;
  name: string;
  /** SIWS chain id segment (solana:<cluster>). */
  chainId: string;
  /** Badge color per brand: green=mainnet, yellow=devnet, blue=localnet. */
  color: string;
  dot: "online" | "warning" | "offline";
  explorerParam: string; // querystring for Solana Explorer / Solscan
}

export const CLUSTERS: Record<Cluster, ClusterInfo> = {
  "mainnet-beta": {
    id: "mainnet-beta",
    name: "Mainnet Beta",
    chainId: "solana:mainnet",
    color: "#34D399",
    dot: "online",
    explorerParam: "",
  },
  devnet: {
    id: "devnet",
    name: "Devnet",
    chainId: "solana:devnet",
    color: "#FBBF24",
    dot: "warning",
    explorerParam: "?cluster=devnet",
  },
  localnet: {
    id: "localnet",
    name: "Localnet",
    chainId: "solana:localnet",
    color: "#60A5FA",
    dot: "offline",
    explorerParam: "?cluster=custom&customUrl=http%3A%2F%2Flocalhost%3A8899",
  },
};

export const CLUSTER_LIST = Object.values(CLUSTERS);
export const DEFAULT_CLUSTER: Cluster = "devnet";

/** Resolve the RPC endpoint for a cluster, preferring env-configured premium RPC. */
export function getRpcEndpoint(cluster: Cluster): string {
  switch (cluster) {
    case "mainnet-beta":
      return process.env.NEXT_PUBLIC_RPC_URL_MAINNET || clusterApiUrl("mainnet-beta");
    case "devnet":
      return process.env.NEXT_PUBLIC_RPC_URL_DEVNET || clusterApiUrl("devnet");
    case "localnet":
      return "http://localhost:8899";
  }
}

/** Solana Explorer URL for a signature / address on a given cluster. */
export function explorerUrl(
  kind: "tx" | "address",
  value: string,
  cluster: Cluster = DEFAULT_CLUSTER,
): string {
  return `https://explorer.solana.com/${kind}/${value}${CLUSTERS[cluster].explorerParam}`;
}

/** Solscan URL (mainnet/devnet only). */
export function solscanUrl(kind: "tx" | "account", value: string, cluster: Cluster): string {
  const suffix = cluster === "devnet" ? "?cluster=devnet" : "";
  return `https://solscan.io/${kind}/${value}${suffix}`;
}

/**
 * zkHelios program id (placeholder until the Anchor program is deployed in
 * Session 6). Defaults to the System Program id so PublicKey parsing never
 * throws at load; override via NEXT_PUBLIC_PROGRAM_ID.
 */
export const PROGRAM_ID = safePublicKey(
  process.env.NEXT_PUBLIC_PROGRAM_ID,
  "11111111111111111111111111111111",
);

function safePublicKey(value: string | undefined, fallback: string): PublicKey {
  try {
    return new PublicKey(value || fallback);
  } catch {
    return new PublicKey(fallback);
  }
}

export const LAMPORTS_PER_SOL = 1_000_000_000;
