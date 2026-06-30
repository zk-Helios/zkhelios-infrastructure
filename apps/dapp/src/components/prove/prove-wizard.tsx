"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import confetti from "canvas-confetti";
import { toast } from "sonner";
import { ArrowLeft, Copy, Download, Check, Loader2, ShieldCheck, Share2, Sparkles } from "lucide-react";
import { Button } from "@zkhelios/ui";
import { ConfigureStep } from "./configure-step";
import { HexMeshProgress } from "./hex-mesh-progress";
import { ComputeUnitEstimate } from "@/components/ui/compute-unit-estimate";
import { TransactionSignatureDisplay } from "@/components/ui/transaction-signature-display";
import { PublicKeyDisplay } from "@/components/ui/public-key-display";
import { getProofType, splitInputs } from "@/lib/zk/circuits";
import { generateProof, type ProveHandle } from "@/lib/zk/prover";
import { submitProof, type SubmitProgress } from "@/lib/zk/submit";
import { groth16ToSolana, bytesToHex } from "@/lib/zk/format";
import { saveProof, updateProof } from "@/lib/db";
import { buildShareLink } from "@/lib/zk/share";
import { parseWalletError } from "@/lib/wallet-errors";
import type { ProofKind } from "@/types";
import type { ProofBundle, ProverProgress } from "@/lib/zk/types";
import { cn } from "@/lib/utils";

type Step = "configure" | "review" | "generate" | "result" | "submit";

export function ProveWizard({ kind, onExit, onSaved }: { kind: ProofKind; onExit: () => void; onSaved?: () => void }) {
  const def = getProofType(kind);
  const { publicKey } = useWallet();
  const [step, setStep] = useState<Step>("configure");
  const [values, setValues] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState<ProverProgress>({ stage: "idle", pct: 0, message: "" });
  const [bundle, setBundle] = useState<ProofBundle | null>(null);
  const [submit, setSubmit] = useState<SubmitProgress | null>(null);
  const [copied, setCopied] = useState(false);
  const handleRef = useRef<ProveHandle | null>(null);

  const { pub, priv } = values && Object.keys(values).length ? splitInputs(def, values) : { pub: {}, priv: {} };

  // Kick off generation when entering the generate step.
  useEffect(() => {
    if (step !== "generate") return;
    let done = false;
    const handle = generateProof({ circuitName: def.circuitName, publicCount: def.publicInputCount }, (p) =>
      setProgress(p),
    );
    handleRef.current = handle;
    handle.promise
      .then(async ({ proof, publicSignals }) => {
        done = true;
        const b: ProofBundle = {
          id: `pf_${Date.now()}`,
          kind: def.kind,
          circuitName: def.circuitName,
          proof,
          publicSignals,
          publicInputs: pub,
          createdAt: Date.now(),
        };
        setBundle(b);
        await saveProof({ ...b, status: "completed" }).catch(() => {});
        onSaved?.();
        setStep("result");
      })
      .catch((err) => {
        if (!done) {
          if (err?.message === "cancelled") {
            setStep("review");
          } else {
            toast.error("Proof generation failed. Please try again.");
            setStep("review");
          }
        }
      });
    return () => handle.cancel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const onGenerate = useCallback((vals: Record<string, string>) => {
    setValues(vals);
    setStep("review");
  }, []);

  const copyJson = async () => {
    if (!bundle) return;
    await navigator.clipboard.writeText(JSON.stringify({ proof: bundle.proof, publicSignals: bundle.publicSignals }, null, 2)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadJson = () => {
    if (!bundle) return;
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${bundle.kind}-proof-${bundle.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const share = async () => {
    if (!bundle) return;
    const link = buildShareLink(bundle);
    await navigator.clipboard.writeText(link).catch(() => {});
    toast.success("Verification link copied");
  };

  const onSubmitChain = useCallback(async () => {
    if (!bundle || !publicKey) return;
    setStep("submit");
    try {
      const { signature, proofAccount } = await submitProof(bundle, publicKey, setSubmit);
      await updateProof(bundle.id, { status: "submitted", signature, proofAccount });
      onSaved?.();
      if (!localStorage.getItem("zkhelios:firstProof")) {
        localStorage.setItem("zkhelios:firstProof", "1");
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ["#F5A524", "#FAFAFA", "#F7B137"] });
      }
    } catch (err) {
      const msg = parseWalletError(err);
      if (msg) toast.error(msg);
      setSubmit({ stage: "error", message: msg ?? "Submission failed" });
    }
  }, [bundle, publicKey, onSaved]);

  return (
    <div>
      {/* Step header */}
      <div className="mb-6 flex items-center gap-3">
        <button onClick={onExit} className="grid size-9 place-items-center rounded-md border border-ink-400 text-paper-muted hover:text-paper" aria-label="Back to proof types">
          <ArrowLeft className="size-4" />
        </button>
        <span className="grid size-9 place-items-center rounded-md border border-amber-500/30 bg-amber-500/[0.08] text-amber-400">
          <def.icon className="size-4" />
        </span>
        <div>
          <h2 className="font-display text-h5 font-semibold text-paper">{def.label}</h2>
          <Steps current={step} />
        </div>
      </div>

      {step === "configure" && <ConfigureStep def={def} defaultValues={values} onSubmit={onGenerate} />}

      {step === "review" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <InputPanel title="Public inputs" tone="public" entries={pub} note="Visible to the verifier on-chain." />
          <InputPanel title="Private inputs" tone="private" entries={priv} note="Never leave your device or get submitted." />
          <div className="rounded-lg border border-ink-400 bg-ink-900 p-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <dl className="flex gap-6 text-caption">
                <div>
                  <dt className="text-paper-faint">Est. proof size</dt>
                  <dd className="font-mono text-paper">{def.estProofSizeBytes} bytes</dd>
                </div>
                <div>
                  <dt className="text-paper-faint">Est. on-chain cost</dt>
                  <dd><ComputeUnitEstimate units={def.estCU} /></dd>
                </div>
              </dl>
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setStep("configure")}>Back</Button>
                <Button onClick={() => setStep("generate")}>
                  <ShieldCheck className="size-4" /> Generate proof
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {step === "generate" && (
        <div className="flex flex-col items-center rounded-lg border border-ink-400 bg-ink-900 py-10">
          <HexMeshProgress stage={progress.stage} pct={progress.pct} />
          <p className="mt-4 font-mono text-caption text-amber-300">{progress.message}</p>
          <p className="mt-1 text-caption text-paper-faint">Generating client-side — your inputs stay private.</p>
          <Button variant="ghost" className="mt-6" onClick={() => handleRef.current?.cancel()}>
            Cancel
          </Button>
        </div>
      )}

      {step === "result" && bundle && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg border border-status-online/30 bg-status-online/[0.06] p-3 text-caption text-status-online">
            <Check className="size-4" /> Proof generated and verified locally.
          </div>
          <div className="rounded-lg border border-ink-400 bg-ink-900 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-mono text-caption uppercase tracking-wider text-paper-faint">Groth16 proof</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="ghost" onClick={copyJson}>
                  {copied ? <Check className="size-3.5 text-status-online" /> : <Copy className="size-3.5" />} Copy JSON
                </Button>
                <Button size="sm" variant="ghost" onClick={downloadJson}><Download className="size-3.5" /> Download</Button>
              </div>
            </div>
            <SolanaBytes bundle={bundle} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onSubmitChain}><ShieldCheck className="size-4" /> Submit on-chain</Button>
            <Button variant="outline" onClick={share}><Share2 className="size-4" /> Share verification link</Button>
            <Button variant="ghost" onClick={onExit}>Generate another</Button>
          </div>
        </div>
      )}

      {step === "submit" && (
        <SubmitView submit={submit} bundle={bundle} onShare={share} onAnother={onExit} />
      )}
    </div>
  );
}

function Steps({ current }: { current: Step }) {
  const order: Step[] = ["configure", "review", "generate", "result"];
  const labels: Record<Step, string> = { configure: "Configure", review: "Review", generate: "Generate", result: "Result", submit: "Submit" };
  const idx = current === "submit" ? 3 : order.indexOf(current);
  return (
    <div className="mt-0.5 flex items-center gap-1.5 text-[0.7rem] text-paper-faint">
      {order.map((s, i) => (
        <span key={s} className={cn("font-mono", i <= idx ? "text-amber-400" : "")}>
          {labels[s]}
          {i < order.length - 1 && <span className="ml-1.5 text-ink-300">›</span>}
        </span>
      ))}
    </div>
  );
}

function InputPanel({ title, tone, entries, note }: { title: string; tone: "public" | "private"; entries: Record<string, string>; note: string }) {
  return (
    <div className={cn("rounded-lg border bg-ink-900 p-4", tone === "public" ? "border-[#60A5FA]/30" : "border-amber-500/30")}>
      <h3 className={cn("font-mono text-caption uppercase tracking-wider", tone === "public" ? "text-[#60A5FA]" : "text-amber-400")}>{title}</h3>
      <dl className="mt-3 space-y-2">
        {Object.entries(entries).map(([k, v]) => (
          <div key={k} className="flex items-center justify-between gap-3 text-caption">
            <dt className="text-paper-faint">{k}</dt>
            <dd className="truncate font-mono text-paper">{tone === "private" ? "••••••" : v}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 border-t border-ink-400 pt-2 text-[0.7rem] text-paper-faint">{note}</p>
    </div>
  );
}

function SolanaBytes({ bundle }: { bundle: ProofBundle }) {
  const args = groth16ToSolana(bundle.proof, bundle.publicSignals);
  const rows: [string, number[]][] = [
    ["proof_a (64)", args.proofA],
    ["proof_b (128)", args.proofB],
    ["proof_c (64)", args.proofC],
  ];
  return (
    <div className="space-y-1.5 font-mono text-[0.7rem]">
      {rows.map(([label, bytes]) => (
        <div key={label} className="flex gap-2">
          <span className="w-24 shrink-0 text-paper-faint">{label}</span>
          <span className="truncate text-paper-muted">{bytesToHex(bytes, 56)}</span>
        </div>
      ))}
      <div className="flex gap-2">
        <span className="w-24 shrink-0 text-paper-faint">public ({bundle.publicSignals.length})</span>
        <span className="truncate text-paper-muted">{bundle.publicSignals.map((s) => s.slice(0, 8)).join(", ")}…</span>
      </div>
    </div>
  );
}

const SUBMIT_STEPS = [
  { key: "building", label: "Building transaction" },
  { key: "sending", label: "Sending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "finalized", label: "Finalized" },
] as const;

function SubmitView({ submit, bundle, onShare, onAnother }: { submit: SubmitProgress | null; bundle: ProofBundle | null; onShare: () => void; onAnother: () => void }) {
  const order = SUBMIT_STEPS.map((s) => s.key);
  const currentIdx = submit ? order.indexOf(submit.stage as (typeof order)[number]) : -1;
  const finalized = submit?.stage === "finalized";
  const errored = submit?.stage === "error";

  return (
    <div className="rounded-lg border border-ink-400 bg-ink-900 p-6">
      {errored ? (
        <p className="text-caption text-status-error">{submit?.message}</p>
      ) : (
        <ol className="space-y-3">
          {SUBMIT_STEPS.map((s, i) => {
            const reached = currentIdx >= i;
            const active = currentIdx === i && !finalized;
            return (
              <li key={s.key} className="flex items-center gap-3">
                <span className={cn("grid size-6 place-items-center rounded-full border", reached ? "border-amber-500/50 bg-amber-500/15 text-amber-400" : "border-ink-400 text-paper-faint")}>
                  {active ? <Loader2 className="size-3.5 animate-spin" /> : reached ? <Check className="size-3.5" /> : <span className="text-[0.6rem]">{i + 1}</span>}
                </span>
                <span className={cn("text-caption", reached ? "text-paper" : "text-paper-faint")}>{s.label}</span>
              </li>
            );
          })}
        </ol>
      )}

      {submit?.signature && (
        <div className="mt-5 border-t border-ink-400 pt-4">
          <TransactionSignatureDisplay signature={submit.signature} />
          {submit.proofAccount && (
            <div className="mt-2 flex items-center gap-2 text-caption">
              <span className="text-paper-faint">Proof account:</span>
              <PublicKeyDisplay pubkey={submit.proofAccount} showExplorer />
            </div>
          )}
        </div>
      )}

      {finalized && (
        <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-ink-400 pt-4">
          <span className="inline-flex items-center gap-1.5 text-caption text-amber-300"><Sparkles className="size-4" /> Verified on-chain!</span>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={onShare}><Share2 className="size-3.5" /> Share</Button>
            <Button size="sm" onClick={onAnother}>Generate another</Button>
          </div>
        </div>
      )}
    </div>
  );
}
