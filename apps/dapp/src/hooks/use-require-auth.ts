"use client";

import { useAuth } from "./use-auth";

/**
 * Convenience hook for gated UI. Adds a `ready` flag (true only with a full
 * SIWS session) and `resolving` (true while auth status is unknown). Pair with
 * the <Protected> wrapper for whole-page gating.
 */
export function useRequireAuth() {
  const auth = useAuth();
  return {
    ...auth,
    ready: auth.isAuthenticated,
    resolving: auth.isLoading,
  };
}
