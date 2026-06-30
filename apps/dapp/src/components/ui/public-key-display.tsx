"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import { explorerUrl } from "@/lib/solana";
import { useClusterStore } from "@/stores/cluster-store";

interface PublicKeyDisplayProps {
  pubkey: string;
  chars?: number;
  showCopy?: boolean;
  showExplorer?: boolean;
  className?: string;
}

/** Truncated base58 pubkey with copy + Solana Explorer link. */
export function PublicKeyDisplay({
  pubkey,
  chars = 4,
  showCopy = true,
  showExplorer = false,
  className,
}: PublicKeyDisplayProps) {
  const [copied, setCopied] = useState(false);
  const cluster = useClusterStore((s) => s.cluster);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pubkey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-1.5 font-mono text-caption", className)}>
      <span className="text-paper">{truncate(pubkey, chars)}</span>
      {showCopy && (
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy address"}
          className="grid size-6 place-items-center rounded text-paper-faint transition-colors hover:text-amber-400"
        >
          {copied ? <Check className="size-3.5 text-status-online" /> : <Copy className="size-3.5" />}
        </button>
      )}
      {showExplorer && (
        <a
          href={explorerUrl("address", pubkey, cluster)}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="View on Solana Explorer"
          className="grid size-6 place-items-center rounded text-paper-faint transition-colors hover:text-amber-400"
        >
          <ExternalLink className="size-3.5" />
        </a>
      )}
    </span>
  );
}
