<p align="center">
  <img src=".github/banner.png" alt="zkHelios" width="640" />
</p>

<p align="center">
  <strong>Zero-knowledge proofs on Solana — prove what matters, reveal only what you choose.</strong>
</p>

zkHelios lets you generate a Groth16 proof client-side (balance, ownership,
membership, age, or a custom circuit) and verify it on-chain in a single Solana
slot. Public inputs stay public; everything else never leaves your device.

## Monorepo

| Path | Description |
| --- | --- |
| `apps/web` | Marketing site (Next.js 14) — port 3000 |
| `apps/dapp` | dApp: Wallet Adapter + SIWS auth, dashboard, prove/verify, explorer — port 3001 |
| `apps/docs` | Documentation site (Next.js 14) — port 3002 |
| `apps/api` | Fastify backend: auth, indexer, transactions/proofs/stats, realtime — port 4000 |
| `zkhelios/` | Anchor program (Rust) — on-chain Groth16 verifier via `alt_bn128` |
| `packages/ui`, `ui-tokens` | Shared design system (primitives + tokens) |
| `packages/sdk-ts` | `@zkhelios/sdk` — TypeScript client |
| `packages/idl` | Generated Anchor IDL + types |
| `packages/db`, `shared-types` | Prisma schema/client + shared API types |
| `packages/config-*` | Shared TS / ESLint config |
| `infra/` | Helm chart, Terraform, observability (Prometheus) |

## Stack

- **Frontend**: Next.js 14, Tailwind, Framer Motion, `@solana/wallet-adapter`, TanStack Query, Zustand
- **On-chain**: Anchor (Rust), Groth16 / BN254 via Solana `alt_bn128` syscalls
- **Backend**: Fastify, Prisma + PostgreSQL, Redis + BullMQ, SIWS auth (tweetnacl/ed25519)
- **Tooling**: pnpm workspaces + Turborepo, Vitest, Prometheus

## Getting started

```bash
# Node >= 18.17, pnpm 9
pnpm install

pnpm dev                      # all frontend apps (web/dapp/docs)
pnpm build                    # build everything
pnpm type-check
pnpm lint
```

### Backend (needs Postgres + Redis)

```bash
docker compose -f apps/api/docker-compose.yml up --build   # api on :4000, docs at /docs
```

### Anchor program

```bash
cd zkhelios
anchor build
cargo test            # litesvm integration tests
```

## Documentation

- [Architecture](ARCHITECTURE.md)
- [Security policy](SECURITY.md) · [Threat model](docs/threat-model.md)
- [Contributing](CONTRIBUTING.md)
- [Runbooks](docs/runbooks/) · [Launch checklist](LAUNCH.md)
- API setup & endpoints: [`apps/api/README.md`](apps/api/README.md)
- Program reference: [`zkhelios/README.md`](zkhelios/README.md)

## License

MIT
