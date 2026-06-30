"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@zkhelios/ui";
import { useWatchlist } from "@/hooks/use-watchlist";

export function WatchButton({ pubkey }: { pubkey: string }) {
  const { isWatched, toggle } = useWatchlist();
  const watched = isWatched(pubkey);
  return (
    <Button size="sm" variant={watched ? "primary" : "outline"} onClick={() => toggle(pubkey)}>
      {watched ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      {watched ? "Watching" : "Watch"}
    </Button>
  );
}
