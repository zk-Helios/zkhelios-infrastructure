"use client";

import { Megaphone } from "lucide-react";
import { Card, CardTitle } from "@zkhelios/ui";
import { useAnnouncements } from "@/hooks/use-dashboard";
import { timeAgo } from "@/lib/format";

export function AnnouncementCard() {
  const { data, isLoading } = useAnnouncements();

  return (
    <Card padding="md" className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-h6">Announcements</CardTitle>
        <Megaphone className="size-4 text-amber-400" />
      </div>
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton h-12 w-full rounded-md" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col divide-y divide-ink-400">
          {data?.map((a) => (
            <li key={a.id} className="py-2.5">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[0.65rem] uppercase tracking-wider text-amber-400">
                  {a.tag}
                </span>
                <span className="font-mono text-[0.7rem] text-paper-faint">{timeAgo(a.date)}</span>
              </div>
              <p className="mt-1.5 text-caption font-medium text-paper">{a.title}</p>
              <p className="mt-0.5 text-caption text-paper-muted">{a.body}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
