# zkHelios

> Zero-Knowledge proofs. Solana speed.

A **Solana dApp with zero-knowledge proofs** — prove balance, ownership,
membership, or age and verify it on-chain, revealing only what you choose.
Built in sequential sessions per `reference/zkhelios-solana-prompts.md`.

> **Note:** an earlier build (EVM/rollup) was pivoted to Solana on 2026-06-30.
> The old `reference/zkhelios-build-prompts.md` (EVM) is superseded — use the
> Solana pack.

**Solana Session 1 — Foundation, Design System & Marketing Landing — ✅**
**Solana Session 2 — dApp Shell, Wallet Adapter & SIWS Auth — ✅**
**Solana Session 3 — Dashboard, Transaction History & Real-Time Data — ✅**
**Solana Session 4 — Prove & Verify (client-side ZK + on-chain submit) — ✅**
**Solana Session 5 — Explorer, Docs Site & Production Polish — ✅ (frontend track complete)**
**Solana Session 6 — Anchor Verifier Program (real Groth16 / alt_bn128) — ✅**

## Monorepo layout

```
zkhelios/                    # pnpm workspaces + Turborepo
├─ apps/
│  ├─ web/                   # Next.js 14 marketing site (port 3000)
│  ├─ dapp/                  # Next.js 14 dApp — Wallet Adapter + SIWS (port 3001)
│  └─ docs/                  # Next.js 14 docs site (port 3002)
├─ packages/
│  ├─ ui/                    # Shared React primitives (Button, Card, Logo, …)
│  ├─ ui-tokens/             # Design tokens + Tailwind preset
│  ├─ sdk-ts/                # @zkhelios/sdk — TypeScript SDK (proofs/format/share/client)
│  ├─ idl/                   # @zkhelios/idl — generated Anchor IDL + TS types (S6)
│  ├─ config-tsconfig/       # Shared TS configs (@zkhelios/tsconfig)
│  └─ config-eslint/         # Shared ESLint config (@zkhelios/eslint-config)
├─ zkhelios/                 # Anchor workspace — on-chain Groth16 verifier (Rust, S6)
│  └─ programs/zkhelios/     #   alt_bn128 verifier + tests (litesvm + arkworks)
├─ .github/workflows/        # CI (lint · type-check · test · build)
├─ public/Assets/            # Source brand assets
└─ reference/                # Build prompt packs (do not put work here)
```

Planned (later sessions): `apps/api` + `packages/db` / `shared-types` (S7+).

## Quick start

```bash
# Node >= 18.17, pnpm 9
pnpm install
pnpm dev                 # turbo: runs all apps
pnpm dev:web             # web  → http://localhost:3000
pnpm dev:dapp            # dApp → http://localhost:3001
pnpm build               # turbo build (both apps green)
pnpm lint
pnpm type-check
```

## Stack

- **web**: Next.js 14 · TS strict · Tailwind · Framer Motion · Lenis · Sonner
- **dapp**: + `@solana/web3.js` · `@solana/wallet-adapter-*` · `@coral-xyz/anchor`
  · `@solana/spl-token` · TanStack Query · Zustand · `tweetnacl`/`bs58` (SIWS) · iron-session
- **brand** (chain-agnostic): solar amber `#F5A524` on black, 8-ray sun + hex `zk` mark,
  Space Grotesk / Inter / JetBrains Mono, dark mode only

---

## HANDOFF NOTES → Solana Session 3 (Dashboard, Tx History & Real-Time Data)

### What Sessions 1–2 deliver

- **Tooling**: Turborepo + shared `@zkhelios/tsconfig` / `@zkhelios/eslint-config`.
- **web**: full Solana-positioned landing (hero "Zero-Knowledge proofs. Solana speed.",
  stats, features, Commit·Prove·Verify, technology (Groth16/~200k CU), **Use Cases**,
  ecosystem, roadmap Genesis→Eclipse, TS-SDK developer mockup, footer X/Discord/GitHub/Mirror).
- **dapp wallet**: Wallet Adapter (Standard Wallets auto-detect Phantom/Solflare/Backpack),
  cluster switcher localnet/devnet/mainnet-beta (persisted), custom wallet button
  (address + SOL + dropdown), brand-themed wallet modal.
- **dapp auth (SIWS)**: ed25519 message signing verified with `tweetnacl` + iron-session;
  mock routes `/api/auth/{nonce,verify,me,logout}` — **verified end-to-end** (valid sig
  accepted, tampered sig rejected). Hooks `useAuth`/`useRequireAuth`/`useSignOut`/
  `useSolanaConnection`; stores `useAuthStore`/`useUIStore`/`useNotificationStore`/`useClusterStore`.
- **dapp shell**: sidebar (Dashboard/Prove/Verify/Transactions/Explorer/Settings) + mobile drawer,
  topbar (breadcrumb, cluster switcher, notifications, wallet), footer (live slot + TPS +
  "Powered by Solana"). Settings functional (cluster, RPC override, sign-out).
- **dapp Solana components**: `PublicKeyDisplay`, `TransactionSignatureDisplay`, `LamportsToSol`,
  `NetworkBadge`, `SlotProgressBar`, `ComputeUnitEstimate`, `EmptyState`, Skeletons.
  Chain hooks: `useSolBalance` (onAccountChange WS), `useTokenBalances`.
- **`lib/anchor.ts`**: placeholder IDL + PDA helpers (verifier_config/user/circuit/proof).

Contracts + SIWS flow diagram: [`apps/dapp/API_CONTRACT.md`](apps/dapp/API_CONTRACT.md).

---

## HANDOFF NOTES → Solana Session 7 (Backend Foundation, DB & Auth)

### What Session 6 added (on-chain track begins)

- **Anchor program** (`zkhelios/`, Anchor 1.1.2): `verify_proof` performs a **real
  Groth16/BN254 verification** via Solana `alt_bn128` syscalls (`~100k CU`), plus
  initialize, register_circuit, set_circuit_enabled, create_user_account, revoke/close,
  update_config, two-step admin transfer. PDAs + error codes 6000–6012 match the dApp.
- **Nonce**: client-random `u64` + `init` constraint on ProofAccount (auto duplicate
  reject). Frontend reconciled (`submit.ts` → `crypto.getRandomValues`).
- **Tests**: `cargo test` (litesvm), **11/11 green** — the happy path generates a
  **real arkworks Groth16 proof** and verifies it on-chain; failure paths (tampered
  proof, wrong input count, dup nonce, paused/disabled, non-admin), fee transfer,
  revoke/close, admin transfer all covered. CU asserted < 300k.
- **IDL** exported → `packages/idl` (`@zkhelios/idl`, 10 ix / 4 accounts / 13 errors).
  Bootstrap (`scripts/bootstrap-localnet.ts`) + IDL sync (`scripts/sync-idl.sh`).
- Toolchain installed: Solana CLI 4.0.2, Anchor 1.1.2, `cargo-build-sbf`.

Program reference + CU benchmark + security checklist: [`zkhelios/README.md`](zkhelios/README.md).

### TODOs for Session 7 (backend)

- `apps/api` (Fastify) + `packages/db` (Prisma/Postgres) + `packages/shared-types`.
- SIWS auth server-side (mirror the dApp's `/api/auth/*` mock contract; tweetnacl ed25519).
- Indexer plan for `ProofVerified` / `CircuitRegistered` events (Helius webhooks / RPC).
- Integration step (later): wire the dApp's `lib/anchor.ts` to `@zkhelios/idl` and bump
  the dApp's `@coral-xyz/anchor` (^0.30 → 1.x) so the 1.x IDL deserializes; deploy to devnet
  and set `NEXT_PUBLIC_PROGRAM_ID`. Swap the mock prover for real `snarkjs` + circuit artifacts.

### What Session 5 added (frontend track complete)

- **Explorer** (`/explorer`, public): universal search (signature/pubkey/proof-id/slot) +
  live latest proofs/transactions + top-provers leaderboard + live slot/epoch. Detail pages
  `proof/[id]`, `tx/[signature]`, `address/[pubkey]` (holdings + 90-day heatmap + watch),
  `program/[programId]`. Breadcrumbs, clickable/copyable, `useWatchlist` (localStorage).
- **Docs site** (`apps/docs`, port 3002): sidebar nav + search + branded callouts + copy-able
  code blocks; real content — Introduction, Quickstart, Concepts (architecture/proof-system/
  account-model), Guides (balance/custom), Reference (SDK/program/API/circuits), FAQ.
- **SDK** (`packages/sdk-ts`, `@zkhelios/sdk`): `ZkHelios` facade + production-ready
  `groth16ToSolana`/`encodeProof` + types + example + README.
- **Polish**: dynamic-imported recharts (dashboard **544→438 kB**) + prove wizard (**496→281 kB**);
  dapp manifest/robots/sitemap + OG images (web + dapp via `next/og`); docs robots/sitemap;
  **Vitest** (11 unit tests, green) for `lib/zk/format` + `share`; **CI workflow**
  (lint·type-check·test·build); `.env.example` for dapp + docs.
- **Not wired (need accounts/infra)**: Sentry, Plausible/PostHog, Playwright e2e, next-intl i18n,
  Lighthouse-CI, axe-core. Hooks/env are stubbed; documented in `.env.example`.

### TODOs for Session 6 (the Anchor program)

- `anchor init` → `programs/zkhelios`: VerifierConfig / CircuitRegistry / UserAccount / ProofAccount
  PDAs; `verify_proof` using `alt_bn128` Groth16 syscalls; 5 standard circuits; error codes 6000–6012.
- Export IDL → `packages/idl`; replace `apps/dapp/src/lib/anchor.ts` mock IDL + the
  `lib/zk/submit.ts` simulation with real `program.methods.verifyProof(...).rpc()`.
- Swap the mock worker for real `snarkjs.groth16.fullProve` (drop artifacts into `public/circuits/`)
  and `verifyOffchain` for `snarkjs.groth16.verify`.
- The dApp already defines the full expected interface — see [`apps/dapp/API_CONTRACT.md`](apps/dapp/API_CONTRACT.md).

### What Session 4 added

- **Prove** (`/prove`): 5 proof types → wizard (Configure RHF+Zod with public/private
  preview → Review with est. size/CU → **Generate in a Web Worker** with animated
  hexagon-mesh progress + cancel → Result with Groth16 JSON copy/download + Solana
  byte layout → **Submit on-chain** with lifecycle Building→Sending→Confirmed→Finalized,
  first-time confetti, proof-account PDA + explorer links). Proof **history sidebar**
  (Dexie/IndexedDB) with reuse + delete + filter.
- **Verify** (`/verify`, public): look up by account/signature/id **or** paste proof JSON
  for off-chain re-verification; shows ✓/✗, decoded public inputs, author, signature,
  date; Verify-again + Share (`/verify?proof=<base64url>`).
- **ZK core**: `lib/zk/{types,circuits,format,prover,submit,verify,share}`,
  `workers/proof-worker.ts` (staged mock prover — swap point for real snarkjs),
  `lib/db.ts` (Dexie). Groth16 → Solana `[u8;32]` byte conversion is real.

Contracts + Anchor `verify_proof` args + ProofAccount: [`apps/dapp/API_CONTRACT.md`](apps/dapp/API_CONTRACT.md).

### TODOs for Session 5

- Build `/explorer` (proof/tx/address/program detail pages, universal search) and the
  `apps/docs` site (Fumadocs/Nextra, real content). SEO/OG, analytics, Sentry, PWA, i18n, tests, CI/CD.
- **Perf**: dynamic-import the recharts (dashboard 544 kB) and the prove bundle.
- Drop real circuit artifacts into `public/circuits/` and swap the mock worker for
  `snarkjs.groth16.fullProve`; swap `verifyOffchain` for `snarkjs.groth16.verify`.
- Replace `lib/anchor.ts` mock IDL + `lib/zk/submit.ts` simulation with the deployed
  program (Session 6).

### What Session 3 added

- **Dashboard** (`/`): real SOL + SPL balances (chain) with Jupiter USD; active-proofs,
  recent-activity, and live epoch/slot cards; 4 network stat cards with sparklines +
  count-up + pulse-on-update; Recharts line (24h/7d/30d toggle) / bar (CU per type) /
  donut (proof distribution); quick actions, announcements, network-health; realtime
  connection indicator (`useRealtimeStats` mock WS).
- **Transactions** (`/transactions`): filterable (search/type/status/date) virtualized
  table (`@tanstack/react-virtual`) with cursor pagination + background load, detail
  drawer (decoded logs, token balance changes, CU, raw-JSON toggle, Explorer/Solscan/xRay),
  CSV export, empty + error states.
- **Data layer**: `lib/mock/solana.ts` (faker, deterministic base58 sigs/pubkeys, lamport
  precision, 140 txs + 48 proofs), `lib/api/mock.ts` (latency + ~6% transient errors,
  cursor pagination), `lib/api/jupiter.ts` (resilient price + fallback). TanStack Query
  hooks; `useEpochInfo` (real onSlotChange), `useSolBalance`/`useTokenBalances` (real chain).

Contracts + realtime/WS spec: [`apps/dapp/API_CONTRACT.md`](apps/dapp/API_CONTRACT.md).

### TODOs for Session 4 (Prove + Verify)

- Build `/prove` (5 proof types → wizard → snarkjs in a Web Worker → on-chain submit via
  `@coral-xyz/anchor` `verify_proof`) and `/verify` (by account/signature or pasted JSON).
- Add `snarkjs` (dynamic import — heavy), Dexie (IndexedDB proof history), circuit assets
  under `public/circuits/`, Groth16 → Solana format helper (`lib/zk/format.ts`).
- Wire to the real Anchor program once Session 6 lands (replace `lib/anchor.ts` mock IDL).
- Set `SESSION_SECRET`, `NEXT_PUBLIC_RPC_URL_*`, `NEXT_PUBLIC_PROGRAM_ID` for non-dev.
- Perf (Session 5): dynamic-import the Recharts/snarkjs bundles to trim dashboard JS.
