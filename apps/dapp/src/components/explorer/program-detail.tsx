"use client";

import Link from "next/link";
import { Card, CardTitle } from "@zkhelios/ui";
import { Breadcrumbs } from "./breadcrumbs";
import { DetailRow } from "./detail-row";
import { StatusDot } from "@/components/transactions/status-badge";
import { PublicKeyDisplay } from "@/components/ui/public-key-display";
import { useProgramOverview } from "@/hooks/use-explorer";
import { truncate } from "@/lib/utils";

export function ProgramDetail({ programId }: { programId: string }) {
  const { data, isLoading } = useProgramOverview(programId);

  return (
    <>
      <Breadcrumbs items={[{ label: "Explorer", href: "/explorer" }, { label: "Program" }, { label: truncate(programId, 6) }]} />
      {isLoading || !data ? (
        <div className="skeleton h-72 w-full rounded-lg" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <Card padding="lg" className="lg:col-span-2">
            <CardTitle className="mb-3 text-h6">zkHelios Verifier</CardTitle>
            <dl className="divide-y divide-ink-400 border-t border-ink-400">
              <DetailRow label="Program ID"><span className="font-mono">{programId}</span></DetailRow>
              <DetailRow label="Deployer"><PublicKeyDisplay pubkey={data.deployer} showExplorer /></DetailRow>
              <DetailRow label="Upgrade authority"><PublicKeyDisplay pubkey={data.upgradeAuthority} showExplorer /></DetailRow>
              <DetailRow label="Last upgrade slot">{data.lastUpgradeSlot.toLocaleString("en-US")}</DetailRow>
              <DetailRow label="Success rate">{data.successRate}%</DetailRow>
              <DetailRow label="Invocations (24h)">{data.invocations24h.toLocaleString("en-US")}</DetailRow>
            </dl>
          </Card>

          <Card padding="lg" className="flex h-fit flex-col gap-3">
            <CardTitle className="text-h6">Account types</CardTitle>
            <ul className="flex flex-col gap-2">
              {data.accountTypes.map((a) => (
                <li key={a} className="rounded-md border border-ink-400 bg-ink-900 px-3 py-2 font-mono text-caption text-paper">
                  {a}
                </li>
              ))}
            </ul>
          </Card>

          <Card padding="md" className="lg:col-span-3">
            <CardTitle className="mb-3 text-h6">Recent invocations</CardTitle>
            <ul className="divide-y divide-ink-400">
              {data.recentInvocations.map((t) => (
                <li key={t.signature} className="py-2.5">
                  <Link href={`/explorer/tx/${t.signature}`} className="flex items-center justify-between gap-2 hover:text-amber-300">
                    <span className="flex items-center gap-2">
                      <StatusDot status={t.status} />
                      <span className="font-mono text-caption text-paper">{truncate(t.signature, 6)}</span>
                    </span>
                    <span className="font-mono text-[0.7rem] text-paper-faint">slot {t.slot.toLocaleString("en-US")}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  );
}
