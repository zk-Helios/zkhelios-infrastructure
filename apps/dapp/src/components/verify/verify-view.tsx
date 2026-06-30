"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, FileJson, CheckCircle2, XCircle, RotateCcw, Share2, Loader2 } from "lucide-react";
import { Card, Button } from "@zkhelios/ui";
import { PublicKeyDisplay } from "@/components/ui/public-key-display";
import { TransactionSignatureDisplay } from "@/components/ui/transaction-signature-display";
import { getProofType } from "@/lib/zk/circuits";
import { verifyOffchain, verifyOnchain, type VerifyResult } from "@/lib/zk/verify";
import { listProofs } from "@/lib/db";
import { encodeProof } from "@/lib/zk/share";
import { formatDateTime } from "@/lib/format";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { ProofKind } from "@/types";

type Mode = "search" | "paste";

async function finder(q: string): Promise<VerifyResult | null> {
  const proofs = await listProofs();
  const p = proofs.find((x) => x.proofAccount === q || x.signature === q || x.id === q);
  if (!p) return null;
  return {
    valid: p.status !== "failed",
    source: "onchain",
    kind: p.kind,
    circuitName: p.circuitName,
    publicInputs: p.publicInputs,
    publicSignals: p.publicSignals,
    proof: p.proof,
    author: p.proofAccount,
    signature: p.signature,
    verifiedAt: p.createdAt,
  };
}

export function VerifyView() {
  const params = useSearchParams();
  const [mode, setMode] = useState<Mode>("search");
  const [query, setQuery] = useState("");
  const [json, setJson] = useState("");
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [busy, setBusy] = useState(false);

  // Auto-verify a shared link (?proof=…)
  useEffect(() => {
    const shared = params.get("proof");
    if (!shared) return;
    setMode("paste");
    setBusy(true);
    verifyOffchain(shared)
      .then(setResult)
      .finally(() => setBusy(false));
  }, [params]);

  const runSearch = async () => {
    setBusy(true);
    setResult(await verifyOnchain(query, finder));
    setBusy(false);
  };

  const runPaste = async () => {
    setBusy(true);
    try {
      const parsed = JSON.parse(json);
      const payload = parsed.proof && parsed.kind ? parsed : { kind: "custom", circuitName: "custom_circuit", proof: parsed.proof ?? parsed, publicSignals: parsed.publicSignals ?? [], publicInputs: {} };
      setResult(await verifyOffchain(payload));
    } catch {
      setResult({ valid: false, source: "offchain", error: "Invalid JSON." });
    }
    setBusy(false);
  };

  const share = async () => {
    if (!result?.proof) return;
    const link = `${window.location.origin}/verify?proof=${encodeProof({
      kind: (result.kind as ProofKind) ?? "custom",
      circuitName: result.circuitName ?? "custom_circuit",
      proof: result.proof,
      publicSignals: result.publicSignals ?? [],
      publicInputs: result.publicInputs ?? {},
    })}`;
    await navigator.clipboard.writeText(link).catch(() => {});
    toast.success("Verification link copied");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card padding="lg" className="space-y-4">
        <div className="flex gap-1 rounded-md border border-ink-400 p-0.5">
          {(["search", "paste"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex-1 rounded px-3 py-1.5 text-caption transition-colors",
                m === mode ? "bg-amber-500/15 text-amber-300" : "text-paper-faint hover:text-paper",
              )}
            >
              {m === "search" ? "Look up on-chain" : "Paste proof JSON"}
            </button>
          ))}
        </div>

        {mode === "search" ? (
          <>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-paper-faint" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Proof account, signature, or proof ID"
                className="w-full rounded-md border border-ink-400 bg-ink-900 py-2.5 pl-9 pr-3 font-mono text-caption text-paper outline-none placeholder:text-ink-300 focus:border-amber-500/50"
              />
            </div>
            <Button onClick={runSearch} disabled={busy || !query.trim()} className="w-full">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />} Verify
            </Button>
          </>
        ) : (
          <>
            <textarea
              value={json}
              onChange={(e) => setJson(e.target.value)}
              rows={8}
              placeholder='{ "proof": { "pi_a": […], … }, "publicSignals": […] }'
              className="w-full rounded-md border border-ink-400 bg-ink-900 px-3 py-2 font-mono text-caption text-paper outline-none placeholder:text-ink-300 focus:border-amber-500/50"
            />
            <Button onClick={runPaste} disabled={busy || !json.trim()} className="w-full">
              {busy ? <Loader2 className="size-4 animate-spin" /> : <FileJson className="size-4" />} Verify off-chain
            </Button>
          </>
        )}
      </Card>

      <div>{busy && !result ? <ResultSkeleton /> : result ? <VerifyResultCard result={result} onReverify={mode === "search" ? runSearch : runPaste} onShare={share} /> : <Placeholder />}</div>
    </div>
  );
}

function Placeholder() {
  return (
    <Card padding="lg" className="flex h-full min-h-48 items-center justify-center text-center">
      <p className="text-caption text-paper-faint">Look up a proof or paste proof JSON to verify it.</p>
    </Card>
  );
}

function ResultSkeleton() {
  return (
    <Card padding="lg" className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="skeleton h-6 w-full rounded" />
      ))}
    </Card>
  );
}

function VerifyResultCard({ result, onReverify, onShare }: { result: VerifyResult; onReverify: () => void; onShare: () => void }) {
  if (result.error) {
    return (
      <Card padding="lg" className="flex items-start gap-3 border-status-error/30">
        <XCircle className="mt-0.5 size-5 shrink-0 text-status-error" />
        <div>
          <p className="font-display text-h6 font-semibold text-paper">Not verified</p>
          <p className="mt-1 text-caption text-paper-muted">{result.error}</p>
        </div>
      </Card>
    );
  }

  const def = result.kind ? getProofType(result.kind as ProofKind) : null;

  return (
    <Card padding="lg" className={cn("space-y-4", result.valid ? "border-status-online/30" : "border-status-error/30")}>
      <div className="flex items-center gap-3">
        {result.valid ? <CheckCircle2 className="size-6 text-status-online" /> : <XCircle className="size-6 text-status-error" />}
        <div>
          <p className="font-display text-h5 font-semibold text-paper">{result.valid ? "Valid proof" : "Invalid proof"}</p>
          <p className="text-caption text-paper-faint">
            {result.source === "onchain" ? "On-chain attestation" : "Verified in browser"} · {def?.label ?? result.kind}
          </p>
        </div>
      </div>

      <dl className="divide-y divide-ink-400 border-t border-ink-400 pt-1">
        {result.publicInputs && Object.entries(result.publicInputs).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 py-2 text-caption">
            <dt className="text-paper-faint">{k}</dt>
            <dd className="truncate font-mono text-paper">{v}</dd>
          </div>
        ))}
        {result.author && (
          <div className="flex items-center justify-between gap-3 py-2 text-caption">
            <dt className="text-paper-faint">Proof account</dt>
            <dd><PublicKeyDisplay pubkey={result.author} showExplorer /></dd>
          </div>
        )}
        {result.signature && (
          <div className="flex items-center justify-between gap-3 py-2 text-caption">
            <dt className="text-paper-faint">Signature</dt>
            <dd><TransactionSignatureDisplay signature={result.signature} chars={5} /></dd>
          </div>
        )}
        {result.verifiedAt && (
          <div className="flex items-center justify-between gap-3 py-2 text-caption">
            <dt className="text-paper-faint">Date</dt>
            <dd className="font-mono text-paper">{formatDateTime(result.verifiedAt)}</dd>
          </div>
        )}
      </dl>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onReverify}><RotateCcw className="size-3.5" /> Verify again</Button>
        {result.proof && <Button size="sm" variant="ghost" onClick={onShare}><Share2 className="size-3.5" /> Share</Button>}
      </div>
    </Card>
  );
}
