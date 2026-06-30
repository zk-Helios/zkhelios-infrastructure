import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

export const cardVariants = cva("relative rounded-lg transition-all duration-300 ease-out", {
  variants: {
    variant: {
      bordered: "border border-ink-400 bg-ink-800",
      glass: "glass",
      glow: "border border-ink-400 bg-ink-800 hover:-translate-y-1 hover:border-amber-500/40 hover:ring-amber-glow",
    },
    padding: {
      none: "",
      sm: "p-5",
      md: "p-7",
      lg: "p-9",
    },
  },
  defaultVariants: { variant: "bordered", padding: "md" },
});

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ variant, padding }), className)} {...props} />
  ),
);
Card.displayName = "Card";

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("font-display text-h5 font-semibold text-paper", className)} {...props} />
);

export const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("mt-2 text-body text-paper-muted", className)} {...props} />
);
