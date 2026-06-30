import { z } from "zod";

/** Validates all env vars at startup; fails fast on invalid config. */
const EnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  HOST: z.string().default("0.0.0.0"),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),

  SOLANA_RPC_URL_MAINNET: z.string().url().default("https://api.mainnet-beta.solana.com"),
  SOLANA_RPC_URL_DEVNET: z.string().url().default("https://api.devnet.solana.com"),
  PROGRAM_ID: z.string().default("Ei5ZkTC2M631gSpBoz3wz8szq7rikrUgRbzfwQ353w8Q"),

  AUTH_JWT_SECRET: z.string().min(32, "AUTH_JWT_SECRET must be >= 32 chars"),
  AUTH_COOKIE_NAME: z.string().default("zkhelios_session"),
  AUTH_COOKIE_DOMAIN: z.string().optional(),
  SESSION_TTL_DAYS: z.coerce.number().int().positive().default(7),

  CORS_ORIGINS: z.string().default("http://localhost:3001,http://localhost:3000"),
  EXPECTED_DOMAIN: z.string().default("localhost:3001"),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues.map((i) => `  - ${i.path.join(".")}: ${i.message}`).join("\n");
    // eslint-disable-next-line no-console
    console.error(`Invalid environment configuration:\n${issues}`);
    process.exit(1);
  }
  cached = parsed.data;
  return cached;
}

export const corsOrigins = (env: Env): string[] =>
  env.CORS_ORIGINS.split(",").map((s) => s.trim()).filter(Boolean);
