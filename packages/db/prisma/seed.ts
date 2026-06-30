import { PrismaClient, ProofType } from "@prisma/client";

const prisma = new PrismaClient();

const CIRCUITS: { id: number; name: string; proofType: ProofType; publicInputCount: number }[] = [
  { id: 1, name: "balance_proof", proofType: ProofType.BALANCE, publicInputCount: 2 },
  { id: 2, name: "ownership_proof", proofType: ProofType.OWNERSHIP, publicInputCount: 1 },
  { id: 3, name: "age_proof", proofType: ProofType.AGE, publicInputCount: 1 },
  { id: 4, name: "membership_proof", proofType: ProofType.MEMBERSHIP, publicInputCount: 1 },
  { id: 5, name: "custom_circuit", proofType: ProofType.CUSTOM, publicInputCount: 1 },
];

async function main() {
  // Circuits (mirror the on-chain registry).
  for (const c of CIRCUITS) {
    await prisma.circuit.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id,
        name: c.name,
        proofType: c.proofType,
        publicInputCount: c.publicInputCount,
        verifyingKey: "00".repeat(448 + 64 * (c.publicInputCount + 1)),
        registeredSlot: 287_000_000n,
      },
    });
  }

  // Test admin user.
  await prisma.user.upsert({
    where: { pubkey: "6mYze8X5UWc1nStmFQuDgR7Q8HJjzNqe6Jy6DLbQrnCt" },
    update: { role: "ADMIN" },
    create: {
      pubkey: "6mYze8X5UWc1nStmFQuDgR7Q8HJjzNqe6Jy6DLbQrnCt",
      role: "ADMIN",
      displayName: "zkhelios_admin",
    },
  });

  console.log(`Seeded ${CIRCUITS.length} circuits + admin user.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
