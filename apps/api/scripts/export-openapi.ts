import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

/** Boot the Fastify app (no DB/Redis connection at registration) and dump its
 *  OpenAPI spec to apps/docs/public/openapi.json for the docs site + codegen. */
async function main() {
  process.env.NODE_ENV = "production"; // skip swagger-ui / pino-pretty
  process.env.AUTH_JWT_SECRET ??= "openapi_export_dummy_secret_min_32_chars";
  process.env.DATABASE_URL ??= "postgresql://localhost:5432/zkhelios";

  const { buildServer } = await import("../src/server");
  const app = await buildServer();
  await app.ready();
  const spec = app.swagger();
  await app.close();

  const out = resolve(__dirname, "../../docs/public/openapi.json");
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, JSON.stringify(spec, null, 2));
  // eslint-disable-next-line no-console
  console.log(`Wrote ${out} (${Object.keys((spec as { paths?: object }).paths ?? {}).length} paths)`);
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
