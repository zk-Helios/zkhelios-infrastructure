"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import { Logo, LogoMark } from "@zkhelios/ui";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "@/lib/constants";
import { useUIStore } from "@/stores/ui-store";

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggle = useUIStore((s) => s.toggleSidebar);
  const mobileOpen = useUIStore((s) => s.mobileNavOpen);
  const setMobileNav = useUIStore((s) => s.setMobileNav);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileNav(false)}
            title={collapsed ? item.label : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-md px-3 py-2.5 text-[0.95rem] transition-colors duration-200",
              active
                ? "bg-amber-500/[0.1] text-amber-300"
                : "text-paper-muted hover:bg-white/[0.04] hover:text-paper",
              collapsed && "justify-center px-0",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-amber-500" />
            )}
            <Icon className="size-[1.15rem] shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "sticky top-0 hidden h-screen flex-col border-r border-ink-400 bg-ink-900/60 backdrop-blur-xl transition-[width] duration-300 lg:flex",
          collapsed ? "w-[4.5rem]" : "w-64",
        )}
      >
        <div className={cn("flex h-16 items-center border-b border-ink-400 px-4", collapsed && "justify-center px-0")}>
          <Link href="/" aria-label="zkHelios">
            {collapsed ? <LogoMark size={28} className="text-amber-500" /> : <Logo size={26} />}
          </Link>
        </div>
        {nav}
        <button
          onClick={toggle}
          className="m-3 flex items-center justify-center gap-2 rounded-md border border-ink-400 py-2 text-caption text-paper-muted transition-colors hover:border-amber-500/40 hover:text-paper"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </aside>

      {/* Mobile drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!mobileOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/60 transition-opacity duration-300",
            mobileOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setMobileNav(false)}
        />
        <aside
          className={cn(
            "absolute left-0 top-0 flex h-full w-72 flex-col border-r border-ink-400 bg-ink-900 transition-transform duration-300",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex h-16 items-center justify-between border-b border-ink-400 px-4">
            <Logo size={26} />
            <button
              onClick={() => setMobileNav(false)}
              aria-label="Close menu"
              className="grid size-9 place-items-center rounded-md text-paper-muted hover:text-paper"
            >
              <X className="size-5" />
            </button>
          </div>
          {nav}
        </aside>
      </div>
    </>
  );
}
