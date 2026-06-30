"use client";

import { useEffect, useMemo, useState } from "react";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";
import "@solana/wallet-adapter-react-ui/styles.css";

import { getRpcEndpoint } from "@/lib/solana";
import { useClusterStore } from "@/stores/cluster-store";
import { fetchMe } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

/** Polls the session endpoint and mirrors identity into the auth store. */
function AuthSync({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);
  const setStatus = useAuthStore((s) => s.setStatus);

  const { data, isLoading } = useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
    staleTime: 1000 * 30,
  });

  useEffect(() => {
    if (isLoading) {
      setStatus("loading");
      return;
    }
    setUser(data ?? null);
  }, [data, isLoading, setUser, setStatus]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const cluster = useClusterStore((s) => s.cluster);
  const endpoint = useMemo(() => getRpcEndpoint(cluster), [cluster]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: true, staleTime: 1000 * 30 },
        },
      }),
  );

  return (
    // Standard Wallets (Phantom, Solflare, Backpack, Glow…) auto-register, so the
    // explicit adapter list can stay empty. Re-keyed on endpoint so a cluster
    // switch rebuilds the connection cleanly.
    <ConnectionProvider key={endpoint} endpoint={endpoint}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <QueryClientProvider client={queryClient}>
            <AuthSync>{children}</AuthSync>
          </QueryClientProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
