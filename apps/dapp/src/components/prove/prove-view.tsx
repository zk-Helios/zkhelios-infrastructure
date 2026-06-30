"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { ProofTypeGrid } from "./proof-type-grid";
import { ProofHistorySidebar } from "./proof-history-sidebar";

// confetti + worker client + form libs are only needed once a type is chosen.
const ProveWizard = dynamic(() => import("./prove-wizard").then((m) => m.ProveWizard), {
  ssr: false,
  loading: () => <div className="skeleton h-96 w-full rounded-lg" />,
});
import { useProofHistory } from "@/hooks/use-proof-history";
import type { ProofKind } from "@/types";

export function ProveView() {
  const [kind, setKind] = useState<ProofKind | null>(null);
  const { proofs, loading, refresh, remove } = useProofHistory();

  const reuse = (k: ProofKind) => {
    setKind(null);
    // restart wizard fresh for that type on next tick
    setTimeout(() => setKind(k), 0);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_18rem]">
      <div>
        {kind ? (
          <ProveWizard kind={kind} onExit={() => setKind(null)} onSaved={refresh} />
        ) : (
          <ProofTypeGrid onSelect={setKind} />
        )}
      </div>
      <ProofHistorySidebar proofs={proofs} loading={loading} onReuse={reuse} onRemove={remove} />
    </div>
  );
}
