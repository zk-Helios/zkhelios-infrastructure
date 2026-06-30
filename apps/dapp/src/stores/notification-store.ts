import { create } from "zustand";
import type { AppNotification } from "@/types";

interface NotificationState {
  notifications: AppNotification[];
  unreadCount: () => number;
  add: (n: Omit<AppNotification, "id" | "read" | "createdAt">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  remove: (id: string) => void;
}

let seedId = 0;
const nextId = () => `n_${Date.now()}_${seedId++}`;

/** In-app notifications. Wires to the backend WS feed in a later session. */
export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [
    {
      id: nextId(),
      type: "system",
      title: "Welcome to zkHelios",
      body: "Connect your wallet and sign in to start bridging and proving.",
      read: false,
      createdAt: Date.now() - 1000 * 60 * 5,
    },
    {
      id: nextId(),
      type: "proof",
      title: "Mainnet beta is live",
      body: "Shielded execution is now generally available on zkHelios.",
      read: false,
      createdAt: Date.now() - 1000 * 60 * 60 * 2,
    },
  ],
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
  add: (n) =>
    set((s) => ({
      notifications: [
        { ...n, id: nextId(), read: false, createdAt: Date.now() },
        ...s.notifications,
      ],
    })),
  markRead: (id) =>
    set((s) => ({
      notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  remove: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}));
