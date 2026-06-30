"use client";

import { useCallback, useEffect, useState } from "react";
import { listProofs, deleteProof } from "@/lib/db";
import type { StoredProof } from "@/lib/zk/types";

/** Loads + refreshes the user's locally-stored proof history. */
export function useProofHistory() {
  const [proofs, setProofs] = useState<StoredProof[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setProofs(await listProofs());
    } catch {
      setProofs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const remove = useCallback(
    async (id: string) => {
      await deleteProof(id);
      await refresh();
    },
    [refresh],
  );

  return { proofs, loading, refresh, remove };
}
