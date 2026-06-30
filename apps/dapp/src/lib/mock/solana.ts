import { faker } from "@faker-js/faker";
import type {
  Transaction,
  Proof,
  ProofKind,
  TxType,
  TxStatus,
  OverviewStats,
  TimeseriesPoint,
  Announcement,
  TimeRange,
} from "@/types";
import { LAMPORTS_PER_SOL } from "@/lib/solana";

/**
 * Deterministic Solana-flavored mock data. Seeded so demos are reproducible.
 * Stands in for the indexer/backend until Sessions 7–8 — signatures/pubkeys are
 * real-looking base58, amounts respect lamport precision.
 */

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

function base58(len: number): string {
  let out = "";
  for (let i = 0; i < len; i++) out += B58[faker.number.int({ min: 0, max: B58.length - 1 })];
  return out;
}

export const makePubkey = () => base58(44);
export const makeSignature = () => base58(88);

const PROOF_KINDS: ProofKind[] = ["balance", "ownership", "age", "membership", "custom"];
const TX_TYPES: TxType[] = ["transfer", "proof", "program-call"];
const CIRCUIT_BY_KIND: Record<ProofKind, string> = {
  balance: "balance_proof",
  ownership: "ownership_proof",
  age: "age_proof",
  membership: "membership_proof",
  custom: "custom_circuit",
};

/** Mock SPL tokens with Metaplex-style metadata + a stub USD price. */
export const MOCK_TOKENS = [
  { mint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", symbol: "USDC", name: "USD Coin", decimals: 6, usdPrice: 1 },
  { mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263", symbol: "BONK", name: "Bonk", decimals: 5, usdPrice: 0.0000236 },
  { mint: "JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN", symbol: "JUP", name: "Jupiter", decimals: 6, usdPrice: 0.78 },
] as const;

const CURRENT_SLOT = 287_400_000;
const SLOTS_PER_EPOCH = 432_000;

function seeded<T>(seed: number, fn: () => T): T {
  faker.seed(seed);
  return fn();
}

function buildTransactions(count: number): Transaction[] {
  return seeded(1337, () => {
    const now = Date.UTC(2026, 5, 30, 3, 0, 0); // fixed reference for determinism
    return Array.from({ length: count }, (_, i) => {
      const type = faker.helpers.arrayElement(TX_TYPES);
      const status: TxStatus = faker.number.int({ min: 0, max: 100 }) > 6 ? "success" : "failed";
      const blockTime = now - i * faker.number.int({ min: 4 * 60_000, max: 90 * 60_000 });
      const slot = CURRENT_SLOT - i * faker.number.int({ min: 120, max: 900 });
      const programIds = [base58(44)];
      if (type === "proof") programIds.push(base58(44));
      return {
        signature: makeSignature(),
        type,
        status,
        feePayer: makePubkey(),
        fee: faker.number.int({ min: 5_000, max: 35_000 }),
        instructionCount: faker.number.int({ min: 1, max: type === "proof" ? 4 : 2 }),
        computeUnits:
          type === "proof"
            ? faker.number.int({ min: 180_000, max: 260_000 })
            : faker.number.int({ min: 1_200, max: 40_000 }),
        slot,
        blockTime,
        programIds,
        proofAccount: type === "proof" ? makePubkey() : undefined,
      } satisfies Transaction;
    });
  });
}

function buildProofs(count: number): Proof[] {
  return seeded(7777, () => {
    const now = Date.UTC(2026, 5, 30, 3, 0, 0);
    return Array.from({ length: count }, (_, i) => {
      const kind = faker.helpers.arrayElement(PROOF_KINDS);
      const verified = faker.number.int({ min: 0, max: 100 }) > 12;
      const createdAt = now - i * faker.number.int({ min: 20 * 60_000, max: 6 * 60 * 60_000 });
      return {
        id: base58(16),
        proofAccount: makePubkey(),
        kind,
        status: verified ? "verified" : faker.helpers.arrayElement(["pending", "failed"] as const),
        circuitName: CIRCUIT_BY_KIND[kind],
        authority: makePubkey(),
        publicInputs: { threshold: String(faker.number.int({ min: 1, max: 1000 })) },
        createdAt,
        verifiedAt: verified ? createdAt + 1500 : undefined,
        slotVerified: verified ? CURRENT_SLOT - i * 300 : undefined,
        computeUnits: faker.number.int({ min: 180_000, max: 260_000 }),
      } satisfies Proof;
    });
  });
}

/** Module-level singletons (built once). */
export const MOCK_TRANSACTIONS = buildTransactions(140);
export const MOCK_PROOFS = buildProofs(48);

/** Live-ish network overview snapshot (base values; realtime hook jitters them). */
export function makeOverviewStats(): OverviewStats {
  return seeded(99, () => ({
    tps: faker.number.int({ min: 2400, max: 3600 }),
    slot: CURRENT_SLOT,
    epoch: 642,
    slotInEpoch: faker.number.int({ min: 0, max: SLOTS_PER_EPOCH }),
    totalProofs: 2_481_004,
    proofs24h: faker.number.int({ min: 8_000, max: 14_000 }),
    avgVerifyTimeMs: faker.number.int({ min: 380, max: 460 }),
    activeUsers24h: faker.number.int({ min: 3_000, max: 5_200 }),
    rpcLatencyMs: faker.number.int({ min: 40, max: 120 }),
    status: "online",
  }));
}

/** Timeseries for the proofs-over-time chart. */
export function makeProofsTimeseries(range: TimeRange): TimeseriesPoint[] {
  const points = range === "24h" ? 24 : range === "7d" ? 7 : 30;
  const stepMs = range === "24h" ? 3_600_000 : 86_400_000;
  const end = Date.UTC(2026, 5, 30, 3, 0, 0);
  return seeded(range === "24h" ? 11 : range === "7d" ? 22 : 33, () =>
    Array.from({ length: points }, (_, i) => ({
      t: end - (points - 1 - i) * stepMs,
      value: faker.number.int({ min: range === "24h" ? 200 : 5_000, max: range === "24h" ? 900 : 14_000 }),
    })),
  );
}

/** Average CU per proof type (bar chart). */
export function makeCuByType(): { kind: ProofKind; cu: number }[] {
  return seeded(44, () =>
    PROOF_KINDS.map((kind) => ({ kind, cu: faker.number.int({ min: 185_000, max: 255_000 }) })),
  );
}

/** Proof type distribution (donut). */
export function makeProofDistribution(): { kind: ProofKind; count: number }[] {
  return seeded(55, () =>
    PROOF_KINDS.map((kind) => ({ kind, count: faker.number.int({ min: 120, max: 1400 }) })),
  );
}

/** Small sparkline series for stat cards. */
export function makeSparkline(seed: number, points = 16): number[] {
  return seeded(seed, () => Array.from({ length: points }, () => faker.number.int({ min: 20, max: 100 })));
}

export function makeAnnouncements(): Announcement[] {
  return seeded(88, () => [
    {
      id: base58(8),
      title: "Mainnet beta is live",
      body: "Shielded proof verification is now available on Solana mainnet-beta.",
      date: Date.UTC(2026, 5, 28),
      tag: "Release",
    },
    {
      id: base58(8),
      title: "New circuit: age_proof v2",
      body: "Prove wallet age with 18% lower compute. Auto-enabled for all users.",
      date: Date.UTC(2026, 5, 25),
      tag: "Circuit",
    },
    {
      id: base58(8),
      title: "Audit complete",
      body: "The zkHelios verifier program passed its external security audit.",
      date: Date.UTC(2026, 5, 20),
      tag: "Security",
    },
  ]);
}

export { LAMPORTS_PER_SOL };
