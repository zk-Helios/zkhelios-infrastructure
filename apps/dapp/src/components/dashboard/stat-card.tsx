"use client";

import { ResponsiveContainer, LineChart, Line } from "recharts";
import type { LucideIcon } from "lucide-react";
import { Card } from "@zkhelios/ui";
import { AnimatedNumber } from "./animated-number";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  format?: (n: number) => string;
  sparkline?: number[];
  pulse?: boolean;
  loading?: boolean;
  className?: string;
}

/** Network metric card: icon + label + animated value + sparkline. */
export function StatCard({ label, value, icon: Icon, format, sparkline, pulse, loading, className }: StatCardProps) {
  return (
    <Card padding="md" className={cn("flex flex-col gap-3", className)}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-caption uppercase tracking-[0.1em] text-paper-faint">{label}</span>
        <Icon className="size-4 text-amber-400" />
      </div>
      <div className="font-display text-h4 font-bold text-paper">
        {loading ? <span className="skeleton inline-block h-7 w-24 align-middle" /> : (
          <AnimatedNumber value={value} format={format} pulse={pulse} />
        )}
      </div>
      {sparkline && sparkline.length > 1 && (
        <div className="h-9">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sparkline.map((v, i) => ({ i, v }))} margin={{ top: 2, bottom: 2, left: 0, right: 0 }}>
              <Line type="monotone" dataKey="v" stroke="#F5A524" strokeWidth={1.5} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
