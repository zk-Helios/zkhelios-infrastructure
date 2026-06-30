import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all duration-200 ease-out focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-amber-500 text-ink-900 shadow-glow-sm hover:bg-amber-400 hover:shadow-glow active:scale-[0.98]",
        ghost: "text-paper hover:bg-white/[0.06] active:bg-white/[0.1]",
        outline:
          "border border-ink-400 bg-transparent text-paper hover:border-amber-500/60 hover:text-amber-200 hover:shadow-glow-sm",
        link: "text-amber-400 underline-offset-4 hover:text-amber-300 hover:underline",
        danger:
          "border border-status-error/40 bg-status-error/10 text-status-error hover:bg-status-error/20",
      },
      size: {
        sm: "h-9 px-4 text-caption",
        md: "h-11 px-6 text-[0.95rem]",
        lg: "h-14 px-8 text-base",
        icon: "size-11",
        "icon-sm": "size-9",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />
  ),
);
Button.displayName = "Button";
