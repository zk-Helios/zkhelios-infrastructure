import { DocPage } from "@/components/doc-page";
import { Callout } from "@/components/callout";

export const metadata = { title: "Circuits" };

const CIRCUITS = [
  { name: "balance_proof", type: "Balance", pub: 2, cu: "~198k" },
  { name: "ownership_proof", type: "Ownership", pub: 1, cu: "~212k" },
  { name: "age_proof", type: "Age", pub: 1, cu: "~186k" },
  { name: "membership_proof", type: "Membership", pub: 1, cu: "~224k" },
  { name: "custom_circuit", type: "Custom", pub: "1–8", cu: "varies" },
];

export default function Circuits() {
  return (
    <DocPage title="Circuits" lead="The standard circuit catalog and their on-chain costs.">
      <div className="mt-6 overflow-hidden rounded-lg border border-ink-400">
        <table className="w-full text-left text-caption">
          <thead className="border-b border-ink-400 bg-ink-800 font-mono uppercase tracking-wider text-paper-faint">
            <tr>
              <th className="px-4 py-2.5">Circuit</th>
              <th className="px-4 py-2.5">Type</th>
              <th className="px-4 py-2.5">Public inputs</th>
              <th className="px-4 py-2.5">Verify CU</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-400">
            {CIRCUITS.map((c) => (
              <tr key={c.name}>
                <td className="px-4 py-2.5 font-mono text-paper">{c.name}</td>
                <td className="px-4 py-2.5 text-paper-muted">{c.type}</td>
                <td className="px-4 py-2.5 text-paper-muted">{c.pub}</td>
                <td className="px-4 py-2.5 font-mono text-paper-muted">{c.cu}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Callout variant="warning">
        Each circuit&apos;s verifying key comes from a trusted setup. Production deployments should use
        the output of a multi-party Powers of Tau ceremony and publish the transcript for audit.
      </Callout>
    </DocPage>
  );
}
