"use client";

import { motion } from "framer-motion";
import { Cpu, Lock, GitBranch, Gauge } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/section";
import { Reveal } from "@/components/shared/reveal";

const SPECS = [
  {
    icon: Lock,
    title: "Groth16 SNARKs",
    body: "Succinct ~256-byte proofs over the BN254 curve — the smallest, cheapest proofs to verify on Solana.",
  },
  {
    icon: Cpu,
    title: "~200k CU verification",
    body: "Verified on-chain via Solana's alt_bn128 syscalls in roughly 200k compute units — well under the per-tx cap.",
  },
  {
    icon: Gauge,
    title: "Sub-second client proofs",
    body: "snarkjs generates proofs in your browser (or a Web Worker) in seconds — no trusted server in the loop.",
  },
  {
    icon: GitBranch,
    title: "Composable via CPI",
    body: "Any Anchor program can verify zkHelios proofs through cross-program invocation — privacy as a primitive.",
  },
];

/** Animated hexagonal mesh that lights up node-by-node. */
function HexMesh() {
  const nodes = [
    { x: 50, y: 30 },
    { x: 130, y: 30 },
    { x: 90, y: 80 },
    { x: 170, y: 80 },
    { x: 30, y: 95 },
    { x: 50, y: 145 },
    { x: 130, y: 145 },
    { x: 200, y: 130 },
    { x: 95, y: 195 },
    { x: 165, y: 190 },
  ];
  const edges = [
    [0, 1],
    [0, 2],
    [1, 2],
    [1, 3],
    [2, 3],
    [0, 4],
    [4, 5],
    [2, 5],
    [2, 6],
    [5, 6],
    [3, 7],
    [6, 7],
    [5, 8],
    [6, 8],
    [6, 9],
    [8, 9],
    [7, 9],
  ];

  return (
    <svg viewBox="0 0 230 230" className="h-full w-full">
      {edges.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke="rgba(245,165,36,0.45)"
          strokeWidth="1"
          initial={{ pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 + i * 0.05, ease: "easeOut" }}
        />
      ))}
      {nodes.map((n, i) => (
        <motion.g
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
        >
          <circle cx={n.x} cy={n.y} r="9" fill="rgba(245,165,36,0.12)" />
          <motion.circle
            cx={n.x}
            cy={n.y}
            r="3.5"
            fill="#F5A524"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.2 }}
          />
        </motion.g>
      ))}
    </svg>
  );
}

export function Technology() {
  return (
    <Section id="technology" className="border-t border-ink-400">
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Technology"
            title="Groth16, verified at Solana speed"
            description="zkHelios pairs client-side Groth16 proving with on-chain verification through Solana's alt_bn128 syscalls — validity is public, everything else stays yours."
          />
          <div className="mt-10 grid gap-x-8 gap-y-7 sm:grid-cols-2">
            {SPECS.map((spec, i) => (
              <Reveal key={spec.title} delay={i * 0.05} className="flex gap-4">
                <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-md border border-amber-500/30 bg-amber-500/[0.08] text-amber-400">
                  <spec.icon className="size-4" />
                </span>
                <div>
                  <h4 className="font-display text-h6 font-semibold text-paper">{spec.title}</h4>
                  <p className="mt-1 text-body text-paper-muted">{spec.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <Reveal className="relative">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-ink-400 bg-ink-800">
            <div
              className="absolute inset-0 bg-cover bg-center opacity-40"
              style={{ backgroundImage: "url(/assets/network-topology.png)" }}
              aria-hidden
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-background via-transparent to-transparent" />
            <div className="absolute inset-0 p-8">
              <HexMesh />
            </div>
            <div className="absolute bottom-4 left-4 rounded-md border border-ink-400 bg-background/80 px-3 py-2 backdrop-blur">
              <span className="font-mono text-caption text-amber-300">prover.mesh//active</span>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
