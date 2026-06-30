"use client";

import { useEffect, useRef } from "react";
import { Bell, Check, ShieldCheck, BadgeCheck, Receipt, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui-store";
import { useNotificationStore } from "@/stores/notification-store";
import type { NotificationType } from "@/types";

const TYPE_ICON: Record<NotificationType, typeof Bell> = {
  tx: Receipt,
  proof: ShieldCheck,
  verify: BadgeCheck,
  system: Megaphone,
};

function timeAgo(ts: number) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

export function NotificationsBell() {
  const open = useUIStore((s) => s.notificationsOpen);
  const setOpen = useUIStore((s) => s.setNotifications);
  const notifications = useNotificationStore((s) => s.notifications);
  const unread = useNotificationStore((s) => s.unreadCount());
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markRead = useNotificationStore((s) => s.markRead);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [setOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-label="Notifications"
        className="relative grid size-9 place-items-center rounded-md border border-ink-400 bg-ink-800 text-paper-muted transition-colors hover:border-amber-500/40 hover:text-paper"
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-amber-500 text-[0.6rem] font-bold text-ink-900">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-lg border border-ink-400 bg-ink-800 shadow-card">
          <div className="flex items-center justify-between border-b border-ink-400 px-4 py-3">
            <span className="font-display text-h6 font-semibold text-paper">Notifications</span>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="inline-flex items-center gap-1 text-caption text-amber-400 hover:text-amber-300"
              >
                <Check className="size-3" /> Mark all read
              </button>
            )}
          </div>
          <ul className="max-h-96 divide-y divide-ink-400 overflow-y-auto">
            {notifications.length === 0 && (
              <li className="px-4 py-8 text-center text-caption text-paper-faint">
                You&apos;re all caught up.
              </li>
            )}
            {notifications.map((n) => {
              const Icon = TYPE_ICON[n.type];
              return (
                <li key={n.id}>
                  <button
                    onClick={() => markRead(n.id)}
                    className={cn(
                      "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]",
                      !n.read && "bg-amber-500/[0.04]",
                    )}
                  >
                    <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md border border-ink-400 bg-ink-900 text-amber-400">
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-caption font-semibold text-paper">
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[0.65rem] text-paper-faint">
                          {timeAgo(n.createdAt)}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-caption text-paper-muted">{n.body}</span>
                    </span>
                    {!n.read && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-amber-500" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
