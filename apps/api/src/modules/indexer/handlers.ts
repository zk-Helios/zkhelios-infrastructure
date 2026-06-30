import type Redis from "ioredis";
import { prisma as defaultPrisma, type PrismaClient, type ProofType } from "@zkhelios/db";
import { Channels, publish } from "../../lib/pubsub";
import { normalizeProofType, toBase58, toBigInt } from "./normalize";

export interface IndexerCtx {
  prisma: PrismaClient;
  redis: Redis;
}

/** ProofVerified event → upsert ProofRecord + publish. */
export async function handleProofVerified(
  raw: Record<string, unknown>,
  signature: string,
  ctx: IndexerCtx = { prisma: defaultPrisma as unknown as PrismaClient, redis: undefined as never },
) {
  const authority = toBase58(raw.authority);
  const proofAccount = toBase58(raw.proofAccount);
  const circuitId = Number(raw.circuitId ?? 0);
  const proofType: ProofType = normalizeProofType(raw.proofType);
  const slotVerified = toBigInt(raw.slot);

  const circuit = await ctx.prisma.circuit.findUnique({ where: { id: circuitId } });
  const user = await ctx.prisma.user.findUnique({ where: { pubkey: authority }, select: { id: true } });

  await ctx.prisma.proofRecord.upsert({
    where: { proofAccount },
    update: { verified: true, slotVerified, revoked: false },
    create: {
      proofAccount,
      signature,
      authority,
      circuitId,
      circuitName: circuit?.name ?? `circuit_${circuitId}`,
      proofType,
      publicInputs: {},
      proofData: "",
      verified: true,
      verifiedAt: new Date(),
      slotVerified,
      userId: user?.id,
    },
  });

  if (ctx.redis) {
    const payload = { proofAccount, authority, circuitId, proofType, slot: slotVerified.toString() };
    await publish(ctx.redis, Channels.proofsNew, payload);
    await publish(ctx.redis, Channels.userProofs(authority), payload);
  }
}

/** ProofRevoked event → mark revoked + publish. */
export async function handleProofRevoked(raw: Record<string, unknown>, ctx: IndexerCtx) {
  const proofAccount = toBase58(raw.proofAccount);
  const authority = toBase58(raw.authority);
  await ctx.prisma.proofRecord.updateMany({
    where: { proofAccount },
    data: { verified: false, revoked: true, revokedAt: new Date() },
  });
  if (ctx.redis) await publish(ctx.redis, Channels.proofsRevoked, { proofAccount, authority });
}

/** CircuitRegistered event → upsert Circuit + publish. */
export async function handleCircuitRegistered(raw: Record<string, unknown>, slot: bigint, ctx: IndexerCtx) {
  const id = Number(raw.circuitId ?? 0);
  const name = String(raw.name ?? `circuit_${id}`);
  await ctx.prisma.circuit.upsert({
    where: { id },
    update: { name },
    create: { id, name, proofType: "CUSTOM", publicInputCount: 1, verifyingKey: "", registeredSlot: slot },
  });
  if (ctx.redis) await publish(ctx.redis, Channels.circuitsNew, { id, name });
}

/** Dispatch a decoded event by name. */
export async function dispatchEvent(
  name: string,
  data: Record<string, unknown>,
  signature: string,
  slot: bigint,
  ctx: IndexerCtx,
) {
  switch (name) {
    case "ProofVerified":
      return handleProofVerified(data, signature, ctx);
    case "ProofRevoked":
      return handleProofRevoked(data, ctx);
    case "CircuitRegistered":
      return handleCircuitRegistered(data, slot, ctx);
    default:
      return;
  }
}
