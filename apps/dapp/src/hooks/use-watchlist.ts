"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "zkhelios:watchlist";

function read(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]");
  } catch {
    return [];
  }
}

/** Watched addresses, persisted to localStorage and shared across the dApp. */
export function useWatchlist() {
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    setList(read());
    const onStorage = (e: StorageEvent) => e.key === KEY && setList(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const persist = useCallback((next: string[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setList(next);
  }, []);

  const toggle = useCallback(
    (pubkey: string) => {
      const next = list.includes(pubkey) ? list.filter((p) => p !== pubkey) : [...list, pubkey];
      persist(next);
    },
    [list, persist],
  );

  return { list, toggle, isWatched: (p: string) => list.includes(p) };
}
