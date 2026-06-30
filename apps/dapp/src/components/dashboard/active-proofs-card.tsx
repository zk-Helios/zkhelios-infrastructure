"use client";

import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardTitle } from "@zkhelios/ui";
import { AnimatedNumber } from "./animated-number";
import { useActiveProofs } from "@/hooks/use-dashboard";

/** Count of the user's proofs + how many are still pending. */
export function ActiveProofsCard() {
  const { data, isLoading } = useActiveProofs();

  return (
    <Card padding="md" className="flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-h6">Your proofs</CardTitle>
        <ShieldCheck className="size-4 text-amber-400" />
      </div>
      <div>
        <div className="font-display text-h2 font-bold text-paper">
          {isLoading ? <span className="skeleton inline-block h-9 w-16 align-middle" /> : <AnimatedNumber value={data?.total ?? 0} />}
        </div>
        <p className="mt-1 text-caption text-paper-muted">
          {isLoading ? "—" : <>{data?.pending ?? 0} pending verification</>}
        </p>
      </div>
      <Link
        href="/prove"
        className="inline-flex items-center gap-1.5 text-caption font-medium text-amber-400 hover:text-amber-300"
      >
        Generate a proof <ArrowRight className="size-3.5" />
      </Link>
    </Card>
  );
}
