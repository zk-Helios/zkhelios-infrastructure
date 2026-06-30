"use client";

import { useState } from "react";
import { X, ExternalLink } from "lucide-react";
import { TransactionSignatureDisplay } from "@/components/ui/transaction-signature-display";
import { PublicKeyDisplay } from "@/components/ui/public-key-display";
import { ComputeUnitEstimate } from "@/components/ui/compute-unit-estimate";
import { StatusBadge } from "./status-badge";
import { TypeBadge } from "./type-badge";
import { useTransaction } from "@/hooks/use-transactions";
import { explorerUrl, solscanUrl } from "@/lib/solana";
import { useClusterStore } from "@/stores/cluster-store";
import { formatSol, cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/format";

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-caption text-paper-faint">{label}</dt>
      <dd className="min-w-0 text-right text-caption text-paper">{children}</dd>
    </div>
  );
}

export function TransactionDrawer({ signature, onClose }: { signature: string | null; onClose: () => void }) {
  const { data: tx, isLoading } = useTransaction(signature);
  const cluster = useClusterStore((s) => s.cluster);
  const [showRaw, setShowRaw] = useState(false);
  const open = signature !== null;

  return (
    <div className={cn("fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div
        className={cn("absolute inset-0 bg-black/60 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")}
        onClick={onClose}
      />
      <aside
        className={cn(
          "absolute right-0 top-0 flex h-full w-full max-w-lg flex-col border-l border-ink-400 bg-ink-900 transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        )}
        role="dialog"
        aria-label="Transaction details"
      >
        <div className="flex items-center justify-between border-b border-ink-400 px-5 py-4">
          <h2 className="font-display text-h5 font-semibold text-paper">Transaction</h2>
          <button onClick={onClose} aria-label="Close" className="grid size-9 place-items-center rounded-md text-paper-muted hover:text-paper">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading || !tx ? (
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton h-6 w-full rounded" />
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              <section>
                <div className="mb-1 flex items-center gap-2">
                  <TypeBadge type={tx.type} />
                  <StatusBadge status={tx.status} />
                </div>
                <TransactionSignatureDisplay signature={tx.signature} chars={10} />
              </section>

              <section>
                <h3 className="mb-1 font-mono text-caption uppercase tracking-wider text-paper-faint">Overview</h3>
                <dl className="divide-y divide-ink-400">
                  <Row label="Slot">{tx.slot.toLocaleString("en-US")}</Row>
                  <Row label="Timestamp">{formatDateTime(tx.blockTime)}</Row>
                  <Row label="Fee payer"><PublicKeyDisplay pubkey={tx.feePayer} showExplorer /></Row>
                  <Row label="Fee">{formatSol(tx.fee, { fromLamports: true })} SOL</Row>
                  <Row label="Instructions">{tx.instructionCount}</Row>
                  <Row label="Compute units"><ComputeUnitEstimate units={tx.computeUnits} /></Row>
                  {tx.proofAccount && (
                    <Row label="Proof account"><PublicKeyDisplay pubkey={tx.proofAccount} showExplorer /></Row>
                  )}
                </dl>
              </section>

              {tx.tokenBalanceChanges.length > 0 && (
                <section>
                  <h3 className="mb-2 font-mono text-caption uppercase tracking-wider text-paper-faint">Token balance changes</h3>
                  <ul className="space-y-2">
                    {tx.tokenBalanceChanges.map((c, i) => (
                      <li key={i} className="flex items-center justify-between rounded-md border border-ink-400 bg-ink-800 px-3 py-2 text-caption">
                        <PublicKeyDisplay pubkey={c.mint} chars={4} />
                        <span className="font-mono">
                          <span className="text-paper-faint">{c.pre}</span>
                          <span className="mx-1 text-paper-faint">→</span>
                          <span className={c.post >= c.pre ? "text-status-online" : "text-status-error"}>{c.post}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <h3 className="mb-2 font-mono text-caption uppercase tracking-wider text-paper-faint">Program logs</h3>
                <pre className="overflow-x-auto rounded-md border border-ink-400 bg-black/40 p-3 font-mono text-[0.7rem] leading-5 text-paper-muted">
                  {tx.logs.join("\n")}
                </pre>
              </section>

              <section>
                <button
                  onClick={() => setShowRaw((v) => !v)}
                  className="font-mono text-caption text-amber-400 hover:text-amber-300"
                >
                  {showRaw ? "Hide" : "Show"} raw JSON
                </button>
                {showRaw && (
                  <pre className="mt-2 max-h-72 overflow-auto rounded-md border border-ink-400 bg-black/40 p-3 font-mono text-[0.7rem] leading-5 text-paper-muted">
                    {JSON.stringify(tx, null, 2)}
                  </pre>
                )}
              </section>

              <section className="flex flex-wrap gap-2">
                <a href={explorerUrl("tx", tx.signature, cluster)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-ink-400 px-3 py-2 text-caption text-paper-muted hover:border-amber-500/40 hover:text-amber-300">
                  Solana Explorer <ExternalLink className="size-3" />
                </a>
                {cluster !== "localnet" && (
                  <a href={solscanUrl("tx", tx.signature, cluster)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-ink-400 px-3 py-2 text-caption text-paper-muted hover:border-amber-500/40 hover:text-amber-300">
                    Solscan <ExternalLink className="size-3" />
                  </a>
                )}
                <a href={`https://xray.helius.xyz/tx/${tx.signature}${cluster === "devnet" ? "?network=devnet" : ""}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-md border border-ink-400 px-3 py-2 text-caption text-paper-muted hover:border-amber-500/40 hover:text-amber-300">
                  Helius xRay <ExternalLink className="size-3" />
                </a>
              </section>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}
