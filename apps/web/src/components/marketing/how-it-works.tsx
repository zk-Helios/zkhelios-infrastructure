import { Section, SectionHeading } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/shared/reveal";
import { HOW_IT_WORKS } from "@/lib/constants";

export function HowItWorks() {
  return (
    <Section className="border-t border-ink-400">
      <SectionHeading
        eyebrow="How it works"
        title="Commit · Prove · Verify on-chain"
        description="Three stages — client-side commit, off-chain proving, on-chain verification — confidential at every step, final on Solana."
      />

      <RevealGroup className="relative mt-16">
        {/* Connecting line (desktop) */}
        <div
          className="absolute left-0 right-0 top-7 hidden h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent md:block"
          aria-hidden
        />
        <div className="grid gap-12 md:grid-cols-3 md:gap-8">
          {HOW_IT_WORKS.map((item) => (
            <RevealItem key={item.step} className="relative text-center md:text-left">
              <div className="mb-6 flex items-center justify-center md:justify-start">
                <span className="relative z-10 grid size-14 place-items-center rounded-full border border-amber-500/40 bg-background font-display text-h6 font-bold text-amber-400 shadow-glow-sm">
                  {item.step}
                </span>
              </div>
              <h3 className="font-display text-h5 font-semibold text-paper">{item.title}</h3>
              <p className="mt-3 text-body text-paper-muted">{item.description}</p>
            </RevealItem>
          ))}
        </div>
      </RevealGroup>
    </Section>
  );
}
