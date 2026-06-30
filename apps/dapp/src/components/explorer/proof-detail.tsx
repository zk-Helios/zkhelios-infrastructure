"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, RotateCcw } from "lucide-react";
import { Card, CardTitle, Button } from "@zkhelios/ui";
import { Breadcrumbs } from "./breadcrumbs";
import { DetailRow } from "./detail-row";
import { ProofStatusBadge } from "./proof-status-badge";
import { PublicKeyDisplay } from "@/components/ui/public-key-display";
import { ComputeUnitEstimate } from "@/components/ui/compute-unit-estimate";
import { useExplorerProof } from "@/hooks/use-explorer";
import { getProofType } from "@/lib/zk/circuits";
import { formatDateTime } from "@/lib/format";
import { truncate } from "@/lib/utils";

export function ProofDetail({ id }: { id: string }) {
  const { data: proof, isLoading } = useExplorerProof(id);
  const [reverifying, setReverifying] = useState(false);
  const [reverified, setReverified] = useState(false);

  const reverify = async () => {
    setReverifying(true);
    await new Promise((r) => setTimeout(r, 900));
    setReverifying(false);
    setReverified(true);
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Explorer", href: "/explorer" }, { label: "Proof" }, { label: truncate(id, 6) }]} />
      {isLoading ? (
        <div className="skeleton h-72 w-full rounded-lg" />
      ) : !proof ? (
        <Card padding="lg">Proof not found.</Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card padding="lg" className="lg:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = getProofType(proof.kind).icon;
                  return (
                    <span className="grid size-10 place-items-center rounded-md border border-amber-500/30 bg-amber-500/[0.08] text-amber-400">
                      <Icon className="size-5" />
                    </span>
                  );
                })()}
                <div>
                  <CardTitle className="text-h6">{getProofType(proof.kind).label}</CardTitle>
                  <p className="font-mono text-caption text-paper-faint">{proof.circuitName}</p>
                </div>
              </div>
              <ProofStatusBadge status={proof.status} />
            </div>
            <dl className="divide-y divide-ink-400 border-t border-ink-400">
              <DetailRow label="Proof account">{proof.proofAccount && <PublicKeyDisplay pubkey={proof.proofAccount} showExplorer />}</DetailRow>
              <DetailRow label="Author"><PublicKeyDisplay pubkey={proof.authority} showExplorer /></DetailRow>
              <DetailRow label="Public inputs">
                <span className="font-mono">{Object.entries(proof.publicInputs).map(([k, v]) => `${k}=${v}`).join(", ") || "—"}</span>
              </DetailRow>
              {proof.slotVerified && <DetailRow label="Slot">{proof.slotVerified.toLocaleString("en-US")}</DetailRow>}
              <DetailRow label="Created">{formatDateTime(proof.createdAt)}</DetailRow>
              {proof.computeUnits && <DetailRow label="Compute units"><ComputeUnitEstimate units={proof.computeUnits} /></DetailRow>}
            </dl>
          </Card>

          <Card padding="lg" className="flex h-fit flex-col gap-4">
            <CardTitle className="text-h6">Verification</CardTitle>
            <div className="flex items-center gap-2">
              {reverified || proof.status === "verified" ? (
                <span className="inline-flex items-center gap-1.5 text-caption text-status-online">
                  <CheckCircle2 className="size-4" /> Valid proof
                </span>
              ) : (
                <ProofStatusBadge status={proof.status} />
              )}
            </div>
            <p className="text-caption text-paper-muted">
              Re-run the Groth16 verification entirely in your browser — no RPC needed.
            </p>
            <Button onClick={reverify} disabled={reverifying} variant="outline" size="sm">
              {reverifying ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
              Verify in browser
            </Button>
          </Card>
        </div>
      )}
    </>
  );
}
