"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { Magnetic } from "@/components/shared/magnetic";
import { HexGrid } from "@/components/ui/hex-grid";
import { BACKERS, CONTRACT_ADDRESS } from "@/lib/constants";

const easeOut = [0.16, 1, 0.3, 1] as const;

function ContractAddress() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTRACT_ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? "Contract address copied" : "Copy contract address"}
      className="group inline-flex max-w-full items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/[0.06] px-3 py-1.5 font-mono text-caption text-paper-muted transition-colors duration-200 hover:border-amber-500/50 hover:text-amber-200"
    >
      <span className="uppercase tracking-[0.18em] text-amber-300">CA</span>
      <span className="truncate tabular-nums">{CONTRACT_ADDRESS}</span>
      {copied ? (
        <Check className="size-3.5 shrink-0 text-status-online" />
      ) : (
        <Copy className="size-3.5 shrink-0 opacity-70 transition-opacity group-hover:opacity-100" />
      )}
    </button>
  );
}

export function Hero() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden pt-16">
      {/* Ambient video — shielded execution visual */}
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-30 mask-fade-b"
        autoPlay
        muted
        loop
        playsInline
        poster="/assets/network-topology.png"
      >
        <source src="/assets/hero.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-amber-radial" aria-hidden />
      <HexGrid opacity={0.25} className="mask-fade-b" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/20 to-background" aria-hidden />

      <div className="relative z-10 mx-auto w-full max-w-section px-5 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: easeOut }}
          >
            <LogoMark size={104} animated glow className="text-amber-500" />
          </motion.div>

          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: easeOut, delay: 0.15 }}
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/[0.06] px-4 py-1.5 font-mono text-caption uppercase tracking-[0.18em] text-amber-300"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-status-online" />
            Built on Solana — Mainnet beta live
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.25 }}
            className="mt-6 font-display text-h1 font-bold leading-[1.02] text-paper [text-wrap:balance]"
          >
            Zero-Knowledge proofs.{" "}
            <span className="text-gradient-amber">Solana speed.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.35 }}
            className="mt-6 max-w-2xl text-lead text-paper-muted [text-wrap:balance]"
          >
            zkHelios brings privacy-preserving verification to Solana. Prove what matters —
            balance, ownership, membership, age — and reveal only what you choose.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: easeOut, delay: 0.45 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
          >
            <Magnetic>
              <Link href="/app">
                <Button size="lg" className="group">
                  Launch App
                  <ArrowUpRight className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Button>
              </Link>
            </Magnetic>
            <Link href="/docs">
              <Button size="lg" variant="ghost">
                <BookOpen />
                Read the Docs
              </Button>
            </Link>
          </motion.div>

          {/* Contract address (CA) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeOut, delay: 0.55 }}
            className="mt-6 w-full max-w-md"
          >
            <ContractAddress />
          </motion.div>

          {/* Backed-by strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-16 flex flex-col items-center gap-5"
          >
            <span className="font-mono text-caption uppercase tracking-[0.2em] text-paper-faint">
              Backed by leading funds
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
              {BACKERS.map((b) => (
                <span
                  key={b}
                  className="font-display text-base font-semibold text-paper-faint grayscale transition-colors duration-200 hover:text-paper-muted"
                >
                  {b}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll cue */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex h-9 w-5 items-start justify-center rounded-full border border-ink-400 p-1.5">
          <motion.span
            className="size-1 rounded-full bg-amber-500"
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
