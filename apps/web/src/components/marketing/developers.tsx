"use client";

import { useState } from "react";
import Link from "next/link";
import { Terminal, ArrowUpRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/shared/reveal";
import { cn } from "@/lib/utils";

const TABS = [
  {
    name: "prove.ts",
    code: [
      `import { ZkHelios } from "@zkhelios/sdk";`,
      ``,
      `const zk = new ZkHelios({ cluster: "mainnet-beta", wallet });`,
      ``,
      `// Prove you hold ≥ 100 SOL — without revealing the balance`,
      `const proof = await zk.proveBalance({ min: 100 });`,
      ``,
      `// Verify on-chain via the Anchor program (~200k CU)`,
      `const { signature, proofAccount } = await zk.submitProof(proof);`,
      ``,
      `console.log("verified ✓", signature);`,
    ],
  },
  {
    name: "verify.ts",
    code: [
      `import { ZkHelios } from "@zkhelios/sdk";`,
      ``,
      `const zk = new ZkHelios({ cluster: "mainnet-beta" });`,
      ``,
      `// Fetch + verify any proof account on Solana`,
      `const proof = await zk.getProof(proofAccount);`,
      ``,
      `const ok = await zk.verify(proof); // in-browser re-check`,
      `console.log(proof.verified, ok); // true true`,
    ],
  },
  {
    name: "membership.ts",
    code: [
      `import { ZkHelios } from "@zkhelios/sdk";`,
      ``,
      `const zk = new ZkHelios({ cluster: "devnet", wallet });`,
      ``,
      `// Prove inclusion in a Merkle whitelist — reveal nothing`,
      `const proof = await zk.proveMembership({`,
      `  leaf: wallet.publicKey,`,
      `  root: allowlistRoot,`,
      `});`,
      ``,
      `await zk.submitProof(proof);`,
    ],
  },
];

export function Developers() {
  const [active, setActive] = useState(0);
  const tab = TABS[active];

  return (
    <Section id="developers" className="border-t border-ink-400">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Developers"
            title="Ship private apps in minutes"
            description="A typed TypeScript SDK over the Anchor IDL, a circuit library, and Wallet Adapter integration — the cryptography is handled for you. Install, prove, verify."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/docs">
              <Button>
                <Terminal />
                Read the Quickstart
              </Button>
            </Link>
            <Link href="/docs/sdk">
              <Button variant="outline" className="group">
                SDK Reference
                <ArrowUpRight className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 inline-flex items-center gap-3 rounded-md border border-ink-400 bg-ink-900 px-4 py-3 font-mono text-caption">
            <span className="text-amber-500">$</span>
            <span className="text-paper">pnpm add @zkhelios/sdk</span>
            <span className="ml-2 size-2 animate-pulse rounded-full bg-status-online" />
          </div>
        </div>

        <Reveal>
          <div className="overflow-hidden rounded-xl border border-ink-400 bg-ink-900 shadow-card">
            {/* Window chrome */}
            <div className="flex items-center gap-2 border-b border-ink-400 bg-ink-800 px-4 py-3">
              <span className="size-3 rounded-full bg-status-error/70" />
              <span className="size-3 rounded-full bg-status-warning/70" />
              <span className="size-3 rounded-full bg-status-online/70" />
              <div className="ml-3 flex gap-1">
                {TABS.map((t, i) => (
                  <button
                    key={t.name}
                    onClick={() => setActive(i)}
                    className={cn(
                      "rounded-md px-3 py-1 font-mono text-caption transition-colors duration-200",
                      i === active
                        ? "bg-ink-900 text-amber-300"
                        : "text-paper-faint hover:text-paper-muted",
                    )}
                  >
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
            {/* Code */}
            <pre className="overflow-x-auto p-5 text-[0.82rem] leading-6">
              <code className="font-mono">
                {tab.code.map((line, i) => (
                  <div key={i} className="grid grid-cols-[2rem_1fr] gap-2">
                    <span className="select-none text-right text-ink-300">{i + 1}</span>
                    <span className="text-paper-muted">{highlight(line)}</span>
                  </div>
                ))}
              </code>
            </pre>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}

/** Tiny token highlighter — enough for a believable editor mockup. */
function highlight(line: string) {
  if (!line.trim()) return " ";
  if (line.trim().startsWith("//")) return <span className="text-ink-300">{line}</span>;
  const parts = line.split(/(\b(?:import|const|await|from|template|signal|input|output|pragma|component)\b|"[^"]*"|`[^`]*`|✦|✓)/g);
  return parts.map((p, i) => {
    if (/^(import|const|await|from|template|signal|input|output|pragma|component)$/.test(p))
      return (
        <span key={i} className="text-amber-400">
          {p}
        </span>
      );
    if (/^["`]/.test(p))
      return (
        <span key={i} className="text-status-online">
          {p}
        </span>
      );
    if (p === "✦" || p === "✓")
      return (
        <span key={i} className="text-amber-300">
          {p}
        </span>
      );
    return <span key={i}>{p}</span>;
  });
}
