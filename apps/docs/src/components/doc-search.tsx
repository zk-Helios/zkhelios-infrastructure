"use client";

import { useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { FLAT } from "@/lib/nav";

/** Lightweight client-side title search over the docs nav. */
export function DocSearch() {
  const [q, setQ] = useState("");
  const matches = q.trim() ? FLAT.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())) : [];

  return (
    <div className="relative mb-6">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper-faint" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search docs…"
        className="w-full rounded-md border border-ink-400 bg-ink-900 py-2 pl-9 pr-3 text-caption text-paper outline-none placeholder:text-ink-300 focus:border-amber-500/50"
        aria-label="Search documentation"
      />
      {matches.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-ink-400 bg-ink-800 p-1 shadow-card">
          {matches.slice(0, 6).map((m) => (
            <li key={m.href}>
              <Link href={m.href} onClick={() => setQ("")} className="block rounded px-3 py-1.5 text-caption text-paper-muted hover:bg-white/[0.05] hover:text-paper">
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
