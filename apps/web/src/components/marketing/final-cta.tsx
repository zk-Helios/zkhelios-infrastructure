"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUpRight, Send } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { HexGrid } from "@/components/ui/hex-grid";
import { Magnetic } from "@/components/shared/magnetic";
import { Reveal } from "@/components/shared/reveal";

export function FinalCta() {
  const [email, setEmail] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("You're on the list — welcome to the dawn.");
    setEmail("");
  };

  return (
    <Section className="border-t border-ink-400">
      <Reveal>
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-ink-800 px-6 py-16 text-center md:px-16 md:py-20">
          <div className="absolute inset-0 bg-amber-radial" aria-hidden />
          <HexGrid opacity={0.3} className="mask-fade-b" />
          <div className="relative z-10 mx-auto flex max-w-2xl flex-col items-center">
            <LogoMark size={64} animated glow className="text-amber-500" />
            <Image
              src="/assets/wordmark.png"
              alt="zkHelios"
              width={320}
              height={80}
              priority={false}
              className="mt-6 h-auto w-56 select-none"
            />
            <h2 className="mt-6 font-display text-h2 font-bold text-paper [text-wrap:balance]">
              Step into the light.
            </h2>
            <p className="mt-4 text-lead text-paper-muted [text-wrap:balance]">
              Launch the app to generate your first zero-knowledge proof and verify it on Solana —
              or join the newsletter for protocol updates.
            </p>

            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
              <Magnetic>
                <Link href="/app">
                  <Button size="lg" className="group">
                    Launch App
                    <ArrowUpRight className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </Button>
                </Link>
              </Magnetic>
              <Link href="/docs">
                <Button size="lg" variant="outline">
                  Read the Docs
                </Button>
              </Link>
            </div>

            <form
              onSubmit={onSubmit}
              className="mt-10 flex w-full max-w-md items-center gap-2 rounded-md border border-ink-400 bg-background/80 p-1.5 backdrop-blur focus-within:border-amber-500/50"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@protocol.xyz"
                aria-label="Email address"
                className="flex-1 bg-transparent px-3 py-2 text-body text-paper placeholder:text-paper-faint focus:outline-none"
              />
              <Button type="submit" size="sm" aria-label="Subscribe">
                <Send className="size-4" />
                <span className="hidden sm:inline">Subscribe</span>
              </Button>
            </form>
          </div>
        </div>
      </Reveal>
    </Section>
  );
}
