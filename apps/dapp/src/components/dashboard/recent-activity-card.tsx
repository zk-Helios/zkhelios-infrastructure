"use client";

import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { Card, CardTitle } from "@zkhelios/ui";
import { TransactionSignatureDisplay } from "@/components/ui/transaction-signature-display";
import { TypeBadge } from "@/components/transactions/type-badge";
import { StatusDot } from "@/components/transactions/status-badge";
import { useRecentActivity } from "@/hooks/use-dashboard";
import { timeAgo } from "@/lib/format";

/** Last 5 transactions, linking to the full history. */
export function RecentActivityCard() {
  const { data, isLoading } = useRecentActivity(5);

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-h6">Recent activity</CardTitle>
        <Activity className="size-4 text-amber-400" />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton h-10 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-400">
          {data?.map((tx) => (
            <li key={tx.signature} className="flex items-center justify-between gap-3 py-2.5">
              <span className="flex min-w-0 items-center gap-3">
                <StatusDot status={tx.status} />
                <TransactionSignatureDisplay signature={tx.signature} chars={4} className="text-caption" />
              </span>
              <span className="flex shrink-0 items-center gap-3">
                <TypeBadge type={tx.type} />
                <span className="hidden font-mono text-[0.7rem] text-paper-faint sm:inline">{timeAgo(tx.blockTime)}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/transactions"
        className="inline-flex items-center gap-1.5 text-caption font-medium text-amber-400 hover:text-amber-300"
      >
        View all transactions <ArrowRight className="size-3.5" />
      </Link>
    </Card>
  );
}
