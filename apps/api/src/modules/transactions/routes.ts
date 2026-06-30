import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { TransactionService } from "./service";
import { toCsv } from "../../utils/csv";

const ListQuery = z.object({
  pubkey: z.string().optional(),
  status: z.enum(["SUCCESS", "FAILED"]).optional(),
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function transactionRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const service = new TransactionService();

  app.get("/", { schema: { querystring: ListQuery, tags: ["transactions"] } }, async (req) => ({
    ok: true,
    ...(await service.list(req.query)),
  }));

  app.get(
    "/me",
    { preHandler: app.authenticate, schema: { querystring: ListQuery, tags: ["transactions"] } },
    async (req) => ({ ok: true, ...(await service.list({ ...req.query, pubkey: req.user!.pubkey })) }),
  );

  app.get(
    "/me/export",
    { preHandler: app.authenticate, schema: { tags: ["transactions"] } },
    async (req, reply) => {
      const rows = await service.allForPubkey(req.user!.pubkey);
      const csv = toCsv(
        ["signature", "slot", "blockTime", "feeLamports", "feePayer", "status", "computeUnits"],
        rows.map((r) => [r.signature, r.slot, r.blockTime, r.fee, r.feePayer, r.status, r.computeUnits]),
      );
      reply
        .header("Content-Type", "text/csv")
        .header("Content-Disposition", `attachment; filename="zkhelios-transactions.csv"`)
        .send(csv);
    },
  );

  app.get(
    "/:signature",
    { schema: { params: z.object({ signature: z.string().min(32).max(120) }), tags: ["transactions"] } },
    async (req) => ({ ok: true, transaction: await service.getBySignature(req.params.signature) }),
  );
}
