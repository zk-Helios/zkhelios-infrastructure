# Contributing to zkHelios

## Prerequisites

- Node ≥ 18.17, pnpm 9
- For the program: Rust 1.89 (via rust-toolchain), Solana CLI, Anchor 1.1.x
  (`export PATH="$HOME/.cargo/bin:$HOME/.local/share/solana/install/active_release/bin:$PATH"`)
- For the backend: Docker (Postgres + Redis) — `docker compose -f apps/api/docker-compose.yml up`

## Workflow

```bash
pnpm install
pnpm dev            # turbo: all JS apps
pnpm type-check     # all packages
pnpm lint
pnpm build
```

- **Conventional commits** (`feat:`, `fix:`, `chore:`…); keep the working tree green.
- Each app/package owns its module pattern; reuse `packages/ui`, `packages/ui-tokens`,
  `packages/config-*`.
- CI must pass: `api.yml`, `anchor.yml`, and the JS `ci.yml` (lint · type-check · test · build).

## Tests

- JS unit: `pnpm --filter <pkg> test` (vitest)
- Program: `cd zkhelios && cargo test` (litesvm)
- Integration (Docker): `pnpm --filter @zkhelios/api test:integration`
- E2E: `npx playwright test` · Load: `k6 run apps/api/tests/load/k6.js`

## Project layout

See [`ARCHITECTURE.md`](ARCHITECTURE.md). Do not put work in `reference/`; brand
assets live in `public/Assets`.
