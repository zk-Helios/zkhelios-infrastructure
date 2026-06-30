"use client";

import { useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, ShieldCheck, Check } from "lucide-react";
import { Button } from "@zkhelios/ui";
import { cn, truncate, formatSol } from "@/lib/utils";
import { explorerUrl } from "@/lib/solana";
import { useClusterStore } from "@/stores/cluster-store";
import { useSolBalance } from "@/hooks/use-sol-balance";
import { useAuth } from "@/hooks/use-auth";

/** Brand-styled wallet control: connect → (sign in) → address + SOL + dropdown. */
export function WalletButton() {
  const { publicKey, connected, disconnect } = useWallet();
  const { setVisible } = useWalletModal();
  const cluster = useClusterStore((s) => s.cluster);
  const { sol } = useSolBalance(publicKey?.toBase58());
  const { isAuthenticated, needsSignIn, isSigningIn, signIn } = useAuth();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!connected || !publicKey) {
    return (
      <Button size="sm" onClick={() => setVisible(true)}>
        <Wallet className="size-4" />
        Connect Wallet
      </Button>
    );
  }

  const address = publicKey.toBase58();

  const copy = async () => {
    await navigator.clipboard.writeText(address).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div ref={ref} className="relative flex items-center gap-2">
      {needsSignIn && (
        <Button size="sm" variant="outline" onClick={signIn} disabled={isSigningIn}>
          <ShieldCheck className="size-4" />
          {isSigningIn ? "Signing…" : "Sign in"}
        </Button>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        type="button"
        className="group inline-flex items-center gap-2 rounded-md border border-ink-400 bg-ink-800 py-1.5 pl-2 pr-2.5 transition-colors hover:border-amber-500/40"
      >
        <span
          className={cn(
            "grid size-6 place-items-center rounded-full",
            isAuthenticated ? "bg-status-online/15 text-status-online" : "bg-amber-500/15 text-amber-400",
          )}
        >
          <Wallet className="size-3.5" />
        </span>
        <span className="flex flex-col items-start leading-tight">
          <span className="font-mono text-caption text-paper">{truncate(address)}</span>
          <span className="font-mono text-[0.65rem] text-paper-faint">
            {sol === null ? "—" : `${formatSol(sol)} SOL`}
          </span>
        </span>
        <ChevronDown className="size-3.5 text-paper-faint transition-transform group-hover:translate-y-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-lg border border-ink-400 bg-ink-800 p-1 shadow-card">
          {needsSignIn && (
            <button
              onClick={() => {
                signIn();
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-caption text-amber-300 transition-colors hover:bg-white/[0.05]"
            >
              <ShieldCheck className="size-4" /> Sign in with Solana
            </button>
          )}
          <button
            onClick={copy}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-caption text-paper transition-colors hover:bg-white/[0.05]"
          >
            {copied ? <Check className="size-4 text-status-online" /> : <Copy className="size-4" />}
            {copied ? "Copied" : "Copy address"}
          </button>
          <a
            href={explorerUrl("address", address, cluster)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-caption text-paper transition-colors hover:bg-white/[0.05]"
          >
            <ExternalLink className="size-4" /> View on Explorer
          </a>
          <button
            onClick={() => {
              disconnect().catch(() => {});
              setOpen(false);
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-caption text-status-error transition-colors hover:bg-status-error/10"
          >
            <LogOut className="size-4" /> Disconnect
          </button>
        </div>
      )}
    </div>
  );
}
