"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn, truncate } from "@/lib/utils";
import { explorerUrl, solscanUrl } from "@/lib/solana";
import { useClusterStore } from "@/stores/cluster-store";

interface Props {
  signature: string;
  chars?: number;
  className?: string;
}

/** Truncated tx signature with copy + Solana Explorer + Solscan links. */
export function TransactionSignatureDisplay({ signature, chars = 6, className }: Props) {
  const [copied, setCopied] = useState(false);
  const cluster = useClusterStore((s) => s.cluster);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(signature);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <span className={cn("inline-flex items-center gap-2 font-mono text-caption", className)}>
      <span className="text-paper">{truncate(signature, chars)}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? "Copied" : "Copy signature"}
        className="grid size-6 place-items-center rounded text-paper-faint transition-colors hover:text-amber-400"
      >
        {copied ? <Check className="size-3.5 text-status-online" /> : <Copy className="size-3.5" />}
      </button>
      <a
        href={explorerUrl("tx", signature, cluster)}
        target="_blank"
        rel="noopener noreferrer"
        className="text-amber-400 hover:text-amber-300"
      >
        Explorer
      </a>
      {cluster !== "localnet" && (
        <a
          href={solscanUrl("tx", signature, cluster)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-paper-faint hover:text-amber-300"
        >
          Solscan
        </a>
      )}
    </span>
  );
}
