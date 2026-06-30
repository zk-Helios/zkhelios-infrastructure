"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import bs58 from "bs58";
import { buildSiwsMessage } from "@/lib/siws";
import { fetchNonce, verifySiws, logout as apiLogout } from "@/lib/auth-api";
import { useAuthStore } from "@/stores/auth-store";
import { useClusterStore } from "@/stores/cluster-store";
import { CLUSTERS } from "@/lib/solana";
import { parseWalletError } from "@/lib/wallet-errors";

/**
 * Resolved auth state + SIWS sign-in/out actions. Combines wallet connection
 * (wallet-adapter) with the server session (httpOnly cookie, mirrored in store).
 */
export function useAuth() {
  const { publicKey, signMessage, connected } = useWallet();
  const cluster = useClusterStore((s) => s.cluster);
  const user = useAuthStore((s) => s.user);
  const status = useAuthStore((s) => s.status);
  const reset = useAuthStore((s) => s.reset);
  const queryClient = useQueryClient();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) {
      toast.error("Connect a wallet that supports message signing.");
      return false;
    }
    setIsSigningIn(true);
    try {
      const pubkey = publicKey.toBase58();
      const { nonce, statement } = await fetchNonce(pubkey);

      const message = buildSiwsMessage({
        pubkey,
        nonce,
        statement,
        chainId: CLUSTERS[cluster].chainId,
        domain: window.location.host,
        uri: window.location.origin,
        issuedAt: new Date().toISOString(),
      });

      const signature = await signMessage(new TextEncoder().encode(message));
      const ok = await verifySiws(message, bs58.encode(signature), pubkey);

      if (!ok) {
        toast.error("Sign-in failed. Please try again.");
        return false;
      }
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      toast.success("Signed in");
      return true;
    } catch (err) {
      const msg = parseWalletError(err);
      if (msg) toast.error(msg); // null = user rejected → stay quiet
      return false;
    } finally {
      setIsSigningIn(false);
    }
  }, [publicKey, signMessage, cluster, queryClient]);

  const signOut = useCallback(async () => {
    await apiLogout();
    reset();
    await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
  }, [reset, queryClient]);

  return {
    user,
    pubkey: user?.pubkey ?? publicKey?.toBase58(),
    isConnected: connected,
    isAuthenticated: status === "authenticated" && !!user,
    isLoading: status === "loading",
    /** Connected wallet but no SIWS session yet. */
    needsSignIn: connected && status === "unauthenticated",
    isSigningIn,
    signIn,
    signOut,
  };
}
