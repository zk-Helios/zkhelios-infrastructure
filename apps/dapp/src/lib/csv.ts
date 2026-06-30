import type { Transaction } from "@/types";
import { formatSol } from "@/lib/utils";

/** Serialize transactions to CSV and trigger a client-side download. */
export function exportTransactionsCsv(txs: Transaction[]) {
  const headers = ["signature", "type", "status", "feePayer", "fee_sol", "instructions", "computeUnits", "slot", "blockTime"];
  const rows = txs.map((t) =>
    [
      t.signature,
      t.type,
      t.status,
      t.feePayer,
      formatSol(t.fee, { fromLamports: true }),
      t.instructionCount,
      t.computeUnits,
      t.slot,
      new Date(t.blockTime).toISOString(),
    ].join(","),
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zkhelios-transactions-${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
