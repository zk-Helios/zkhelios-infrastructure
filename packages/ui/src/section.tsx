import * as React from "react";
import { cn } from "./cn";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "footer";
  flush?: boolean;
}

/** Consistent max-width + padding wrapper for sections. */
export function Section({ className, as = "section", flush, children, ...props }: SectionProps) {
  const Tag = as;
  return (
    <Tag className={cn("relative w-full", !flush && "py-20 md:py-28", className)} {...props}>
      <div className="mx-auto w-full max-w-section px-5 sm:px-8 lg:px-10">{children}</div>
    </Tag>
  );
}

interface SectionHeadingProps {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "mx-auto max-w-2xl text-center",
        className,
      )}
    >
      {eyebrow && (
        <span
          className={cn(
            "inline-flex items-center gap-2 font-mono text-caption uppercase tracking-[0.2em] text-amber-400",
            align === "center" && "justify-center",
          )}
        >
          <span className="h-px w-6 bg-amber-500/60" aria-hidden />
          {eyebrow}
        </span>
      )}
      <h2 className="font-display text-h3 font-semibold text-paper md:text-h2">{title}</h2>
      {description && <p className="text-lead text-paper-muted [text-wrap:balance]">{description}</p>}
    </div>
  );
}
