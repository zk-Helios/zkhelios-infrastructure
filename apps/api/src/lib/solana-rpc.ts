import { Connection } from "@solana/web3.js";
import type { Env } from "../config/env";

let mainnet: Connection | null = null;
let devnet: Connection | null = null;

/** Cached RPC connections per cluster. */
export function getConnection(env: Env, cluster: "mainnet-beta" | "devnet" = "devnet"): Connection {
  if (cluster === "mainnet-beta") {
    mainnet ??= new Connection(env.SOLANA_RPC_URL_MAINNET, "confirmed");
    return mainnet;
  }
  devnet ??= new Connection(env.SOLANA_RPC_URL_DEVNET, "confirmed");
  return devnet;
}

/** Round-trip latency to the RPC (ms), for health/stats. */
export async function rpcLatencyMs(conn: Connection): Promise<number> {
  const start = Date.now();
  await conn.getSlot();
  return Date.now() - start;
}
