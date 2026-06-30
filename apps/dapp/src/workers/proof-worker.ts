/// <reference lib="webworker" />
/**
 * Mock Groth16 prover. Runs off the main thread and reports staged progress,
 * exactly like a real `snarkjs.groth16.fullProve` integration would. To swap in
 * real proving, replace `mockProve` with snarkjs loading the circuit wasm + zkey.
 *
 * Messages in:  { type: "prove", jobId, circuitName, publicCount }
 *               { type: "cancel", jobId }
 * Messages out: { type: "progress", jobId, stage, pct, message }
 *               { type: "result", jobId, proof, publicSignals }
 *               { type: "error" | "cancelled", jobId }
 */

type Stage = "witness" | "setup" | "prove" | "verify" | "format" | "done";

const STAGES: { stage: Stage; pct: number; message: string; ms: () => number }[] = [
  { stage: "witness", pct: 10, message: "Computing witness…", ms: () => 600 + Math.random() * 1200 },
  { stage: "setup", pct: 20, message: "Loading proving key…", ms: () => 500 + Math.random() * 1000 },
  { stage: "prove", pct: 80, message: "Generating Groth16 proof…", ms: () => 1500 + Math.random() * 4000 },
  { stage: "verify", pct: 95, message: "Verifying locally…", ms: () => 400 + Math.random() * 800 },
  { stage: "format", pct: 100, message: "Formatting for Solana…", ms: () => 300 + Math.random() * 500 },
];

const cancelled = new Set<string>();

// base58-ish big decimal field element (< 2^253)
function randField(): string {
  let s = "";
  for (let i = 0; i < 76; i++) s += Math.floor(Math.random() * 10);
  return BigInt(s).toString();
}

function makeProof(publicCount: number) {
  return {
    proof: {
      pi_a: [randField(), randField(), "1"],
      pi_b: [
        [randField(), randField()],
        [randField(), randField()],
        ["1", "0"],
      ],
      pi_c: [randField(), randField(), "1"],
      protocol: "groth16",
      curve: "bn128",
    },
    publicSignals: Array.from({ length: Math.max(1, publicCount) }, () => randField()),
  };
}

self.onmessage = async (e: MessageEvent) => {
  const data = e.data as { type: string; jobId: string; circuitName?: string; publicCount?: number };

  if (data.type === "cancel") {
    cancelled.add(data.jobId);
    return;
  }
  if (data.type !== "prove") return;

  const { jobId, publicCount = 1 } = data;

  for (const step of STAGES) {
    if (cancelled.has(jobId)) {
      self.postMessage({ type: "cancelled", jobId });
      cancelled.delete(jobId);
      return;
    }
    await new Promise((r) => setTimeout(r, step.ms()));
    self.postMessage({ type: "progress", jobId, stage: step.stage, pct: step.pct, message: step.message });
  }

  if (cancelled.has(jobId)) {
    self.postMessage({ type: "cancelled", jobId });
    cancelled.delete(jobId);
    return;
  }

  const { proof, publicSignals } = makeProof(publicCount);
  self.postMessage({ type: "result", jobId, proof, publicSignals });
};

export {};
