"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";
import { formatCompact } from "@/lib/utils";

interface CountUpProps {
  value: number;
  /** "compact" → 84.2M, "decimal" → 1.8, "int" → 1,240 */
  format?: "compact" | "decimal" | "int";
  suffix?: string;
  className?: string;
  duration?: number;
}

/** Animates a number from 0 → value when scrolled into view. */
export function CountUp({
  value,
  format = "int",
  suffix = "",
  className,
  duration = 1.8,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        const el = ref.current;
        if (!el) return;
        if (format === "compact") el.textContent = formatCompact(latest);
        else if (format === "decimal") el.textContent = latest.toFixed(1);
        else el.textContent = Math.round(latest).toLocaleString("en-US");
      },
    });
    return () => controls.stop();
  }, [inView, value, format, duration, mv]);

  return (
    <span className={className}>
      <span ref={ref}>0</span>
      {suffix}
    </span>
  );
}
