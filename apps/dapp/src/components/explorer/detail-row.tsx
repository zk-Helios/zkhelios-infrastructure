export function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-caption text-paper-faint">{label}</dt>
      <dd className="min-w-0 break-all text-right text-caption text-paper">{children}</dd>
    </div>
  );
}
