import { buildServer } from "./server";
import { loadEnv } from "./config/env";
import { closeRedis } from "./lib/redis";
import { prisma } from "@zkhelios/db";

async function main() {
  const env = loadEnv();
  const app = await buildServer(env);

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, "shutting down");
    await app.close();
    await closeRedis();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));

  await app.listen({ port: env.PORT, host: env.HOST });
  app.log.info(`zkHelios API listening on :${env.PORT} (docs at /docs in dev)`);
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server:", err);
  process.exit(1);
});
