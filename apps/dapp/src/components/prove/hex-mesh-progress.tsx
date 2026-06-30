"use client";

import { motion } from "framer-motion";
import type { ProofStage } from "@/lib/zk/types";
import { cn } from "@/lib/utils";

const STAGE_ORDER: ProofStage[] = ["witness", "setup", "prove", "verify", "format", "done"];

/** Hexagon mesh that lights up segment-by-segment as proof stages complete. */
export function HexMeshProgress({ stage, pct }: { stage: ProofStage; pct: number }) {
  const reached = STAGE_ORDER.indexOf(stage);
  // 7 hexes arranged as a flower; light them progressively with pct.
  const hexes = [
    { x: 90, y: 50 },
    { x: 140, y: 78 },
    { x: 140, y: 134 },
    { x: 90, y: 162 },
    { x: 40, y: 134 },
    { x: 40, y: 78 },
    { x: 90, y: 106 }, // center
  ];
  const litCount = Math.round((pct / 100) * hexes.length);

  const hexPath = (cx: number, cy: number, r = 26) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${cx + r * Math.cos(a)},${cy + r * Math.sin(a)}`;
    });
    return `M${pts.join("L")}Z`;
  };

  return (
    <svg viewBox="0 0 180 212" className="mx-auto h-48 w-48">
      {hexes.map((h, i) => {
        const lit = i < litCount;
        return (
          <motion.path
            key={i}
            d={hexPath(h.x, h.y)}
            fill={lit ? "rgba(245,165,36,0.14)" : "transparent"}
            stroke={lit ? "#F5A524" : "#2A2A2A"}
            strokeWidth={1.5}
            initial={false}
            animate={{
              stroke: lit ? "#F5A524" : "#2A2A2A",
              fill: lit ? "rgba(245,165,36,0.14)" : "rgba(0,0,0,0)",
              filter: lit ? "drop-shadow(0 0 6px rgba(245,165,36,0.5))" : "none",
            }}
            transition={{ duration: 0.4 }}
          />
        );
      })}
      <text
        x="90"
        y="110"
        textAnchor="middle"
        className={cn("font-mono text-[10px]", reached >= 0 ? "fill-amber-300" : "fill-paper-faint")}
      >
        {pct}%
      </text>
    </svg>
  );
}
