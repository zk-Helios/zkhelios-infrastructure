import Link from "next/link";
import type { Metadata } from "next";
import { LogoMark } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Launch App",
  description: "The zkHelios dApp is coming in the next build session.",
};

/**
 * Placeholder destination for the "Launch App" CTA.
 * The full dApp (Solana wallet connect + SIWS auth) lives in apps/dapp (port 3001).
 */
export default function AppPlaceholder() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div className="flex max-w-md flex-col items-center">
        <LogoMark size={72} animated glow className="text-amber-500" />
        <span className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/[0.06] px-4 py-1.5 font-mono text-caption uppercase tracking-[0.18em] text-amber-300">
          Coming soon
        </span>
        <h1 className="mt-6 font-display text-h2 font-bold text-paper">The dApp is warming up</h1>
        <p className="mt-4 text-lead text-paper-muted">
          Connect a Solana wallet, sign in, and generate your first zero-knowledge proof in the
          dApp. For now, head back and explore the protocol.
        </p>
        <Link href="/" className="mt-8">
          <Button size="lg" variant="outline">
            ← Back to home
          </Button>
        </Link>
      </div>
    </main>
  );
}
