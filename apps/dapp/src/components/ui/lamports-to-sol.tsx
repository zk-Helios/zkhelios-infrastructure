import { cn, formatSol } from "@/lib/utils";

interface Props {
  lamports: number | bigint;
  /** Show the "SOL" suffix. */
  withSymbol?: boolean;
  className?: string;
}

/** Renders a lamports value as SOL with adaptive precision. */
export function LamportsToSol({ lamports, withSymbol = true, className }: Props) {
  const sol = formatSol(Number(lamports), { fromLamports: true });
  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {sol}
      {withSymbol && <span className="ml-1 text-paper-faint">SOL</span>}
    </span>
  );
}
