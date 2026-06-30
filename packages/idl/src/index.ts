/**
 * Generated zkHelios program IDL + types. Source of truth is the Anchor program
 * in `zkhelios/` — regenerate via `anchor build` and copy `target/idl` +
 * `target/types` here (see scripts/sync-idl). Consumed by apps/dapp to replace
 * the placeholder MOCK_IDL in `lib/anchor.ts`.
 */
import idl from "../zkhelios.json";
import type { Zkhelios } from "./zkhelios";

export type { Zkhelios } from "./zkhelios";
export const ZKHELIOS_IDL = idl as Zkhelios;
export const PROGRAM_ID = idl.address;
