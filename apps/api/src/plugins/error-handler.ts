import fp from "fastify-plugin";
import { ZodError } from "zod";
import { AppError } from "../utils/errors";

/** Converts thrown errors into a consistent `{ ok:false, code, error }` JSON. */
export const errorHandler = fp(async (fastify) => {
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.code(error.statusCode).send({ ok: false, code: error.code, error: error.message });
    }
    if (error instanceof ZodError) {
      const detail = error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
      return reply.code(400).send({ ok: false, code: "VALIDATION_FAILED", error: detail });
    }
    // Fastify validation errors (schema)
    if ((error as { validation?: unknown }).validation) {
      return reply.code(400).send({ ok: false, code: "VALIDATION_FAILED", error: error.message });
    }
    if ((error as { statusCode?: number }).statusCode === 429) {
      return reply.code(429).send({ ok: false, code: "RATE_LIMITED", error: "Too many requests" });
    }

    request.log.error({ err: error }, "unhandled error");
    const body: Record<string, unknown> = { ok: false, code: "INTERNAL", error: "Internal server error" };
    if (process.env.NODE_ENV !== "production") body.stack = error.stack;
    return reply.code(500).send(body);
  });

  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({ ok: false, code: "NOT_FOUND", error: `Route ${request.method} ${request.url} not found` });
  });
});
