import * as React from "react";
import { cn } from "./cn";

interface LogoProps {
  size?: number;
  glow?: boolean;
  animated?: boolean;
  className?: string;
  title?: string;
}

/**
 * zkHelios logo — 8-ray solar mark with a hexagonal "zk" cutout.
 * Pure SVG so it scales crisply and can animate its rays independently.
 */
export function LogoMark({
  size = 40,
  glow = false,
  animated = false,
  className,
  title = "zkHelios",
}: LogoProps) {
  const rays = Array.from({ length: 8 });
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={title}
      className={cn(glow && "drop-shadow-[0_0_16px_rgba(245,165,36,0.55)]", className)}
    >
      <g
        className={cn("origin-center", animated && "motion-safe:animate-spin-slow")}
        fill="currentColor"
      >
        {rays.map((_, i) => (
          <rect
            key={i}
            x="46.5"
            y="2"
            width="7"
            height="26"
            rx="2"
            transform={`rotate(${i * 45} 50 50)`}
          />
        ))}
      </g>
      <circle cx="50" cy="50" r="26" fill="currentColor" />
      <path
        d="M50 33 L64 41 L64 59 L50 67 L36 59 L36 41 Z"
        fill="none"
        stroke="#0A0A0A"
        strokeWidth="3.5"
      />
      <text
        x="50"
        y="56"
        textAnchor="middle"
        fontFamily="var(--font-jetbrains-mono), monospace"
        fontWeight="700"
        fontSize="17"
        fill="#0A0A0A"
        fontStyle="italic"
      >
        zk
      </text>
    </svg>
  );
}

/** Full lockup: mark + wordmark ("zk" white, "Helios" amber). */
export function Logo({ size = 32, animated = false, glow = false, className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark size={size} animated={animated} glow={glow} className="text-amber-500" />
      <span className="font-display font-bold tracking-tight" style={{ fontSize: size * 0.62 }}>
        <span className="text-paper">zk</span>
        <span className="text-amber-500">Helios</span>
      </span>
    </span>
  );
}
