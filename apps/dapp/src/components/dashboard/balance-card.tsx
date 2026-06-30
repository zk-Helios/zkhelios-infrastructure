"use client";

import { Wallet } from "lucide-react";
import { Card, CardTitle } from "@zkhelios/ui";
import { useAuth } from "@/hooks/use-auth";
import { useSolBalance } from "@/hooks/use-sol-balance";
import { useTokenBalances } from "@/hooks/use-token-balances";
import { usePrices } from "@/hooks/use-dashboard";
import { SOL_MINT } from "@/lib/api/jupiter";
import { MOCK_TOKENS } from "@/lib/mock/solana";
import { formatSol, formatUsd, formatAmount, truncate } from "@/lib/utils";

const META = Object.fromEntries(MOCK_TOKENS.map((t) => [t.mint, t]));

/** SOL + top-3 SPL balances (real chain data) with Jupiter USD values. */
export function BalanceCard() {
  const { pubkey } = useAuth();
  const { sol, loading: solLoading } = useSolBalance(pubkey);
  const { data: tokens = [], isLoading: tokensLoading } = useTokenBalances(pubkey);

  const top = [...tokens].slice(0, 3);
  const { data: prices = {} } = usePrices([SOL_MINT, ...top.map((t) => t.mint)]);

  const solUsd = sol !== null ? sol * (prices[SOL_MINT] ?? 0) : 0;
  const tokenUsd = top.reduce((s, t) => s + t.amount * (prices[t.mint] ?? META[t.mint]?.usdPrice ?? 0), 0);
  const totalUsd = solUsd + tokenUsd;

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-h6">Balances</CardTitle>
        <Wallet className="size-4 text-amber-400" />
      </div>

      <div>
        <div className="font-mono text-caption uppercase tracking-[0.1em] text-paper-faint">Total value</div>
        <div className="font-display text-h3 font-bold text-paper">{formatUsd(totalUsd)}</div>
      </div>

      <ul className="flex flex-col divide-y divide-ink-400">
        <li className="flex items-center justify-between py-2.5">
          <span className="flex items-center gap-2.5">
            <span className="grid size-7 place-items-center rounded-full bg-amber-500/15 font-mono text-[0.6rem] font-bold text-amber-400">
              SOL
            </span>
            <span className="font-medium text-paper">Solana</span>
          </span>
          <span className="text-right">
            <span className="block font-mono text-caption text-paper">
              {solLoading ? "…" : sol === null ? "—" : `${formatSol(sol)} SOL`}
            </span>
            <span className="block font-mono text-[0.7rem] text-paper-faint">{formatUsd(solUsd)}</span>
          </span>
        </li>

        {top.map((t) => {
          const meta = META[t.mint];
          const price = prices[t.mint] ?? meta?.usdPrice ?? 0;
          return (
            <li key={t.mint} className="flex items-center justify-between py-2.5">
              <span className="flex items-center gap-2.5">
                <span className="grid size-7 place-items-center rounded-full border border-ink-400 bg-ink-900 font-mono text-[0.55rem] font-bold text-paper-muted">
                  {(meta?.symbol ?? "?").slice(0, 4)}
                </span>
                <span className="font-medium text-paper">{meta?.name ?? truncate(t.mint, 4)}</span>
              </span>
              <span className="text-right">
                <span className="block font-mono text-caption text-paper">{formatAmount(t.amount)}</span>
                <span className="block font-mono text-[0.7rem] text-paper-faint">{formatUsd(t.amount * price)}</span>
              </span>
            </li>
          );
        })}

        {!tokensLoading && top.length === 0 && (
          <li className="py-3 text-caption text-paper-faint">No SPL tokens in this wallet.</li>
        )}
      </ul>
    </Card>
  );
}
