"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { FLAT } from "@/lib/nav";

/** Wraps doc content with a title/lead header and prev/next pager. */
export function DocPage({ title, lead, children }: { title: string; lead?: string; children: React.ReactNode }) {
  const pathname = usePathname();
  const idx = FLAT.findIndex((i) => i.href === pathname);
  const prev = idx > 0 ? FLAT[idx - 1] : null;
  const next = idx >= 0 && idx < FLAT.length - 1 ? FLAT[idx + 1] : null;

  return (
    <article className="prose-zk max-w-none">
      <h1 className="font-display text-h2 font-bold text-paper">{title}</h1>
      {lead && <p className="!mt-3 text-lead text-paper-muted">{lead}</p>}
      {children}

      <div className="mt-14 flex items-center justify-between gap-4 border-t border-ink-400 pt-6">
        {prev ? (
          <Link href={prev.href} className="group inline-flex items-center gap-2 text-caption text-paper-muted hover:text-amber-300">
            <ArrowLeft className="size-4" />
            <span>
              <span className="block text-[0.7rem] text-paper-faint">Previous</span>
              {prev.label}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link href={next.href} className="group inline-flex items-center gap-2 text-right text-caption text-paper-muted hover:text-amber-300">
            <span>
              <span className="block text-[0.7rem] text-paper-faint">Next</span>
              {next.label}
            </span>
            <ArrowRight className="size-4" />
          </Link>
        )}
      </div>
    </article>
  );
}
