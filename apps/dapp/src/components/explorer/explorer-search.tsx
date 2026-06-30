"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { classifySearch } from "@/lib/api/mock";
import { cn } from "@/lib/utils";

export function ExplorerSearch({ large = false }: { large?: boolean }) {
  const [q, setQ] = useState("");
  const router = useRouter();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const r = classifySearch(q);
    switch (r.type) {
      case "tx":
        router.push(`/explorer/tx/${r.value}`);
        break;
      case "address":
        router.push(`/explorer/address/${r.value}`);
        break;
      case "proof":
        router.push(`/explorer/proof/${r.value}`);
        break;
      case "slot":
        toast.info(`Slot ${r.value} — block view lands with the indexer (Session 8).`);
        break;
      default:
        toast.error("Unrecognized query. Enter a signature, address, proof ID, or slot.");
    }
  };

  return (
    <form onSubmit={submit} className="relative">
      <Search className={cn("pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-paper-faint", large ? "size-5" : "size-4")} />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search signature, address, proof ID, or slot…"
        className={cn(
          "w-full rounded-lg border border-ink-400 bg-ink-900 font-mono text-paper outline-none placeholder:text-ink-300 focus:border-amber-500/50",
          large ? "py-4 pl-12 pr-4 text-body" : "py-2.5 pl-10 pr-3 text-caption",
        )}
        aria-label="Explorer search"
      />
    </form>
  );
}
