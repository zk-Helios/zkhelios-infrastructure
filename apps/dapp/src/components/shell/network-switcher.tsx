"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { CLUSTER_LIST } from "@/lib/solana";
import { useClusterStore } from "@/stores/cluster-store";

/** Switches the active Solana cluster (localnet / devnet / mainnet-beta). */
export function NetworkSwitcher() {
  const cluster = useClusterStore((s) => s.cluster);
  const setCluster = useClusterStore((s) => s.setCluster);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const active = CLUSTER_LIST.find((c) => c.id === cluster)!;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-2 rounded-md border border-ink-400 bg-ink-800 px-2.5 py-2 text-caption text-paper transition-colors hover:border-amber-500/40"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="size-2.5 rounded-full" style={{ backgroundColor: active.color }} aria-hidden />
        <span className="hidden sm:inline">{active.name}</span>
        <ChevronDown className="size-3.5 text-paper-faint" />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-52 overflow-hidden rounded-lg border border-ink-400 bg-ink-800 p-1 shadow-card"
        >
          {CLUSTER_LIST.map((c) => {
            const selected = c.id === cluster;
            return (
              <li key={c.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setCluster(c.id);
                    setOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-3 py-2 text-caption transition-colors hover:bg-white/[0.05]",
                    selected ? "text-amber-300" : "text-paper",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  {selected && <Check className="size-3.5" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
