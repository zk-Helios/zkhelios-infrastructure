"use client";

import { useMemo, useState } from "react";
import { Download, Receipt, AlertTriangle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@zkhelios/ui";
import type { TransactionFilters } from "@/types";
import { TransactionFiltersBar } from "./transaction-filters";
import { TransactionsTable } from "./transactions-table";
import { TransactionDrawer } from "./transaction-drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { useTransactions } from "@/hooks/use-transactions";
import { usePrices } from "@/hooks/use-dashboard";
import { SOL_MINT } from "@/lib/api/jupiter";
import { exportTransactionsCsv } from "@/lib/csv";

export function TransactionsView() {
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [selected, setSelected] = useState<string | null>(null);

  const query = useTransactions(filters);
  const { data: prices } = usePrices([SOL_MINT]);
  const solUsd = prices?.[SOL_MINT] ?? 0;

  const rows = useMemo(() => query.data?.pages.flatMap((p) => p.items) ?? [], [query.data]);
  const total = query.data?.pages[0]?.total ?? 0;

  if (query.isError) {
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't load transactions"
        description="The indexer request failed. This is a transient error from the mock API — retry."
        action={<Button onClick={() => query.refetch()}>Retry</Button>}
      />
    );
  }

  const showEmpty = !query.isLoading && rows.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TransactionFiltersBar filters={filters} onChange={setFilters} />
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportTransactionsCsv(rows)}
          disabled={rows.length === 0}
          className="shrink-0"
        >
          <Download className="size-4" />
          Export CSV
        </Button>
      </div>

      {!showEmpty && (
        <p className="font-mono text-caption text-paper-faint">
          {query.isLoading ? "Loading…" : `${rows.length} of ${total.toLocaleString("en-US")} transactions`}
        </p>
      )}

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skeleton h-14 w-full rounded-md" />
          ))}
        </div>
      ) : showEmpty ? (
        <EmptyState
          icon={Receipt}
          title="No transactions yet"
          description="Once you generate and submit a proof on-chain, your activity shows up here."
          action={
            <Link href="/prove">
              <Button>
                <ShieldCheck className="size-4" />
                Make your first proof
              </Button>
            </Link>
          }
        />
      ) : (
        <TransactionsTable
          rows={rows}
          solUsd={solUsd}
          onSelect={setSelected}
          onReachEnd={() => query.fetchNextPage()}
          hasMore={!!query.hasNextPage}
          fetchingMore={query.isFetchingNextPage}
        />
      )}

      <TransactionDrawer signature={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
