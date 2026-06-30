"use client";

import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";

/** Derives the current page title from the active route. */
export function Breadcrumb() {
  const pathname = usePathname();
  const active =
    NAV_ITEMS.find((item) => (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))) ??
    NAV_ITEMS[0];

  return (
    <div className="flex items-center gap-2">
      <h1 className="font-display text-h5 font-semibold text-paper">{active.label}</h1>
    </div>
  );
}
