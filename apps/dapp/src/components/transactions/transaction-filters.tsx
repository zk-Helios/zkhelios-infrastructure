"use client";

import { Search, X } from "lucide-react";
import type { TransactionFilters, TxType, TxStatus } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  filters: TransactionFilters;
  onChange: (next: TransactionFilters) => void;
}

const TYPES: { value: TxType | "all"; label: string }[] = [
  { value: "all", label: "All types" },
  { value: "transfer", label: "Transfer" },
  { value: "proof", label: "Proof" },
  { value: "program-call", label: "Program" },
];

const STATUSES: { value: TxStatus | "all"; label: string }[] = [
  { value: "all", label: "All status" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

const selectCls =
  "rounded-md border border-ink-400 bg-ink-900 px-3 py-2 text-caption text-paper outline-none focus:border-amber-500/50";

export function TransactionFiltersBar({ filters, onChange }: Props) {
  const set = (patch: Partial<TransactionFilters>) => onChange({ ...filters, ...patch });
  const active = filters.search || (filters.type && filters.type !== "all") || (filters.status && filters.status !== "all") || filters.fromDate || filters.toDate;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-0 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper-faint" />
        <input
          value={filters.search ?? ""}
          onChange={(e) => set({ search: e.target.value })}
          placeholder="Search signature or address…"
          className="w-full rounded-md border border-ink-400 bg-ink-900 py-2 pl-9 pr-3 font-mono text-caption text-paper outline-none placeholder:text-ink-300 focus:border-amber-500/50"
          aria-label="Search transactions"
        />
      </div>

      <select
        value={filters.type ?? "all"}
        onChange={(e) => set({ type: e.target.value as TxType | "all" })}
        className={selectCls}
        aria-label="Filter by type"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      <select
        value={filters.status ?? "all"}
        onChange={(e) => set({ status: e.target.value as TxStatus | "all" })}
        className={selectCls}
        aria-label="Filter by status"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={filters.fromDate ?? ""}
        onChange={(e) => set({ fromDate: e.target.value || undefined })}
        className={cn(selectCls, "text-paper-muted")}
        aria-label="From date"
      />
      <input
        type="date"
        value={filters.toDate ?? ""}
        onChange={(e) => set({ toDate: e.target.value || undefined })}
        className={cn(selectCls, "text-paper-muted")}
        aria-label="To date"
      />

      {active && (
        <button
          onClick={() => onChange({})}
          className="inline-flex items-center gap-1.5 rounded-md border border-ink-400 px-3 py-2 text-caption text-paper-muted transition-colors hover:border-amber-500/40 hover:text-paper"
        >
          <X className="size-3.5" /> Clear
        </button>
      )}
    </div>
  );
}
