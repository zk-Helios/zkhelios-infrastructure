"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

/** Code block with a language label + copy button. */
export function CodeBlock({ code, lang = "ts" }: { code: string; lang?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="mt-5 overflow-hidden rounded-lg border border-ink-400 bg-ink-900">
      <div className="flex items-center justify-between border-b border-ink-400 px-4 py-2">
        <span className="font-mono text-[0.7rem] uppercase tracking-wider text-paper-faint">{lang}</span>
        <button onClick={copy} className="inline-flex items-center gap-1.5 font-mono text-caption text-paper-faint hover:text-amber-300">
          {copied ? <Check className="size-3.5 text-status-online" /> : <Copy className="size-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[0.82rem] leading-6 text-paper-muted">
        <code>{code}</code>
      </pre>
    </div>
  );
}
