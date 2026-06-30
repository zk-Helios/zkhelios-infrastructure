"use client";

import { useState } from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import type { TimeRange } from "@/types";
import { ChartCard } from "./chart-card";
import { useProofsTimeseries } from "@/hooks/use-dashboard";
import { cn, formatAmount } from "@/lib/utils";

const RANGES: TimeRange[] = ["24h", "7d", "30d"];

export function ProofsLineChart() {
  const [range, setRange] = useState<TimeRange>("7d");
  const { data, isLoading } = useProofsTimeseries(range);

  const chartData = (data ?? []).map((p) => ({
    label:
      range === "24h"
        ? new Date(p.t).toLocaleTimeString("en-US", { hour: "2-digit" })
        : new Date(p.t).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    value: p.value,
  }));

  return (
    <ChartCard
      title="Proofs verified over time"
      toolbar={
        <div className="flex gap-1 rounded-md border border-ink-400 p-0.5">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "rounded px-2.5 py-1 font-mono text-caption transition-colors",
                r === range ? "bg-amber-500/15 text-amber-300" : "text-paper-faint hover:text-paper",
              )}
            >
              {r}
            </button>
          ))}
        </div>
      }
    >
      <div className="h-64" role="img" aria-label={`Proofs verified over the last ${range}`}>
        {isLoading ? (
          <div className="skeleton h-full w-full rounded-md" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <defs>
                <linearGradient id="proofFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#F5A524" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#F5A524" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#2A2A2A" vertical={false} />
              <XAxis dataKey="label" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} minTickGap={24} />
              <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} width={48} tickFormatter={(v) => formatAmount(v, 0)} />
              <Tooltip
                contentStyle={{ background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#A1A1AA" }}
                itemStyle={{ color: "#F5A524" }}
                formatter={(v: number) => [formatAmount(v, 0), "proofs"]}
              />
              <Area type="monotone" dataKey="value" stroke="#F5A524" strokeWidth={2} fill="url(#proofFill)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
