import { prisma, type Prisma, type ProofType } from "@zkhelios/db";
import { clampLimit, decodeCursor, encodeCursor, type Page } from "../../lib/pagination";
import { NotFoundError } from "../../utils/errors";

function serialize(p: {
  proofAccount: string;
  signature: string;
  authority: string;
  circuitId: number;
  circuitName: string;
  proofType: ProofType;
  publicInputs: unknown;
  verified: boolean;
  verifiedAt: Date;
  slotVerified: bigint;
  revoked: boolean;
}) {
  return {
    proofAccount: p.proofAccount,
    signature: p.signature,
    authority: p.authority,
    circuitId: p.circuitId,
    circuitName: p.circuitName,
    proofType: p.proofType,
    publicInputs: p.publicInputs,
    verified: p.verified,
    verifiedAt: p.verifiedAt.toISOString(),
    slotVerified: p.slotVerified.toString(),
    revoked: p.revoked,
  };
}

export interface ProofFilters {
  authority?: string;
  type?: ProofType;
  circuitId?: number;
  cursor?: string;
  limit?: number;
}

export class ProofService {
  async list(filters: ProofFilters): Promise<Page<ReturnType<typeof serialize>>> {
    const limit = clampLimit(filters.limit);
    const where: Prisma.ProofRecordWhereInput = {};
    if (filters.authority) where.authority = filters.authority;
    if (filters.type) where.proofType = filters.type;
    if (filters.circuitId !== undefined) where.circuitId = filters.circuitId;

    const cursor = decodeCursor(filters.cursor);
    const [total, rows] = await Promise.all([
      prisma.proofRecord.count({ where }),
      prisma.proofRecord.findMany({
        where,
        orderBy: { slotVerified: "desc" },
        take: limit + 1,
        ...(cursor ? { cursor: { proofAccount: cursor }, skip: 1 } : {}),
      }),
    ]);
    const hasMore = rows.length > limit;
    const items = rows.slice(0, limit);
    const nextCursor = hasMore ? encodeCursor(items[items.length - 1].proofAccount) : null;
    return { items: items.map(serialize), nextCursor, total };
  }

  async getByAccount(proofAccount: string) {
    const p = await prisma.proofRecord.findUnique({ where: { proofAccount } });
    if (!p) throw new NotFoundError("Proof not found");
    return serialize(p);
  }
}
