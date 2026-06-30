"use client";

import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { logout } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";

/** Ends the SIWS session and optionally disconnects the wallet. */
export function useSignOut() {
  const { disconnect } = useWallet();
  const reset = useAuthStore((s) => s.reset);
  const queryClient = useQueryClient();

  return useCallback(
    async ({ disconnectWallet = false }: { disconnectWallet?: boolean } = {}) => {
      await logout();
      reset();
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      if (disconnectWallet) await disconnect().catch(() => {});
      toast.success("Signed out");
    },
    [disconnect, reset, queryClient],
  );
}
