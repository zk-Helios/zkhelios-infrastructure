import { Check, Loader, Circle } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { ROADMAP } from "@/lib/constants";
import { cn } from "@/lib/utils";

const STATUS_META = {
  shipped: { label: "Shipped", Icon: Check, cls: "border-status-online/40 bg-status-online/10 text-status-online" },
  active: { label: "In progress", Icon: Loader, cls: "border-amber-500/50 bg-amber-500/10 text-amber-400" },
  planned: { label: "Planned", Icon: Circle, cls: "border-ink-400 bg-ink-700 text-paper-faint" },
} as const;

export function Roadmap() {
  return (
    <Section className="border-t border-ink-400">
      <SectionHeading
        eyebrow="Roadmap"
        title="From Genesis to Eclipse"
        description="A four-phase journey to a fully decentralized, privacy-first settlement layer."
      />

      <RevealGroup className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {ROADMAP.map((phase) => {
          const meta = STATUS_META[phase.status as keyof typeof STATUS_META];
          return (
            <RevealItem key={phase.phase}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-lg border bg-ink-800 p-6 transition-colors duration-300",
                  phase.status === "active"
                    ? "border-amber-500/40 ring-amber-glow"
                    : "border-ink-400",
                )}
              >
                <div className="mb-4 flex items-center justify-between">
                  <span className="font-mono text-caption uppercase tracking-[0.18em] text-paper-faint">
                    {phase.quarter}
                  </span>
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-medium",
                      meta.cls,
                    )}
                  >
                    <meta.Icon className={cn("size-3", phase.status === "active" && "animate-spin-slow")} />
                    {meta.label}
                  </span>
                </div>
                <h3 className="font-display text-h4 font-bold text-paper">{phase.phase}</h3>
                <p className="mt-1 text-body text-paper-muted">{phase.title}</p>
                <ul className="mt-5 space-y-2 border-t border-ink-400 pt-5">
                  {phase.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-caption text-paper-muted">
                      <span className="size-1 rounded-full bg-amber-500" />
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
