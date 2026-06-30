import Link from "next/link";
import { ShieldCheck, BadgeCheck, Compass } from "lucide-react";
import { Card, CardTitle } from "@zkhelios/ui";

const ACTIONS = [
  { label: "Generate Proof", href: "/prove", icon: ShieldCheck },
  { label: "Verify Proof", href: "/verify", icon: BadgeCheck },
  { label: "View Explorer", href: "/explorer", icon: Compass },
];

export function QuickActions() {
  return (
    <Card padding="md" className="flex flex-col gap-4">
      <CardTitle className="text-h6">Quick actions</CardTitle>
      <div className="flex flex-col gap-2">
        {ACTIONS.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className="group flex items-center gap-3 rounded-md border border-ink-400 bg-ink-900 px-3 py-2.5 transition-colors hover:border-amber-500/40 hover:bg-white/[0.03]"
          >
            <span className="grid size-8 place-items-center rounded-md bg-amber-500/15 text-amber-400">
              <a.icon className="size-4" />
            </span>
            <span className="text-body font-medium text-paper">{a.label}</span>
          </Link>
        ))}
      </div>
    </Card>
  );
}
