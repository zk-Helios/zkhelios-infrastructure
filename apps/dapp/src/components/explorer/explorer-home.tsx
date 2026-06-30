"use client";

import Link from "next/link";
import { Card, CardTitle } from "@zkhelios/ui";
import { ExplorerSearch } from "./explorer-search";
import { ProofStatusBadge } from "./proof-status-badge";
import { TypeBadge } from "@/components/transactions/type-badge";
import { StatusDot } from "@/components/transactions/status-badge";
import { ConnectionStatus } from "@/components/dashboard/connection-status";
import { getProofType } from "@/lib/zk/circuits";
import { truncate } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { useLatestProofs, useLatestTransactions, useLeaderboard } from "@/hooks/use-explorer";
import { useRealtimeStats } from "@/hooks/use-realtime-stats";

export function ExplorerHome() {
  const proofs = useLatestProofs();
  const txs = useLatestTransactions();
  const board = useLeaderboard();
  const { stats, status } = useRealtimeStats();

  return (
    <div className="space-y-6">
      <ExplorerSearch large />

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-ink-400 bg-ink-900 px-4 py-3">
        <span className="font-mono text-caption text-paper-faint">
          Slot <span className="text-paper">{stats ? stats.slot.toLocaleString("en-US") : "…"}</span> · Epoch{" "}
          <span className="text-paper">{stats?.epoch ?? "…"}</span> · {stats ? `${stats.tps.toLocaleString("en-US")} TPS` : "…"}
        </span>
        <ConnectionStatus status={status} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Latest proofs */}
        <Card padding="md" className="flex flex-col gap-3">
          <CardTitle className="text-h6">Latest proofs</CardTitle>
          <ul className="divide-y divide-ink-400">
            {(proofs.data ?? []).map((p) => (
              <li key={p.id} className="py-2.5">
                <Link href={`/explorer/proof/${p.id}`} className="flex items-center justify-between gap-2 hover:text-amber-300">
                  <span className="flex items-center gap-2">
                    {(() => {
                      const Icon = getProofType(p.kind).icon;
                      return <Icon className="size-3.5 text-amber-400" />;
                    })()}
                    <span className="font-mono text-caption text-paper">{truncate(p.proofAccount ?? p.id, 5)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <ProofStatusBadge status={p.status} />
                  </span>
                </Link>
              </li>
            ))}
            {proofs.isLoading && <SkeletonRows />}
          </ul>
        </Card>

        {/* Latest transactions */}
        <Card padding="md" className="flex flex-col gap-3">
          <CardTitle className="text-h6">Latest transactions</CardTitle>
          <ul className="divide-y divide-ink-400">
            {(txs.data ?? []).map((t) => (
              <li key={t.signature} className="py-2.5">
                <Link href={`/explorer/tx/${t.signature}`} className="flex items-center justify-between gap-2 hover:text-amber-300">
                  <span className="flex items-center gap-2">
                    <StatusDot status={t.status} />
                    <span className="font-mono text-caption text-paper">{truncate(t.signature, 5)}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <TypeBadge type={t.type} />
                    <span className="font-mono text-[0.7rem] text-paper-faint">{timeAgo(t.blockTime)}</span>
                  </span>
                </Link>
              </li>
            ))}
            {txs.isLoading && <SkeletonRows />}
          </ul>
        </Card>

        {/* Leaderboard */}
        <Card padding="md" className="flex flex-col gap-3">
          <CardTitle className="text-h6">Top provers (24h)</CardTitle>
          <ol className="divide-y divide-ink-400">
            {(board.data ?? []).map((e, i) => (
              <li key={e.pubkey} className="flex items-center justify-between gap-2 py-2.5">
                <Link href={`/explorer/address/${e.pubkey}`} className="flex items-center gap-3 hover:text-amber-300">
                  <span className="grid size-6 place-items-center rounded-full bg-amber-500/15 font-mono text-[0.65rem] font-bold text-amber-400">
                    {i + 1}
                  </span>
                  <span className="font-mono text-caption text-paper">{truncate(e.pubkey, 5)}</span>
                </Link>
                <span className="font-mono text-caption text-paper-muted">{e.proofCount} proofs</span>
              </li>
            ))}
            {board.isLoading && <SkeletonRows />}
          </ol>
        </Card>
      </div>
    </div>
  );
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="py-2.5">
          <div className="skeleton h-5 w-full rounded" />
        </li>
      ))}
    </>
  );
}
