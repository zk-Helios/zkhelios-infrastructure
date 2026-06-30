"use client";

import { cn, formatAmount, formatUsd } from "@/lib/utils";

interface TokenAmountInputProps {
  value: string;
  onChange: (value: string) => void;
  symbol: string;
  /** Wallet balance for this token (human units). */
  balance?: number;
  /** USD price per token, for the secondary value display. */
  usdPrice?: number;
  disabled?: boolean;
  className?: string;
}

/** Amount field with MAX button, balance readout, and live USD value. */
export function TokenAmountInput({
  value,
  onChange,
  symbol,
  balance,
  usdPrice,
  disabled,
  className,
}: TokenAmountInputProps) {
  const numeric = Number(value) || 0;
  const usd = usdPrice ? numeric * usdPrice : undefined;

  const handleChange = (raw: string) => {
    // allow only a valid decimal number
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) onChange(raw);
  };

  return (
    <div
      className={cn(
        "rounded-lg border border-ink-400 bg-ink-900 p-4 transition-colors focus-within:border-amber-500/50",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <input
          inputMode="decimal"
          placeholder="0.0"
          value={value}
          disabled={disabled}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full bg-transparent font-display text-h4 font-semibold text-paper outline-none placeholder:text-ink-300 disabled:opacity-50"
          aria-label={`${symbol} amount`}
        />
        <span className="shrink-0 rounded-md border border-ink-400 bg-ink-800 px-3 py-1.5 font-mono text-caption font-semibold text-paper">
          {symbol}
        </span>
      </div>
      <div className="mt-2 flex items-center justify-between text-caption text-paper-faint">
        <span>{usd !== undefined ? formatUsd(usd) : " "}</span>
        {balance !== undefined && (
          <span className="flex items-center gap-2">
            <span>
              Balance: {formatAmount(balance)} {symbol}
            </span>
            <button
              type="button"
              disabled={disabled}
              onClick={() => onChange(String(balance))}
              className="rounded bg-amber-500/15 px-1.5 py-0.5 font-semibold text-amber-400 transition-colors hover:bg-amber-500/25 disabled:opacity-50"
            >
              MAX
            </button>
          </span>
        )}
      </div>
    </div>
  );
}
