import { Section } from "@/components/ui/section";
import { CountUp } from "@/components/shared/count-up";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { STATS } from "@/lib/constants";

export function StatsBar() {
  return (
    <Section flush className="border-y border-ink-400 bg-ink-800/40 py-10">
      <RevealGroup className="grid grid-cols-2 gap-8 md:grid-cols-4">
        {STATS.map((stat) => (
          <RevealItem key={stat.label} className="text-center">
            <div className="font-display text-h3 font-bold text-paper md:text-h2">
              {"prefix" in stat && stat.prefix ? stat.prefix : null}
              <CountUp
                value={stat.value}
                format={stat.format as "compact" | "decimal" | "int"}
                suffix={stat.suffix}
              />
            </div>
            <div className="mt-2 font-mono text-caption uppercase tracking-[0.12em] text-paper-faint">
              {stat.label}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
