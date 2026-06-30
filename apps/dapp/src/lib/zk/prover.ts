import type { Groth16Proof, ProverProgress } from "./types";

export interface ProveResult {
  proof: Groth16Proof;
  publicSignals: string[];
}

export interface ProveHandle {
  promise: Promise<ProveResult>;
  cancel: () => void;
}

let jobCounter = 0;

/**
 * Spawns the proof Web Worker, streams progress to `onProgress`, and resolves
 * with the proof. Returns a `cancel()` to abort mid-generation. Browser-only.
 */
export function generateProof(
  params: { circuitName: string; publicCount: number },
  onProgress: (p: ProverProgress) => void,
): ProveHandle {
  const jobId = `job_${++jobCounter}_${Date.now()}`;
  const worker = new Worker(new URL("../../workers/proof-worker.ts", import.meta.url));

  const promise = new Promise<ProveResult>((resolve, reject) => {
    worker.onmessage = (e: MessageEvent) => {
      const msg = e.data as {
        type: string;
        stage?: ProverProgress["stage"];
        pct?: number;
        message?: string;
        proof?: Groth16Proof;
        publicSignals?: string[];
      };
      switch (msg.type) {
        case "progress":
          onProgress({ stage: msg.stage!, pct: msg.pct!, message: msg.message! });
          break;
        case "result":
          onProgress({ stage: "done", pct: 100, message: "Proof ready" });
          resolve({ proof: msg.proof!, publicSignals: msg.publicSignals! });
          worker.terminate();
          break;
        case "cancelled":
          reject(new Error("cancelled"));
          worker.terminate();
          break;
        case "error":
          reject(new Error("Proof generation failed"));
          worker.terminate();
          break;
      }
    };
    worker.onerror = () => {
      reject(new Error("Proof worker crashed"));
      worker.terminate();
    };
  });

  onProgress({ stage: "witness", pct: 2, message: "Starting…" });
  worker.postMessage({ type: "prove", jobId, circuitName: params.circuitName, publicCount: params.publicCount });

  return {
    promise,
    cancel: () => worker.postMessage({ type: "cancel", jobId }),
  };
}
