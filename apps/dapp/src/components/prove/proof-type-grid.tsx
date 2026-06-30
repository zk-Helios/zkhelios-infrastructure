"use client";

import { ArrowRight } from "lucide-react";
import { Card } from "@zkhelios/ui";
import { PROOF_TYPES } from "@/lib/zk/circuits";
import type { ProofKind } from "@/types";

export function ProofTypeGrid({ onSelect }: { onSelect: (kind: ProofKind) => void }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {PROOF_TYPES.map((t) => (
        <button key={t.kind} onClick={() => onSelect(t.kind)} className="text-left">
          <Card variant="glow" padding="lg" className="group flex h-full flex-col">
            <span className="mb-4 grid size-12 place-items-center rounded-md border border-amber-500/30 bg-amber-500/[0.08] text-amber-400">
              <t.icon className="size-5" />
            </span>
            <h3 className="font-display text-h6 font-semibold text-paper">{t.label}</h3>
            <p className="mt-0.5 text-caption font-medium text-amber-400/80">{t.tagline}</p>
            <p className="mt-2 flex-1 text-caption text-paper-muted">{t.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-caption font-medium text-amber-400">
              Configure <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Card>
        </button>
      ))}
    </div>
  );
}
