import { DocPage } from "@/components/doc-page";
import { Callout } from "@/components/callout";
import { CodeBlock } from "@/components/code-block";

export const metadata = { title: "REST API" };

export default function ApiReference() {
  return (
    <DocPage title="REST API" lead="Read endpoints exposed by the zkHelios indexer for proofs, transactions, and stats.">
      <Callout variant="info">
        The API is auto-documented from the backend&apos;s OpenAPI spec (Sessions 7–10). The endpoints
        below are the stable contract the dApp consumes today.
      </Callout>

      <h2 id="stats">Stats</h2>
      <ul>
        <li><code>GET /api/stats/overview</code> — tps, slot, epoch, totalProofs, proofs24h, …</li>
        <li><code>GET /api/stats/timeseries?metric=proofs&amp;period=24h|7d|30d</code></li>
        <li><code>GET /api/stats/leaderboard?period=24h</code></li>
      </ul>

      <h2 id="proofs">Proofs &amp; transactions</h2>
      <ul>
        <li><code>GET /api/proofs?authority&amp;type&amp;cursor</code></li>
        <li><code>GET /api/proofs/:proofAccount</code></li>
        <li><code>GET /api/transactions?pubkey&amp;type&amp;status&amp;cursor</code></li>
        <li><code>GET /api/transactions/:signature</code></li>
      </ul>

      <h2 id="ws">WebSocket</h2>
      <CodeBlock
        lang="ts"
        code={`const ws = new WebSocket("wss://api.zkhelios.app/ws");
ws.send(JSON.stringify({ type: "subscribe", channel: "stats" }));
// channels: stats, proofs, proofs:circuit:{id}, user:notifications,
//           user:proofs, address:{pubkey}:txs`}
      />
    </DocPage>
  );
}
