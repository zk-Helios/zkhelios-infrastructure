import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

/** Centered placeholder for empty lists/tables, with an optional CTA. */
export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-ink-400 bg-ink-800/40 px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-5 grid size-14 place-items-center rounded-full border border-ink-400 bg-ink-800 text-amber-400">
          <Icon className="size-6" />
        </span>
      )}
      <h3 className="font-display text-h6 font-semibold text-paper">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-body text-paper-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
