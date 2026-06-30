import { ArrowLeftRight, ShieldCheck, Code2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TxType } from "@/types";

const META: Record<TxType, { label: string; Icon: typeof Code2; cls: string }> = {
  transfer: { label: "Transfer", Icon: ArrowLeftRight, cls: "text-[#60A5FA]" },
  proof: { label: "Proof", Icon: ShieldCheck, cls: "text-amber-400" },
  "program-call": { label: "Program", Icon: Code2, cls: "text-paper-muted" },
};

export function TypeBadge({ type, className }: { type: TxType; className?: string }) {
  const m = META[type];
  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-caption", m.cls, className)}>
      <m.Icon className="size-3.5" />
      {m.label}
    </span>
  );
}
