"use client";

import { useEffect, useRef } from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Transaction } from "@/types";
import { TransactionSignatureDisplay } from "@/components/ui/transaction-signature-display";
import { TypeBadge } from "./type-badge";
import { StatusBadge } from "./status-badge";
import { formatSol, formatUsd, cn } from "@/lib/utils";
import { timeAgo } from "@/lib/format";

interface Props {
  rows: Transaction[];
  solUsd: number;
  onSelect: (signature: string) => void;
  onReachEnd: () => void;
  hasMore: boolean;
  fetchingMore: boolean;
}

const GRID = "grid grid-cols-[1.6fr_0.9fr_0.7fr_1fr_0.9fr_0.8fr] items-center gap-3 px-4";

export function TransactionsTable({ rows, solUsd, onSelect, onReachEnd, hasMore, fetchingMore }: Props) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 56,
    overscan: 8,
  });

  // Background-load the next page when the last row nears view.
  const items = virtualizer.getVirtualItems();
  useEffect(() => {
    const last = items[items.length - 1];
    if (last && last.index >= rows.length - 4 && hasMore && !fetchingMore) onReachEnd();
  }, [items, rows.length, hasMore, fetchingMore, onReachEnd]);

  return (
    <div className="overflow-hidden rounded-lg border border-ink-400 bg-ink-800">
      {/* Header */}
      <div className={cn(GRID, "border-b border-ink-400 py-3 font-mono text-[0.7rem] uppercase tracking-wider text-paper-faint")}>
        <span>Signature</span>
        <span>Type</span>
        <span className="text-right">Instr.</span>
        <span className="text-right">Fee</span>
        <span>Status</span>
        <span className="text-right">Time</span>
      </div>

      {/* Virtualized rows */}
      <div ref={parentRef} className="h-[58vh] overflow-y-auto" tabIndex={0} aria-label="Transactions">
        <div style={{ height: virtualizer.getTotalSize(), position: "relative", width: "100%" }}>
          {items.map((vi) => {
            const tx = rows[vi.index];
            return (
              <button
                key={tx.signature}
                onClick={() => onSelect(tx.signature)}
                className={cn(GRID, "absolute left-0 top-0 w-full border-b border-ink-400/60 py-3 text-left transition-colors hover:bg-white/[0.03]")}
                style={{ height: vi.size, transform: `translateY(${vi.start}px)` }}
              >
                <TransactionSignatureDisplay signature={tx.signature} chars={5} className="pointer-events-none text-caption" />
                <TypeBadge type={tx.type} />
                <span className="text-right font-mono text-caption text-paper-muted">{tx.instructionCount}</span>
                <span className="text-right">
                  <span className="block font-mono text-caption text-paper">{formatSol(tx.fee, { fromLamports: true })}</span>
                  <span className="block font-mono text-[0.65rem] text-paper-faint">
                    {formatUsd((tx.fee / 1e9) * solUsd)}
                  </span>
                </span>
                <StatusBadge status={tx.status} />
                <span className="text-right font-mono text-[0.7rem] text-paper-faint">{timeAgo(tx.blockTime)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {fetchingMore && (
        <div className="border-t border-ink-400 py-2.5 text-center font-mono text-caption text-paper-faint">
          Loading more…
        </div>
      )}
    </div>
  );
}
