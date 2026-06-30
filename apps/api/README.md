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
- **Transactions** (S8): `GET /api/transactions` (filters+cursor), `/:signature`,
  `/me`, `/me/export` (CSV)
- **Proofs** (S8): `GET /api/proofs`, `/:proofAccount`, `/me`, `/by-circuit/:id`
- **Circuits** (S8): `GET /api/circuits`, `/:id`; admin `POST /:id/enable|disable`
- **Stats** (S8): `GET /api/stats/overview|network|timeseries|leaderboard`
- **Blocks** (S8): `GET /api/blocks`, `/:slot`
- **Search** (S8): `GET /api/search?q=` (signature/pubkey/proof/slot)
- **Prices** (S8): `GET /api/prices?mints=` (Jupiter, cached)
- **Webhook** (S8): `POST /webhooks/helius`
- **Realtime** (S8): `WS /ws` — channels `stats`, `proofs`, `address:{pubkey}:txs`,
  `user:proofs`, `user:notifications`
- **Notifications** (S9): `GET /api/notifications`, `POST /:id/read`, `/read-all`,
  `DELETE /:id`, `GET/PATCH /preferences`, `POST /email/verify-start|verify-confirm`,
  `POST/DELETE /push/subscribe`
- **Admin** (S9, requireAdmin): `POST /api/admin/announcements`, `GET /users`,
  `POST /users/:pubkey/lock|unlock`, `GET /queues`, `GET /stats`, `GET /health/detailed`
- **Metrics** (S9): Prometheus at `GET /metrics`
- **Workers**: `indexer` (S8), `worker:stats` (S8), `worker:notifications` (S9),
  `worker:scheduled` (S9, BullMQ repeatable: session cleanup / digest / circuit resync)
- **OpenAPI**: Swagger UI at `/docs` (dev)

## Auth flow (SIWS)

`POST /nonce { pubkey }` → nonce (stored in Redis, 10-min TTL) → client builds the
SIWS message + signs → `POST /verify { message, signature, pubkey }` verifies the
ed25519 signature (tweetnacl), checks nonce/issuedAt/chainId, creates a `Session`,
and sets a JWT httpOnly cookie (jti = session id). Rate-limited (nonce 10/min,
verify 5/min); address locks after 10 failed verifies in 1h.

> Note: integration tests + a live server require Postgres + Redis (provided by
> `docker-compose.yml`). The SIWS verification logic is unit-tested without them.
