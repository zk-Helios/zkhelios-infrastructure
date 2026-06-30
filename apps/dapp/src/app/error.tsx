"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@zkhelios/ui";

/** Route-level error boundary. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // In production this would report to Sentry (Session 5 polish).
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-md flex-col items-center rounded-xl border border-status-error/30 bg-ink-800 px-6 py-14 text-center">
      <span className="grid size-14 place-items-center rounded-full border border-status-error/40 bg-status-error/10 text-status-error">
        <AlertTriangle className="size-6" />
      </span>
      <h2 className="mt-6 font-display text-h4 font-semibold text-paper">Something broke</h2>
      <p className="mt-2 max-w-sm text-body text-paper-muted">
        An unexpected error occurred while rendering this page. You can retry — if it persists,
        the issue has been logged.
      </p>
      <Button className="mt-7" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
