"use client";

import { useEffect, useRef } from "react";

/**
 * Desktop custom cursor: a solid amber dot trailing a ring. The ring grows and
 * the dot warms when hovering interactive elements. Disabled on touch devices
 * and when the pointer is coarse.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;

    document.documentElement.classList.add("has-custom-cursor");
    const dot = dotRef.current!;
    const ring = ringRef.current!;
    let mouseX = 0,
      mouseY = 0,
      ringX = 0,
      ringY = 0,
      raf = 0;

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`;
    };

    const lerp = () => {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.transform = `translate3d(${ringX - 16}px, ${ringY - 16}px, 0)`;
      raf = requestAnimationFrame(lerp);
    };

    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      const interactive = t.closest("a, button, [role='button'], input, [data-cursor='hover']");
      ring.dataset.active = interactive ? "true" : "false";
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseover", onOver, { passive: true });
    raf = requestAnimationFrame(lerp);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onOver);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden size-1.5 rounded-full bg-amber-400 md:block"
        aria-hidden
      />
      <div
        ref={ringRef}
        data-active="false"
        className="pointer-events-none fixed left-0 top-0 z-[100] hidden size-8 rounded-full border border-amber-400/70 transition-[width,height,background-color,opacity] duration-200 ease-out data-[active=true]:bg-amber-400/10 data-[active=true]:opacity-100 md:block"
        aria-hidden
      />
    </>
  );
}
