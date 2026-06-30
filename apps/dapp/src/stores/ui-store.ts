import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  /** Desktop sidebar collapsed (icon-only) state. */
  sidebarCollapsed: boolean;
  /** Mobile drawer open state. */
  mobileNavOpen: boolean;
  /** Notifications panel open state. */
  notificationsOpen: boolean;
  toggleSidebar: () => void;
  setMobileNav: (open: boolean) => void;
  setNotifications: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      mobileNavOpen: false,
      notificationsOpen: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setMobileNav: (mobileNavOpen) => set({ mobileNavOpen }),
      setNotifications: (notificationsOpen) => set({ notificationsOpen }),
    }),
    {
      name: "zkhelios-ui",
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);
