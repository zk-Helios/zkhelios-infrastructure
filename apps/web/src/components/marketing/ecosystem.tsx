import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { ECOSYSTEM } from "@/lib/constants";

export function Ecosystem() {
  return (
    <Section id="ecosystem" className="border-t border-ink-400">
      <SectionHeading
        eyebrow="Ecosystem"
        title="A constellation of private apps"
        description="From DEXes to confidential AI — builders are launching on zkHelios across every vertical."
      />

      <RevealGroup className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {ECOSYSTEM.map((project) => (
          <RevealItem key={project.name}>
            <div className="group flex h-full items-center gap-4 rounded-lg border border-ink-400 bg-ink-800 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/40 hover:ring-amber-glow">
              <span className="grid size-12 shrink-0 place-items-center rounded-md border border-ink-400 bg-background">
                <Image
                  src={project.asset}
                  alt=""
                  width={32}
                  height={32}
                  className="opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                />
              </span>
              <div className="min-w-0">
                <div className="truncate font-display text-h6 font-semibold text-paper">
                  {project.name}
                </div>
                <div className="truncate font-mono text-caption uppercase tracking-wider text-paper-faint">
                  {project.category}
                </div>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
