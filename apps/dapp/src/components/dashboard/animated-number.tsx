"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  value: number;
  format?: (n: number) => string;
  /** Brief amber pulse when the value changes (for realtime updates). */
  pulse?: boolean;
  className?: string;
}

/** Counts to `value` and optionally flashes when it updates. */
export function AnimatedNumber({ value, format, pulse = false, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(0);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const controls = animate(prev.current, value, {
      duration: 0.7,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        if (ref.current) ref.current.textContent = format ? format(latest) : Math.round(latest).toLocaleString("en-US");
      },
    });
    if (pulse && prev.current !== value) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 600);
      prev.current = value;
      return () => {
        controls.stop();
        clearTimeout(t);
      };
    }
    prev.current = value;
    return () => controls.stop();
  }, [value, format, pulse]);

  return (
    <span ref={ref} className={cn("tabular-nums transition-colors duration-500", flash && "text-amber-300", className)}>
      0
    </span>
  );
}
