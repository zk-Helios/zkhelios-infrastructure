import { cn } from "@/lib/utils";
import type { ProofStatus } from "@/types";

const META: Record<ProofStatus, { label: string; cls: string }> = {
  verified: { label: "Verified", cls: "border-status-online/30 bg-status-online/10 text-status-online" },
  completed: { label: "Completed", cls: "border-[#60A5FA]/30 bg-[#60A5FA]/10 text-[#60A5FA]" },
  generating: { label: "Generating", cls: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  pending: { label: "Pending", cls: "border-amber-500/30 bg-amber-500/10 text-amber-400" },
  failed: { label: "Failed", cls: "border-status-error/30 bg-status-error/10 text-status-error" },
};

export function ProofStatusBadge({ status, className }: { status: ProofStatus; className?: string }) {
  const m = META[status];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-medium", m.cls, className)}>
      {m.label}
    </span>
  );
}
