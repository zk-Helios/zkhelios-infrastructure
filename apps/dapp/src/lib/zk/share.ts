import type { ProofBundle } from "./types";

export interface SharedProof {
  kind: ProofBundle["kind"];
  circuitName: string;
  proof: ProofBundle["proof"];
  publicSignals: string[];
  publicInputs: Record<string, string>;
}

/** Base64url-encode a proof payload for a shareable verification link. */
export function encodeProof(b: ProofBundle | SharedProof): string {
  const payload: SharedProof = {
    kind: b.kind,
    circuitName: b.circuitName,
    proof: b.proof,
    publicSignals: b.publicSignals,
    publicInputs: b.publicInputs,
  };
  const json = JSON.stringify(payload);
  const b64 = typeof window === "undefined" ? Buffer.from(json).toString("base64") : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeProof(encoded: string): SharedProof | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window === "undefined"
        ? Buffer.from(b64, "base64").toString("utf8")
        : decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as SharedProof;
  } catch {
    return null;
  }
}

export function buildShareLink(b: ProofBundle): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  return `${origin}/verify?proof=${encodeProof(b)}`;
}
