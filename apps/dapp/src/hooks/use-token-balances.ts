"use client";

import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useConnection } from "@solana/wallet-adapter-react";
import { useQuery } from "@tanstack/react-query";

export interface SplTokenBalance {
  mint: string;
  amount: number;
  decimals: number;
}

/**
 * SPL token balances for an owner. Metaplex metadata (name/symbol/logo) and
 * Jupiter USD pricing are layered on in the Session 3 dashboard build.
 */
export function useTokenBalances(pubkey?: string | null) {
  const { connection } = useConnection();

  return useQuery({
    queryKey: ["tokenBalances", pubkey, connection.rpcEndpoint],
    enabled: !!pubkey,
    staleTime: 1000 * 30,
    queryFn: async (): Promise<SplTokenBalance[]> => {
      const owner = new PublicKey(pubkey!);
      const res = await connection.getParsedTokenAccountsByOwner(owner, {
        programId: TOKEN_PROGRAM_ID,
      });
      return res.value
        .map((acc) => {
          const info = acc.account.data.parsed.info;
          return {
            mint: info.mint as string,
            amount: info.tokenAmount.uiAmount ?? 0,
            decimals: info.tokenAmount.decimals as number,
          };
        })
        .filter((t) => t.amount > 0)
        .sort((a, b) => b.amount - a.amount);
    },
  });
}
