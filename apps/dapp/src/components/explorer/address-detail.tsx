"use client";

import Link from "next/link";
import { Card, CardTitle } from "@zkhelios/ui";
import { Breadcrumbs } from "./breadcrumbs";
import { WatchButton } from "./watch-button";
import { ProofStatusBadge } from "./proof-status-badge";
import { TypeBadge } from "@/components/transactions/type-badge";
import { StatusDot } from "@/components/transactions/status-badge";
import { PublicKeyDisplay } from "@/components/ui/public-key-display";
import { LamportsToSol } from "@/components/ui/lamports-to-sol";
import { getProofType } from "@/lib/zk/circuits";
import { useAddressOverview } from "@/hooks/use-explorer";
import { truncate, formatAmount } from "@/lib/utils";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const HEAT = ["bg-ink-700", "bg-amber-500/25", "bg-amber-500/45", "bg-amber-500/70", "bg-amber-400"];

export function AddressDetail({ pubkey }: { pubkey: string }) {
  const { data, isLoading } = useAddressOverview(pubkey);

  return (
    <>
      <Breadcrumbs items={[{ label: "Explorer", href: "/explorer" }, { label: "Address" }, { label: truncate(pubkey, 6) }]} />
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <PublicKeyDisplay pubkey={pubkey} chars={8} showExplorer className="text-body" />
        <WatchButton pubkey={pubkey} />
      </div>

      {isLoading || !data ? (
        <div className="skeleton h-72 w-full rounded-lg" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card padding="md" className="flex flex-col gap-3">
            <CardTitle className="text-h6">Holdings</CardTitle>
            <div>
              <span className="font-mono text-caption text-paper-faint">Balance</span>
              <div className="font-display text-h4 font-bold text-paper"><LamportsToSol lamports={data.solLamports} /></div>
            </div>
            <ul className="divide-y divide-ink-400 border-t border-ink-400">
              {data.tokens.map((t) => (
                <li key={t.mint} className="flex items-center justify-between py-2 text-caption">
                  <span className="text-paper">{t.symbol}</span>
                  <span className="font-mono text-paper-muted">{formatAmount(t.amount)}</span>
                </li>
              ))}
            </ul>
          </Card>

          <Card padding="md" className="flex flex-col gap-3">
            <CardTitle className="text-h6">Proofs submitted</CardTitle>
            <ul className="divide-y divide-ink-400">
              {data.proofs.map((p) => (
                <li key={p.id} className="py-2">
                  <Link href={`/explorer/proof/${p.id}`} className="flex items-center justify-between gap-2 hover:text-amber-300">
                    <span className="flex items-center gap-2">
                      {(() => { const Icon = getProofType(p.kind).icon; return <Icon className="size-3.5 text-amber-400" />; })()}
                      <span className="text-caption text-paper">{getProofType(p.kind).label}</span>
                    </span>
                    <ProofStatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          </Card>

          <Card padding="md" className="flex flex-col gap-3">
            <CardTitle className="text-h6">Activity (90d)</CardTitle>
            <div className="grid grid-cols-[repeat(15,minmax(0,1fr))] gap-1">
              {data.heatmap.map((v, i) => (
                <span key={i} className={cn("aspect-square rounded-sm", HEAT[v] ?? HEAT[0])} title={`${v} actions`} />
              ))}
            </div>
          </Card>

          <Card padding="md" className="flex flex-col gap-3 lg:col-span-3">
            <CardTitle className="text-h6">Recent transactions</CardTitle>
            <ul className="divide-y divide-ink-400">
              {data.recentTransactions.map((t) => (
                <li key={t.signature} className="py-2.5">
                  <Link href={`/explorer/tx/${t.signature}`} className="flex items-center justify-between gap-2 hover:text-amber-300">
                    <span className="flex items-center gap-2">
                      <StatusDot status={t.status} />
                      <span className="font-mono text-caption text-paper">{truncate(t.signature, 6)}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <TypeBadge type={t.type} />
                      <span className="font-mono text-[0.7rem] text-paper-faint">{timeAgo(t.blockTime)}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
