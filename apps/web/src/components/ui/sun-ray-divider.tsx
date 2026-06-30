import { cn } from "@/lib/utils";

interface SunRayDividerProps {
  className?: string;
}

/** Animated radial sun-ray divider used between sections. */
export function SunRayDivider({ className }: SunRayDividerProps) {
  const rays = Array.from({ length: 16 });
  return (
    <div className={cn("relative flex items-center justify-center py-4", className)} aria-hidden>
      <div className="absolute h-px w-full bg-gradient-to-r from-transparent via-ink-400 to-transparent" />
      <div className="relative grid size-10 place-items-center rounded-full border border-ink-400 bg-background">
        <svg viewBox="0 0 100 100" className="size-7 text-amber-500 motion-safe:animate-spin-slow">
          <g fill="currentColor">
            {rays.map((_, i) => (
              <rect
                key={i}
                x="48"
                y="6"
                width="4"
                height="14"
                rx="2"
                transform={`rotate(${i * 22.5} 50 50)`}
                opacity={i % 2 === 0 ? 1 : 0.4}
              />
            ))}
          </g>
          <circle cx="50" cy="50" r="9" fill="currentColor" />
        </svg>
      </div>
    </div>
  );
}
