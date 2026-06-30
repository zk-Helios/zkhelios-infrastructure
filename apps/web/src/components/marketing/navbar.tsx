"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Magnetic } from "@/components/shared/magnetic";
import { NAV_LINKS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled ? "border-b border-white/[0.06] bg-background/70 backdrop-blur-xl" : "bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-16 max-w-section items-center justify-between px-5 sm:px-8 lg:px-10">
        <Link href="/" aria-label="zkHelios home" className="shrink-0">
          <Logo size={28} />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="rounded-md px-3 py-2 text-[0.95rem] text-paper-muted transition-colors duration-200 hover:text-paper"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-3 lg:flex">
          <Link href="/docs">
            <Button variant="ghost" size="sm">
              Docs
            </Button>
          </Link>
          <Magnetic>
            <Link href="/app">
              <Button size="sm" className="group">
                Launch App
                <ArrowUpRight className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Button>
            </Link>
          </Magnetic>
        </div>

        <button
          className="grid size-10 place-items-center rounded-md text-paper lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={cn(
          "overflow-hidden border-t border-white/[0.06] bg-background/95 backdrop-blur-xl transition-[max-height] duration-300 lg:hidden",
          open ? "max-h-[26rem]" : "max-h-0",
        )}
      >
        <ul className="flex flex-col gap-1 px-5 py-4 sm:px-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block rounded-md px-3 py-3 text-base text-paper-muted hover:bg-white/[0.04] hover:text-paper"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="mt-2">
            <Link href="/app" onClick={() => setOpen(false)}>
              <Button className="w-full">Launch App</Button>
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
