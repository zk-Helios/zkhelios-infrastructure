"use client";

import { useState } from "react";
import { History, Trash2, RotateCcw } from "lucide-react";
import { getProofType } from "@/lib/zk/circuits";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { StoredProof } from "@/lib/zk/types";
import type { ProofKind } from "@/types";

const STATUS_CLS: Record<StoredProof["status"], string> = {
  completed: "text-paper-muted",
  submitted: "text-status-online",
  failed: "text-status-error",
};

export function ProofHistorySidebar({
  proofs,
  loading,
  onReuse,
  onRemove,
}: {
  proofs: StoredProof[];
  loading: boolean;
  onReuse: (kind: ProofKind) => void;
  onRemove: (id: string) => void;
}) {
  const [filter, setFilter] = useState<ProofKind | "all">("all");
  const filtered = filter === "all" ? proofs : proofs.filter((p) => p.kind === filter);

  return (
    <aside className="rounded-lg border border-ink-400 bg-ink-900 p-4">
      <div className="mb-3 flex items-center gap-2">
        <History className="size-4 text-amber-400" />
        <h3 className="font-display text-h6 font-semibold text-paper">Proof history</h3>
      </div>

      <select
        value={filter}
        onChange={(e) => setFilter(e.target.value as ProofKind | "all")}
        className="mb-3 w-full rounded-md border border-ink-400 bg-ink-800 px-2.5 py-1.5 text-caption text-paper outline-none focus:border-amber-500/50"
        aria-label="Filter proof history"
      >
        <option value="all">All types</option>
        {(["balance", "ownership", "age", "membership", "custom"] as ProofKind[]).map((k) => (
          <option key={k} value={k}>
            {getProofType(k).label}
          </option>
        ))}
      </select>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-md" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="py-6 text-center text-caption text-paper-faint">No proofs yet.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((p) => {
            const def = getProofType(p.kind);
            return (
              <li key={p.id} className="group rounded-md border border-ink-400 bg-ink-800 p-2.5">
                <div className="flex items-center gap-2">
                  <def.icon className="size-4 text-amber-400" />
                  <span className="flex-1 truncate text-caption font-medium text-paper">{def.label}</span>
                  <span className={cn("font-mono text-[0.65rem]", STATUS_CLS[p.status])}>{p.status}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between">
                  <span className="font-mono text-[0.65rem] text-paper-faint">{timeAgo(p.createdAt)}</span>
                  <span className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button onClick={() => onReuse(p.kind)} aria-label="Reuse" className="grid size-6 place-items-center rounded text-paper-faint hover:text-amber-400">
                      <RotateCcw className="size-3.5" />
                    </button>
                    <button onClick={() => onRemove(p.id)} aria-label="Delete" className="grid size-6 place-items-center rounded text-paper-faint hover:text-status-error">
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );
}
