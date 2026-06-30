import Image from "next/image";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/shared/reveal";
import { TOKENOMICS } from "@/lib/constants";

export function Tokenomics() {
  return (
    <Section id="tokenomics" className="border-t border-ink-400">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <Reveal className="order-2 lg:order-1">
          <SectionHeading
            align="left"
            eyebrow="Token"
            title="Built to reward provers"
            description={
              <>
                <span className="font-mono text-amber-300">{TOKENOMICS.totalSupply} {TOKENOMICS.symbol}</span> total
                supply, weighted toward the people who do the work — the prover network.
              </>
            }
          />
          <ul className="mt-8 flex flex-col gap-4">
            {TOKENOMICS.allocations.map((a) => (
              <li key={a.label}>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2.5">
                    <span className="size-3 rounded-sm" style={{ backgroundColor: a.color }} />
                    <span className="font-display text-h6 font-semibold text-paper">{a.label}</span>
                  </span>
                  <span className="font-mono text-h6 font-bold text-paper">{a.pct}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-ink-700">
                  <div className="h-full rounded-full" style={{ width: `${a.pct}%`, backgroundColor: a.color }} />
                </div>
                <p className="mt-1.5 text-caption text-paper-muted">{a.note}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="order-1 flex justify-center lg:order-2">
          <div className="relative aspect-square w-full max-w-md">
            <div className="absolute inset-0 bg-amber-radial" aria-hidden />
            <Image
              src={TOKENOMICS.asset}
              alt={`${TOKENOMICS.symbol} token distribution: 70% prover rewards, 20% foundation, 10% liquidity`}
              width={560}
              height={560}
              className="relative drop-shadow-[0_0_48px_rgba(245,165,36,0.25)]"
            />
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
