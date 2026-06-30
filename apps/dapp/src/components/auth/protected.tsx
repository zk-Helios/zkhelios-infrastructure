"use client";

import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { ShieldCheck, Wallet } from "lucide-react";
import { LogoMark, Button } from "@zkhelios/ui";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { SkeletonCard } from "@/components/ui/skeleton";

/**
 * Whole-page gate. Renders children only for an authenticated SIWS session;
 * otherwise prompts the user to connect a wallet and sign in.
 */
export function Protected({ children }: { children: React.ReactNode }) {
  const { ready, resolving, isConnected, needsSignIn, isSigningIn, signIn } = useRequireAuth();
  const { setVisible } = useWalletModal();

  if (resolving) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (ready) return <>{children}</>;

  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-ink-400 bg-ink-800 px-6 py-14 text-center">
      <LogoMark size={56} glow className="text-amber-500" />
      <h2 className="mt-6 font-display text-h4 font-semibold text-paper">
        {isConnected ? "Sign in to continue" : "Connect your wallet"}
      </h2>
      <p className="mt-2 max-w-sm text-body text-paper-muted">
        {isConnected
          ? "Sign the gas-free message to prove wallet ownership and open the zkHelios dApp."
          : "Connect a Solana wallet and sign in to access the zkHelios dApp."}
      </p>
      <div className="mt-7">
        {needsSignIn ? (
          <Button onClick={signIn} disabled={isSigningIn}>
            <ShieldCheck className="size-4" />
            {isSigningIn ? "Signing…" : "Sign in with Solana"}
          </Button>
        ) : (
          <Button onClick={() => setVisible(true)}>
            <Wallet className="size-4" />
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
}
