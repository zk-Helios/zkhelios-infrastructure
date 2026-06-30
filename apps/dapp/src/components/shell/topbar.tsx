"use client";

import { Menu, Moon } from "lucide-react";
import { Breadcrumb } from "./breadcrumb";
import { NetworkSwitcher } from "./network-switcher";
import { NotificationsBell } from "./notifications-bell";
import { WalletButton } from "./wallet-button";
import { useUIStore } from "@/stores/ui-store";

export function Topbar() {
  const setMobileNav = useUIStore((s) => s.setMobileNav);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-ink-400 bg-background/70 px-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileNav(true)}
          aria-label="Open menu"
          className="grid size-9 place-items-center rounded-md border border-ink-400 text-paper-muted hover:text-paper lg:hidden"
        >
          <Menu className="size-4" />
        </button>
        <Breadcrumb />
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <NetworkSwitcher />
        <NotificationsBell />
        {/* Theme indicator — always dark, decorative per brand */}
        <span
          className="hidden size-9 place-items-center rounded-md border border-ink-400 text-paper-faint sm:grid"
          title="Dark mode"
          aria-hidden
        >
          <Moon className="size-4" />
        </span>
        <WalletButton />
      </div>
    </header>
  );
}
