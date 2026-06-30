import Image from "next/image";
import { Zap, Shield, Boxes, type LucideIcon } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Card, CardTitle, CardDescription } from "@/components/ui/card";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { FEATURES } from "@/lib/constants";

const ICONS: Record<string, LucideIcon> = { zap: Zap, shield: Shield, boxes: Boxes };

export function Features() {
  return (
    <Section id="features">
      <SectionHeading
        eyebrow="Why zkHelios"
        title={
          <>
            Built for a private,
            <br className="hidden sm:block" /> verifiable future
          </>
        }
        description="Three pillars that make zkHelios the fastest path to confidential, settlement-grade applications."
      />

      <RevealGroup className="mt-14 grid gap-6 md:grid-cols-3">
        {FEATURES.map((feature) => {
          const Icon = ICONS[feature.icon];
          return (
            <RevealItem key={feature.title}>
              <Card variant="glow" padding="lg" className="group h-full overflow-hidden">
                <div className="mb-6 flex items-center justify-between">
                  <span className="grid size-12 place-items-center rounded-md border border-amber-500/30 bg-amber-500/[0.08] text-amber-400 transition-colors duration-300 group-hover:bg-amber-500/[0.14]">
                    {Icon && <Icon className="size-5" />}
                  </span>
                  <Image
                    src={feature.asset}
                    alt=""
                    width={72}
                    height={72}
                    className="opacity-70 transition-opacity duration-300 group-hover:opacity-100"
                  />
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </Card>
            </RevealItem>
          );
        })}
      </RevealGroup>
    </Section>
  );
}
