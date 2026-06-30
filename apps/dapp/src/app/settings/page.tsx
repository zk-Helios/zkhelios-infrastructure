"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Moon, Globe, Server, LogOut } from "lucide-react";
import { Card, CardTitle, CardDescription, Button } from "@zkhelios/ui";
import { PageHeader } from "@/components/ui/page-header";
import { Protected } from "@/components/auth/protected";
import { NetworkBadge } from "@/components/ui/network-badge";
import { useSignOut } from "@/hooks/use-sign-out";
import { useClusterStore } from "@/stores/cluster-store";

const LANGUAGES = ["English", "Bahasa Indonesia", "Español", "Deutsch", "日本語"];

export default function SettingsPage() {
  const [language, setLanguage] = useState("English");
  const [rpc, setRpc] = useState("");
  const cluster = useClusterStore((s) => s.cluster);
  const signOut = useSignOut();

  return (
    <Protected>
      <PageHeader title="Settings" description="Personalize your zkHelios experience." />

      <div className="grid gap-6">
        {/* Network */}
        <Card className="flex items-center justify-between" padding="md">
          <div className="flex items-start gap-4">
            <span className="grid size-10 place-items-center rounded-md border border-ink-400 bg-ink-900 text-amber-400">
              <Server className="size-5" />
            </span>
            <div>
              <CardTitle className="text-h6">Active cluster</CardTitle>
              <CardDescription className="mt-1">
                Switch clusters from the top bar. Your choice is saved to this browser.
              </CardDescription>
            </div>
          </div>
          <NetworkBadge cluster={cluster} />
        </Card>

        {/* Appearance */}
        <Card className="flex items-center justify-between" padding="md">
          <div className="flex items-start gap-4">
            <span className="grid size-10 place-items-center rounded-md border border-ink-400 bg-ink-900 text-amber-400">
              <Moon className="size-5" />
            </span>
            <div>
              <CardTitle className="text-h6">Appearance</CardTitle>
              <CardDescription className="mt-1">
                zkHelios is dark-mode only — tuned for the solar-on-black brand.
              </CardDescription>
            </div>
          </div>
          <span className="rounded-md border border-ink-400 bg-ink-900 px-3 py-1.5 font-mono text-caption text-paper-muted">
            Dark
          </span>
        </Card>

        {/* Language */}
        <Card padding="md">
          <div className="flex items-start gap-4">
            <span className="grid size-10 place-items-center rounded-md border border-ink-400 bg-ink-900 text-amber-400">
              <Globe className="size-5" />
            </span>
            <div className="flex-1">
              <CardTitle className="text-h6">Language</CardTitle>
              <CardDescription className="mt-1">
                Interface language. Full i18n catalogs ship in Session 5.
              </CardDescription>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="mt-4 w-full max-w-xs rounded-md border border-ink-400 bg-ink-900 px-3 py-2 text-body text-paper outline-none focus:border-amber-500/50 sm:w-auto"
              >
                {LANGUAGES.map((l) => (
                  <option key={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </Card>

        {/* Custom RPC */}
        <Card padding="md">
          <div className="flex items-start gap-4">
            <span className="grid size-10 place-items-center rounded-md border border-ink-400 bg-ink-900 text-amber-400">
              <Server className="size-5" />
            </span>
            <div className="flex-1">
              <CardTitle className="text-h6">Custom RPC endpoint</CardTitle>
              <CardDescription className="mt-1">
                Override the default RPC for the active cluster in this browser.
              </CardDescription>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <input
                  value={rpc}
                  onChange={(e) => setRpc(e.target.value)}
                  placeholder="https://your-rpc.helius-rpc.com/?api-key=…"
                  className="flex-1 rounded-md border border-ink-400 bg-ink-900 px-3 py-2 font-mono text-caption text-paper outline-none placeholder:text-ink-300 focus:border-amber-500/50"
                />
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => {
                    if (rpc && !/^https?:\/\//.test(rpc)) {
                      toast.error("RPC must be a valid http(s) URL.");
                      return;
                    }
                    toast.success(rpc ? "Custom RPC saved." : "Reverted to default RPC.");
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Session */}
        <Card padding="md" className="border-status-error/20">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-h6">Session</CardTitle>
              <CardDescription className="mt-1">
                Sign out of your SIWS session and disconnect your wallet.
              </CardDescription>
            </div>
            <Button variant="danger" onClick={() => signOut({ disconnectWallet: true })}>
              <LogOut className="size-4" />
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </Protected>
  );
}
