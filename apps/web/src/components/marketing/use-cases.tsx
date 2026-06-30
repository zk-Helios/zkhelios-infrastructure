import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/section";
import { Card } from "@/components/ui/card";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { USE_CASES } from "@/lib/constants";

export function UseCases() {
  return (
    <Section id="use-cases" className="border-t border-ink-400">
      <SectionHeading
        eyebrow="Use cases"
        title="One primitive, many private apps"
        description="Anywhere you need to prove a fact without exposing the data behind it — zkHelios is the verification layer."
      />

      <RevealGroup className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map((uc, i) => (
          <RevealItem
            key={uc.title}
            // Make the first card span two columns on large screens for rhythm.
            className={i === 0 ? "lg:col-span-2" : ""}
          >
            <Card variant="glow" padding="lg" className="group flex h-full items-start gap-5">
              <span className="grid size-14 shrink-0 place-items-center rounded-lg border border-ink-400 bg-background">
                <Image
                  src={uc.asset}
                  alt=""
                  width={36}
                  height={36}
                  className="opacity-80 transition-opacity duration-300 group-hover:opacity-100"
                />
              </span>
              <div>
                <h3 className="font-display text-h6 font-semibold text-paper">{uc.title}</h3>
                <p className="mt-2 text-body text-paper-muted">{uc.description}</p>
              </div>
            </Card>
          </RevealItem>
        ))}
      </RevealGroup>
    </Section>
  );
}
