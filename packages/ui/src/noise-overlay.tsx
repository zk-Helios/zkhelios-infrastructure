import { cn } from "./cn";

interface NoiseOverlayProps {
  /** 0–1 opacity. Brand spec: 4–6%. */
  opacity?: number;
  className?: string;
}

/** Fixed full-viewport SVG film grain to break up flat black surfaces. */
export function NoiseOverlay({ opacity = 0.05, className }: NoiseOverlayProps) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none fixed inset-0 z-[60] mix-blend-soft-light", className)}
      style={{ opacity }}
    >
      <svg className="h-full w-full">
        <filter id="zk-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#zk-noise)" />
      </svg>
    </div>
  );
}
