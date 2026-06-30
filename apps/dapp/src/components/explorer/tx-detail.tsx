"use client";

import { ExternalLink } from "lucide-react";
import { Card, CardTitle } from "@zkhelios/ui";
import { Breadcrumbs } from "./breadcrumbs";
import { DetailRow } from "./detail-row";
import { StatusBadge } from "@/components/transactions/status-badge";
import { TypeBadge } from "@/components/transactions/type-badge";
import { PublicKeyDisplay } from "@/components/ui/public-key-display";
import { ComputeUnitEstimate } from "@/components/ui/compute-unit-estimate";
import { useTransaction } from "@/hooks/use-transactions";
import { explorerUrl, solscanUrl } from "@/lib/solana";
import { useClusterStore } from "@/stores/cluster-store";
import { formatSol, truncate } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

export function TxDetail({ signature }: { signature: string }) {
  const { data: tx, isLoading } = useTransaction(signature);
  const cluster = useClusterStore((s) => s.cluster);

  return (
    <>
      <Breadcrumbs items={[{ label: "Explorer", href: "/explorer" }, { label: "Transaction" }, { label: truncate(signature, 6) }]} />
      {isLoading ? (
        <div className="skeleton h-72 w-full rounded-lg" />
      ) : !tx ? (
        <Card padding="lg">Transaction not found.</Card>
      ) : (
        <div className="space-y-6">
          <Card padding="lg">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <TypeBadge type={tx.type} />
              <StatusBadge status={tx.status} />
              <span className="ml-auto flex gap-2">
                <a href={explorerUrl("tx", tx.signature, cluster)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-caption text-amber-400 hover:text-amber-300">
                  Explorer <ExternalLink className="size-3" />
                </a>
                {cluster !== "localnet" && (
                  <a href={solscanUrl("tx", tx.signature, cluster)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-caption text-paper-faint hover:text-amber-300">
                    Solscan <ExternalLink className="size-3" />
                  </a>
                )}
              </span>
            </div>
            <dl className="divide-y divide-ink-400 border-t border-ink-400">
              <DetailRow label="Signature"><span className="font-mono">{tx.signature}</span></DetailRow>
              <DetailRow label="Slot">{tx.slot.toLocaleString("en-US")}</DetailRow>
              <DetailRow label="Timestamp">{formatDateTime(tx.blockTime)}</DetailRow>
              <DetailRow label="Fee payer"><PublicKeyDisplay pubkey={tx.feePayer} showExplorer /></DetailRow>
              <DetailRow label="Fee">{formatSol(tx.fee, { fromLamports: true })} SOL</DetailRow>
              <DetailRow label="Instructions">{tx.instructionCount}</DetailRow>
              <DetailRow label="Compute units"><ComputeUnitEstimate units={tx.computeUnits} /></DetailRow>
              {tx.proofAccount && <DetailRow label="Proof account"><PublicKeyDisplay pubkey={tx.proofAccount} showExplorer /></DetailRow>}
            </dl>
          </Card>

          <Card padding="lg">
            <CardTitle className="mb-3 text-h6">Program logs</CardTitle>
            <pre className="overflow-x-auto rounded-md border border-ink-400 bg-black/40 p-3 font-mono text-[0.7rem] leading-5 text-paper-muted">
              {tx.logs.join("\n")}
            </pre>
          </Card>

          {tx.accountKeys.length > 0 && (
            <Card padding="lg">
              <CardTitle className="mb-3 text-h6">Accounts</CardTitle>
              <ul className="space-y-1.5">
                {tx.accountKeys.map((k) => (
                  <li key={k}><PublicKeyDisplay pubkey={k} chars={6} showExplorer /></li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </>
  );
}
