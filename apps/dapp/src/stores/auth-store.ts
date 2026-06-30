import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types";

interface AuthState {
  user: AuthUser | null;
  status: "loading" | "authenticated" | "unauthenticated";
  setUser: (user: AuthUser | null) => void;
  setStatus: (status: AuthState["status"]) => void;
  reset: () => void;
}

/**
 * Client-side mirror of the server session. The httpOnly cookie is the source
 * of truth; this store caches the resolved identity for synchronous UI reads.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: "loading",
      setUser: (user) =>
        set({ user, status: user ? "authenticated" : "unauthenticated" }),
      setStatus: (status) => set({ status }),
      reset: () => set({ user: null, status: "unauthenticated" }),
    }),
    {
      name: "zkhelios-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
