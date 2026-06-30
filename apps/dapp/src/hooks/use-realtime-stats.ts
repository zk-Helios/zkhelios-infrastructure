"use client";

import { useEffect, useRef, useState } from "react";
import type { OverviewStats } from "@/types";
import { makeOverviewStats } from "@/lib/mock/solana";

export type RealtimeStatus = "connecting" | "live" | "reconnecting";

/**
 * Mocks the backend stats WebSocket (`/ws` channel `stats`, Session 8). Emits a
 * jittered snapshot on an interval and exposes a connection status so the UI can
 * show a live indicator + pulse number updates. Swapped for a real WS later.
 */
export function useRealtimeStats(intervalMs = 4000) {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [status, setStatus] = useState<RealtimeStatus>("connecting");
  const tick = useRef(0);

  useEffect(() => {
    let active = true;
    const connectTimer = setTimeout(() => {
      if (!active) return;
      setStatus("live");
      setStats(jitter(makeOverviewStats(), tick.current++));
    }, 600);

    const id = setInterval(() => {
      if (!active) return;
      setStats(jitter(makeOverviewStats(), tick.current++));
    }, intervalMs);

    return () => {
      active = false;
      clearTimeout(connectTimer);
      clearInterval(id);
    };
  }, [intervalMs]);

  return { stats, status };
}

function jitter(base: OverviewStats, t: number): OverviewStats {
  const wobble = (n: number, amp: number) => Math.max(0, Math.round(n + Math.sin(t / 2) * amp));
  return {
    ...base,
    tps: wobble(base.tps, 180),
    slot: base.slot + t * 2,
    slotInEpoch: (base.slotInEpoch + t * 2) % 432_000,
    rpcLatencyMs: wobble(base.rpcLatencyMs, 18),
    proofs24h: wobble(base.proofs24h, 40),
  };
}
