"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";
import { cn } from "@zkhelios/ui";

export function Sidebar() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6">
      {NAV.map((group) => (
        <div key={group.title}>
          <h4 className="mb-2 font-mono text-caption uppercase tracking-[0.14em] text-paper-faint">{group.title}</h4>
          <ul className="flex flex-col gap-0.5 border-l border-ink-400">
            {group.items.map((item) => {
              const active = pathname === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "-ml-px block border-l py-1.5 pl-4 text-caption transition-colors",
                      active
                        ? "border-amber-500 text-amber-300"
                        : "border-transparent text-paper-muted hover:border-ink-300 hover:text-paper",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
