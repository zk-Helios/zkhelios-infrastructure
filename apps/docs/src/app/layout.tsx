import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Github } from "lucide-react";
import { Logo, Button } from "@zkhelios/ui";
import { Sidebar } from "@/components/sidebar";
import { DocSearch } from "@/components/doc-search";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://docs.zkhelios.app"),
  title: { default: "zkHelios Docs", template: "%s · zkHelios Docs" },
  description: "Documentation for zkHelios — zero-knowledge proofs on Solana.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fontVariables} dark`} suppressHydrationWarning>
      <body className="min-h-screen bg-background text-paper">
        <header className="sticky top-0 z-50 border-b border-ink-400 bg-background/80 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo size={26} />
              <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-amber-400">
                Docs
              </span>
            </Link>
            <div className="flex items-center gap-3">
              <a href="https://github.com/zk-Helios" target="_blank" rel="noopener noreferrer" className="grid size-9 place-items-center rounded-md border border-ink-400 text-paper-muted hover:text-amber-300">
                <Github className="size-4" />
              </a>
              <Link href="/app">
                <Button size="sm">Launch App</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl gap-10 px-5 lg:px-8">
          <aside className="sticky top-16 hidden h-[calc(100vh-4rem)] w-60 shrink-0 overflow-y-auto py-8 lg:block">
            <DocSearch />
            <Sidebar />
          </aside>
          <main className="min-w-0 flex-1 py-10 lg:max-w-3xl">{children}</main>
        </div>
      </body>
    </html>
  );
}
