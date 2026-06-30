"use client";

import { useEffect, useState } from "react";
import { PublicKey } from "@solana/web3.js";
import { useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from "@/lib/solana";

/**
 * Live SOL balance for a pubkey: initial fetch + onAccountChange WS subscription.
 * Returns balance in SOL (not lamports). Cleans up the subscription on unmount.
 */
export function useSolBalance(pubkey?: string | null) {
  const { connection } = useConnection();
  const [lamports, setLamports] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pubkey) {
      setLamports(null);
      setLoading(false);
      return;
    }

    let active = true;
    let subId: number | undefined;
    let key: PublicKey;
    try {
      key = new PublicKey(pubkey);
    } catch {
      setLoading(false);
      return;
    }

    setLoading(true);
    connection
      .getBalance(key)
      .then((bal) => active && setLamports(bal))
      .catch(() => active && setLamports(null))
      .finally(() => active && setLoading(false));

    subId = connection.onAccountChange(key, (info) => {
      if (active) setLamports(info.lamports);
    });

    return () => {
      active = false;
      if (subId !== undefined) connection.removeAccountChangeListener(subId).catch(() => {});
    };
  }, [pubkey, connection]);

  return {
    lamports,
    sol: lamports === null ? null : lamports / LAMPORTS_PER_SOL,
    loading,
  };
}
