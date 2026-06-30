import { BorshCoder, EventParser } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { ZKHELIOS_IDL } from "@zkhelios/idl";

/** A decoded program event (normalized for the indexer handlers). */
export interface DecodedEvent {
  name: string;
  data: Record<string, unknown>;
}

let parser: EventParser | null = null;

function getParser(programId: string): EventParser {
  if (!parser) {
    // Cast: the @coral-xyz/anchor coder type lags the generated 1.x IDL shape.
    const coder = new BorshCoder(ZKHELIOS_IDL as never);
    parser = new EventParser(new PublicKey(programId), coder);
  }
  return parser;
}

/** Parse Anchor events out of a transaction's program logs. Never throws. */
export function parseEvents(logs: string[], programId: string): DecodedEvent[] {
  try {
    const out: DecodedEvent[] = [];
    for (const evt of getParser(programId).parseLogs(logs)) {
      out.push({ name: evt.name, data: evt.data as Record<string, unknown> });
    }
    return out;
  } catch {
    return [];
  }
}
