import { Info, AlertTriangle, OctagonAlert, Lightbulb } from "lucide-react";
import { cn } from "@zkhelios/ui";

type Variant = "info" | "warning" | "danger" | "tip";

const META: Record<Variant, { Icon: typeof Info; cls: string; icon: string }> = {
  info: { Icon: Info, cls: "border-[#60A5FA]/30 bg-[#60A5FA]/[0.06]", icon: "text-[#60A5FA]" },
  tip: { Icon: Lightbulb, cls: "border-amber-500/30 bg-amber-500/[0.06]", icon: "text-amber-400" },
  warning: { Icon: AlertTriangle, cls: "border-status-warning/30 bg-status-warning/[0.06]", icon: "text-status-warning" },
  danger: { Icon: OctagonAlert, cls: "border-status-error/30 bg-status-error/[0.06]", icon: "text-status-error" },
};

export function Callout({ variant = "info", children }: { variant?: Variant; children: React.ReactNode }) {
  const m = META[variant];
  return (
    <div className={cn("mt-5 flex gap-3 rounded-lg border p-4 text-body text-paper-muted", m.cls)}>
      <m.Icon className={cn("mt-0.5 size-5 shrink-0", m.icon)} />
      <div className="[&>p]:!mt-0">{children}</div>
    </div>
  );
}
