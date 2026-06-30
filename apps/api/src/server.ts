import { randomUUID } from "node:crypto";
import Fastify, { type FastifyInstance } from "fastify";
import cookie from "@fastify/cookie";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import {
  serializerCompiler,
  validatorCompiler,
  jsonSchemaTransform,
  type ZodTypeProvider,
} from "fastify-type-provider-zod";

import { loadEnv, corsOrigins, type Env } from "./config/env";
import { errorHandler } from "./plugins/error-handler";
import { authPlugin } from "./plugins/auth";
import { healthRoutes } from "./modules/health/routes";
import { authRoutes } from "./modules/auth/routes";
import { userRoutes } from "./modules/users/routes";

export async function buildServer(envOverride?: Env): Promise<FastifyInstance> {
  const env = envOverride ?? loadEnv();
  const isDev = env.NODE_ENV === "development";

  const app = Fastify({
    logger: {
      level: isDev ? "debug" : "info",
      transport: isDev ? { target: "pino-pretty", options: { translateTime: "HH:MM:ss", ignore: "pid,hostname" } } : undefined,
      // Never log secrets.
      redact: ["req.headers.cookie", "req.headers.authorization", "*.signature", "*.privateInputs"],
    },
    genReqId: () => randomUUID(),
    trustProxy: true,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  // Security + infra plugins.
  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(cors, { origin: corsOrigins(env), credentials: true });
  await app.register(cookie);
  await app.register(rateLimit, { global: true, max: 1000, timeWindow: "1 minute" });

  // OpenAPI.
  await app.register(swagger, {
    openapi: {
      info: { title: "zkHelios API", version: "0.1.0", description: "Backend for the zkHelios Solana dApp." },
      servers: [{ url: `http://localhost:${env.PORT}` }],
    },
    transform: jsonSchemaTransform,
  });
  if (isDev) await app.register(swaggerUi, { routePrefix: "/docs" });

  await app.register(errorHandler);
  await app.register(authPlugin, { env });

  // Modules.
  await app.register(healthRoutes, { env });
  await app.register(authRoutes, { env, prefix: "/api/auth" });
  await app.register(userRoutes, { prefix: "/api/users" });

  return app;
}
