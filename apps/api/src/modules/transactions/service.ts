import { prisma, type Prisma, type TxStatus } from "@zkhelios/db";
import { clampLimit, decodeCursor, encodeCursor, type Page } from "../../lib/pagination";
import { NotFoundError } from "../../utils/errors";

export interface TxFilters {
  pubkey?: string;
  status?: TxStatus;
  fromDate?: string;
  toDate?: string;
  cursor?: string;
  limit?: number;
}

/** Serialize BigInt fields for JSON. */
function serialize(tx: {
  signature: string;
  slot: bigint;
  blockTime: Date | null;
  fee: bigint;
  feePayer: string;
  status: TxStatus;
  computeUnits: number | null;
  programIds: string[];
}) {
  return {
    signature: tx.signature,
    slot: tx.slot.toString(),
    blockTime: tx.blockTime?.toISOString() ?? null,
    fee: tx.fee.toString(),
    feePayer: tx.feePayer,
    status: tx.status,
    computeUnits: tx.computeUnits,
    programIds: tx.programIds,
  };
}

export class TransactionService {
  async list(filters: TxFilters): Promise<Page<ReturnType<typeof serialize>>> {
    const limit = clampLimit(filters.limit);
    const where: Prisma.TransactionWhereInput = {};
    if (filters.pubkey) where.OR = [{ feePayer: filters.pubkey }, { instructions: { some: { accounts: { has: filters.pubkey } } } }];
    if (filters.status) where.status = filters.status;
    if (filters.fromDate || filters.toDate) {
      where.blockTime = {};
      if (filters.fromDate) (where.blockTime as Prisma.DateTimeFilter).gte = new Date(filters.fromDate);
      if (filters.toDate) (where.blockTime as Prisma.DateTimeFilter).lte = new Date(filters.toDate);
    }

    const cursorSig = decodeCursor(filters.cursor);
    const [total, rows] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        orderBy: { slot: "desc" },
        take: limit + 1,
        ...(cursorSig ? { cursor: { signature: cursorSig }, skip: 1 } : {}),
      }),
    ]);

    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].signature) : null;
    return { items: items.map(serialize), nextCursor, total };
  }

  async getBySignature(signature: string) {
    const tx = await prisma.transaction.findUnique({
      where: { signature },
      include: { instructions: { orderBy: { index: "asc" } } },
    });
    if (!tx) throw new NotFoundError("Transaction not found");
    return {
      ...serialize(tx),
      errorMessage: tx.errorMessage,
      logs: tx.rawLogs,
      instructions: tx.instructions.map((ix) => ({
        index: ix.index,
        programId: ix.programId,
        accounts: ix.accounts,
        decoded: ix.decoded,
      })),
    };
  }

  /** All rows for a pubkey, for CSV export (no pagination). */
  async allForPubkey(pubkey: string) {
    const rows = await prisma.transaction.findMany({
      where: { OR: [{ feePayer: pubkey }, { involvesUserId: pubkey }] },
      orderBy: { slot: "desc" },
      take: 10_000,
    });
    return rows.map(serialize);
  }
}
