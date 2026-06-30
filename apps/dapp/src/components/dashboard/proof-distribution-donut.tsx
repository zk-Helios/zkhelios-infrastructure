"use client";

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { ChartCard } from "./chart-card";
import { useProofDistribution } from "@/hooks/use-dashboard";
import { formatAmount } from "@/lib/utils";

const COLORS = ["#F5A524", "#F7B137", "#D4881A", "#A66713", "#FBD489"];
const LABEL: Record<string, string> = {
  balance: "Balance",
  ownership: "Ownership",
  age: "Age",
  membership: "Membership",
  custom: "Custom",
};

export function ProofDistributionDonut() {
  const { data, isLoading } = useProofDistribution();
  const chartData = (data ?? []).map((d) => ({ name: LABEL[d.kind] ?? d.kind, value: d.count }));
  const total = chartData.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard title="Proof type distribution">
      <div className="flex h-64 items-center gap-4" role="img" aria-label="Distribution of proofs by type">
        {isLoading ? (
          <div className="skeleton h-full w-full rounded-md" />
        ) : (
          <>
            <div className="relative h-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="62%"
                    outerRadius="92%"
                    paddingAngle={2}
                    stroke="none"
                  >
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 8, fontSize: 12 }}
                    formatter={(v: number, n) => [formatAmount(v, 0), n as string]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="font-display text-h5 font-bold text-paper">{formatAmount(total, 0)}</span>
                <span className="font-mono text-caption text-paper-faint">total</span>
              </div>
            </div>
            <ul className="flex flex-col gap-2">
              {chartData.map((d, i) => (
                <li key={d.name} className="flex items-center gap-2 text-caption text-paper-muted">
                  <span className="size-2.5 rounded-sm" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  {d.name}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </ChartCard>
  );
}
