import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { z } from "zod";
import { ProofService } from "./service";

const ProofTypeEnum = z.enum(["BALANCE", "OWNERSHIP", "AGE", "MEMBERSHIP", "CUSTOM"]);
const ListQuery = z.object({
  authority: z.string().optional(),
  type: ProofTypeEnum.optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export async function proofRoutes(fastify: FastifyInstance) {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const service = new ProofService();

  app.get("/", { schema: { querystring: ListQuery, tags: ["proofs"] } }, async (req) => ({
    ok: true,
    ...(await service.list(req.query)),
  }));

  app.get(
    "/me",
    { preHandler: app.authenticate, schema: { querystring: ListQuery, tags: ["proofs"] } },
    async (req) => ({ ok: true, ...(await service.list({ ...req.query, authority: req.user!.pubkey })) }),
  );

  app.get(
    "/by-circuit/:circuitId",
    { schema: { params: z.object({ circuitId: z.coerce.number().int() }), querystring: ListQuery, tags: ["proofs"] } },
    async (req) => ({ ok: true, ...(await service.list({ ...req.query, circuitId: req.params.circuitId })) }),
  );

  app.get(
    "/:proofAccount",
    { schema: { params: z.object({ proofAccount: z.string().min(32).max(44) }), tags: ["proofs"] } },
    async (req) => ({ ok: true, proof: await service.getByAccount(req.params.proofAccount) }),
  );
}
