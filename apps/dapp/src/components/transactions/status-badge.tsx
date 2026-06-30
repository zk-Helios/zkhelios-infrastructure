import { cn } from "@/lib/utils";
import type { TxStatus } from "@/types";

const META: Record<TxStatus, { label: string; dot: string; cls: string }> = {
  success: { label: "Success", dot: "bg-status-online", cls: "border-status-online/30 bg-status-online/10 text-status-online" },
  failed: { label: "Failed", dot: "bg-status-error", cls: "border-status-error/30 bg-status-error/10 text-status-error" },
};

export function StatusBadge({ status, className }: { status: TxStatus; className?: string }) {
  const m = META[status];
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.7rem] font-medium", m.cls, className)}>
      <span className={cn("size-1.5 rounded-full", m.dot)} />
      {m.label}
    </span>
  );
}

export function StatusDot({ status }: { status: TxStatus }) {
  return <span className={cn("size-2 shrink-0 rounded-full", META[status].dot)} aria-label={META[status].label} />;
}
