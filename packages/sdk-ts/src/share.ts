import type { ProofBundle } from "./types";

/** Base64url-encode a proof bundle for a shareable verification link. */
export function encodeProof(b: ProofBundle): string {
  const json = JSON.stringify(b);
  const b64 =
    typeof window === "undefined" ? Buffer.from(json).toString("base64") : btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeProof(encoded: string): ProofBundle | null {
  try {
    const b64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json =
      typeof window === "undefined" ? Buffer.from(b64, "base64").toString("utf8") : decodeURIComponent(escape(atob(b64)));
    return JSON.parse(json) as ProofBundle;
  } catch {
    return null;
  }
}
