import { DocPage } from "@/components/doc-page";

export const metadata = { title: "FAQ" };

const QA = [
  {
    q: "Does proving cost SOL?",
    a: "Generating a proof is free and happens in your browser. Submitting it on-chain pays a normal Solana transaction fee (a few thousand lamports).",
  },
  {
    q: "Are my private inputs ever sent anywhere?",
    a: "No. Private inputs are used only to compute the witness inside a Web Worker on your device. Only the proof and public inputs are submitted.",
  },
  {
    q: "Why did my transaction fail with 'blockhash not found'?",
    a: "Solana blockhashes expire after ~60–90 seconds. If you wait too long between building and signing, rebuild the transaction and try again.",
  },
  {
    q: "What happens if I exceed the compute budget?",
    a: "Standard circuits verify in ~200k CU, well under the 1.4M per-transaction cap. Very large custom circuits may need a compute-budget instruction or proof aggregation.",
  },
  {
    q: "Can another program verify a zkHelios proof?",
    a: "Yes — the verifier exposes a CPI-friendly instruction so any Anchor program can require a valid proof as part of its own logic.",
  },
  {
    q: "Which wallets are supported?",
    a: "Any Solana wallet implementing the Wallet Standard, including Phantom, Solflare, and Backpack.",
  },
];

export default function Faq() {
  return (
    <DocPage title="FAQ" lead="Common questions about proving, verifying, and Solana specifics.">
      <div className="mt-6 space-y-4">
        {QA.map((item) => (
          <div key={item.q} className="rounded-lg border border-ink-400 bg-ink-900 p-5">
            <h3 className="!mt-0 font-display text-h6 font-semibold text-paper">{item.q}</h3>
            <p className="!mt-2 text-body text-paper-muted">{item.a}</p>
          </div>
        ))}
      </div>
    </DocPage>
  );
}
