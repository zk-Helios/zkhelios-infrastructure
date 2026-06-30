"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { ChartCard } from "./chart-card";
import { useCuByType } from "@/hooks/use-dashboard";
import { formatAmount } from "@/lib/utils";

const LABEL: Record<string, string> = {
  balance: "Balance",
  ownership: "Ownership",
  age: "Age",
  membership: "Member",
  custom: "Custom",
};

export function CuBarChart() {
  const { data, isLoading } = useCuByType();
  const chartData = (data ?? []).map((d) => ({ name: LABEL[d.kind] ?? d.kind, cu: d.cu }));

  return (
    <ChartCard title="Avg. compute units / proof type">
      <div className="h-64" role="img" aria-label="Average compute units per proof type">
        {isLoading ? (
          <div className="skeleton h-full w-full rounded-md" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
              <CartesianGrid stroke="#2A2A2A" vertical={false} />
              <XAxis dataKey="name" stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#71717A" fontSize={11} tickLine={false} axisLine={false} width={52} tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <Tooltip
                cursor={{ fill: "rgba(245,165,36,0.06)" }}
                contentStyle={{ background: "#0A0A0A", border: "1px solid #2A2A2A", borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: "#A1A1AA" }}
                formatter={(v: number) => [`${formatAmount(v, 0)} CU`, "avg"]}
              />
              <Bar dataKey="cu" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill="#F5A524" fillOpacity={0.55 + (i % 3) * 0.15} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </ChartCard>
  );
}
