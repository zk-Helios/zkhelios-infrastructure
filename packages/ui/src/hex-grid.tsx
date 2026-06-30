import { cn } from "./cn";

interface HexGridProps {
  opacity?: number;
  className?: string;
}

/** Subtle tiling hexagon pattern echoing the zk hexagon motif. */
export function HexGrid({ opacity = 0.4, className }: HexGridProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      style={{ opacity }}
    >
      <svg className="h-full w-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="zk-hex" width="56" height="48" patternUnits="userSpaceOnUse">
            <path
              d="M14 0 L42 0 L56 24 L42 48 L14 48 L0 24 Z"
              fill="none"
              stroke="rgba(245,165,36,0.18)"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#zk-hex)" />
      </svg>
    </div>
  );
}
