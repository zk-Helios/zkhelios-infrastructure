# @zkhelios/api

Fastify backend for the zkHelios Solana dApp — SIWS auth, user management, and
(in later sessions) the indexer, proofs/transactions read APIs, and realtime WS.

## Stack

Fastify 4 · Prisma 5 / PostgreSQL 16 · Redis 7 · BullMQ · Zod (via
`fastify-type-provider-zod`) · Pino · JWT + httpOnly cookie · tweetnacl/bs58 (SIWS).

## Quick start

```bash
cp apps/api/.env.example apps/api/.env     # set AUTH_JWT_SECRET (>=32 chars)

# easiest: full stack via Docker (Postgres + Redis + API)
docker compose -f apps/api/docker-compose.yml up --build

# or run locally against your own Postgres + Redis:
pnpm --filter @zkhelios/db db:generate     # generate Prisma client
pnpm --filter @zkhelios/db db:migrate      # apply migrations
pnpm --filter @zkhelios/db db:seed         # circuits + admin user
pnpm --filter @zkhelios/api dev            # → http://localhost:4000  (docs at /docs)
```

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm --filter @zkhelios/api dev` | hot-reload dev server (tsx) |
| `pnpm --filter @zkhelios/api build` | compile to `dist/` |
| `pnpm --filter @zkhelios/api test` | unit tests (vitest) |
| `pnpm --filter @zkhelios/api type-check` | `tsc --noEmit` |
| `pnpm --filter @zkhelios/db db:*` | generate / migrate / seed / studio / reset |

## Endpoints

- **Health**: `GET /health`, `/health/live`, `/health/ready` (DB + Redis)
- **Auth (SIWS)**: `POST /api/auth/nonce`, `/api/auth/verify`, `/api/auth/logout`,
  `GET /api/auth/me`, `POST /api/auth/refresh`, `GET /api/auth/sessions`,
  `DELETE /api/auth/sessions/:id`, `DELETE /api/auth/sessions`
- **Users**: `GET/PATCH /api/users/me`, `GET /api/users/:pubkey`,
  `GET/POST /api/users/me/watched`, `DELETE /api/users/me/watched/:id`
- **OpenAPI**: Swagger UI at `/docs` (dev)

## Auth flow (SIWS)

`POST /nonce { pubkey }` → nonce (stored in Redis, 10-min TTL) → client builds the
SIWS message + signs → `POST /verify { message, signature, pubkey }` verifies the
ed25519 signature (tweetnacl), checks nonce/issuedAt/chainId, creates a `Session`,
and sets a JWT httpOnly cookie (jti = session id). Rate-limited (nonce 10/min,
verify 5/min); address locks after 10 failed verifies in 1h.

> Note: integration tests + a live server require Postgres + Redis (provided by
> `docker-compose.yml`). The SIWS verification logic is unit-tested without them.
