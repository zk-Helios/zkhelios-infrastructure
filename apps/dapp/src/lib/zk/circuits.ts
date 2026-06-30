import { z } from "zod";
import { Coins, Image, CalendarClock, Network, FileCode, type LucideIcon } from "lucide-react";
import type { ProofKind } from "@/types";

export interface FieldDef {
  name: string;
  label: string;
  kind: "number" | "text" | "select" | "textarea";
  /** Becomes a public input (visible to the verifier) vs private (only you). */
  visibility: "public" | "private";
  placeholder?: string;
  help?: string;
  options?: { value: string; label: string }[];
}

export interface ProofTypeDef {
  kind: ProofKind;
  label: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  circuitName: string;
  estCU: number;
  estProofSizeBytes: number;
  publicInputCount: number;
  fields: FieldDef[];
  schema: z.ZodType<Record<string, string>>;
}

const nonEmpty = z.string().min(1, "Required");
const numeric = z.string().regex(/^\d+(\.\d+)?$/, "Must be a number");

export const PROOF_TYPES: ProofTypeDef[] = [
  {
    kind: "balance",
    label: "Prove Balance",
    tagline: "Hold ≥ X without revealing the amount",
    description:
      "Prove you hold at least a threshold of SOL or an SPL token without revealing your exact balance.",
    icon: Coins,
    circuitName: "balance_proof",
    estCU: 198_000,
    estProofSizeBytes: 256,
    publicInputCount: 2,
    fields: [
      {
        name: "token",
        label: "Token",
        kind: "select",
        visibility: "public",
        options: [
          { value: "SOL", label: "SOL" },
          { value: "USDC", label: "USDC" },
          { value: "JUP", label: "JUP" },
        ],
        help: "Which asset's balance you're proving.",
      },
      { name: "threshold", label: "Threshold (public)", kind: "number", visibility: "public", placeholder: "100" },
      { name: "balance", label: "Your actual balance (private)", kind: "number", visibility: "private", placeholder: "243.5", help: "Never leaves your device." },
    ],
    schema: z.object({ token: nonEmpty, threshold: numeric, balance: numeric }),
  },
  {
    kind: "ownership",
    label: "Prove Ownership",
    tagline: "Own an NFT without revealing which",
    description:
      "Prove you own an NFT from a collection without revealing which token or your wallet.",
    icon: Image,
    circuitName: "ownership_proof",
    estCU: 212_000,
    estProofSizeBytes: 256,
    publicInputCount: 1,
    fields: [
      { name: "collection", label: "Collection address (public)", kind: "text", visibility: "public", placeholder: "Collection mint pubkey" },
      { name: "mint", label: "Your NFT mint (private)", kind: "text", visibility: "private", placeholder: "Token mint you own" },
    ],
    schema: z.object({ collection: nonEmpty, mint: nonEmpty }),
  },
  {
    kind: "age",
    label: "Prove Age",
    tagline: "Wallet older than X days",
    description:
      "Prove your wallet is older than a number of days without revealing its creation date.",
    icon: CalendarClock,
    circuitName: "age_proof",
    estCU: 186_000,
    estProofSizeBytes: 256,
    publicInputCount: 1,
    fields: [
      { name: "minAgeDays", label: "Minimum age in days (public)", kind: "number", visibility: "public", placeholder: "90" },
      { name: "createdAtSlot", label: "Wallet creation slot (private)", kind: "number", visibility: "private", placeholder: "240000000" },
    ],
    schema: z.object({ minAgeDays: numeric, createdAtSlot: numeric }),
  },
  {
    kind: "membership",
    label: "Prove Membership",
    tagline: "Inclusion in a Merkle tree",
    description:
      "Prove your inclusion in a Merkle tree (whitelist, DAO, allowlist) without revealing your leaf.",
    icon: Network,
    circuitName: "membership_proof",
    estCU: 224_000,
    estProofSizeBytes: 256,
    publicInputCount: 1,
    fields: [
      { name: "root", label: "Merkle root (public)", kind: "text", visibility: "public", placeholder: "0x…" },
      { name: "leaf", label: "Your leaf (private)", kind: "text", visibility: "private", placeholder: "Your commitment" },
    ],
    schema: z.object({ root: nonEmpty, leaf: nonEmpty }),
  },
  {
    kind: "custom",
    label: "Custom Circuit",
    tagline: "Bring your own circuit",
    description:
      "Use a custom circuit: provide artifact URLs and JSON inputs, or start from a template.",
    icon: FileCode,
    circuitName: "custom_circuit",
    estCU: 256_000,
    estProofSizeBytes: 256,
    publicInputCount: 1,
    fields: [
      { name: "circuitUrl", label: "Circuit wasm URL (public)", kind: "text", visibility: "public", placeholder: "https://…/circuit.wasm" },
      { name: "inputs", label: "Inputs JSON (private)", kind: "textarea", visibility: "private", placeholder: '{ "a": 3, "b": 11 }' },
    ],
    schema: z.object({
      circuitUrl: nonEmpty,
      inputs: z.string().refine((v) => {
        try {
          JSON.parse(v);
          return true;
        } catch {
          return false;
        }
      }, "Must be valid JSON"),
    }),
  },
];

export const getProofType = (kind: ProofKind) => PROOF_TYPES.find((p) => p.kind === kind)!;

/** Split form values into public vs private maps per the field defs. */
export function splitInputs(def: ProofTypeDef, values: Record<string, string>) {
  const pub: Record<string, string> = {};
  const priv: Record<string, string> = {};
  for (const f of def.fields) {
    (f.visibility === "public" ? pub : priv)[f.name] = values[f.name];
  }
  return { pub, priv };
}
