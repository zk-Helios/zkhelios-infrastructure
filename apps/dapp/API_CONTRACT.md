# zkHelios dApp — Mock API Contract & Auth Flow (Solana)

Contracts the dApp consumes. In Sessions 2–3 they are **mock Next.js route
handlers** (`apps/dapp/src/app/api/**`); the real Fastify backend (Session 7)
mirrors these shapes.

---

## Authentication — SIWS (Sign In With Solana)

State is carried by an **httpOnly, SameSite=Lax session cookie**
(`zkhelios_session`, iron-session). The client never reads it; it relies on
`GET /api/auth/me`. Signatures are **ed25519**, verified with `tweetnacl`.

### Flow

```
┌────────┐                         ┌──────────┐                   ┌──────────┐
│ Wallet │                         │  dApp    │                   │   API    │
└───┬────┘                         └────┬─────┘                   └────┬─────┘
    │  1. connect (Wallet Adapter)      │                              │
    │◀──────────────────────────────────│                             │
    │                                   │  2. POST /api/auth/nonce     │
    │                                   │     { publicKey }            │
    │                                   │─────────────────────────────▶│
    │                                   │  { nonce, statement } +cookie│
    │                                   │◀─────────────────────────────│
    │  3. signMessage(SIWS message)     │                              │
    │◀───────────────────────────────────│                            │
    │  signature (Uint8Array)           │                              │
    │───────────────────────────────────▶│  4. POST /api/auth/verify  │
    │                                   │     { message, signature,    │
    │                                   │       publicKey }            │
    │                                   │─────────────────────────────▶│
    │                                   │  { ok, user } (+ cookie)     │
    │                                   │◀─────────────────────────────│
    │                                   │  5. GET /api/auth/me (poll)  │
    │                                   │─────────────────────────────▶│
```

`signMessage` comes from `useWallet()`; the signature is base58-encoded before
posting. Orchestrated in `useAuth()` (`hooks/use-auth.ts`).

### SIWS message format (client-built, `lib/siws.ts`)

```
{domain} wants you to sign in with your Solana account:
{pubkey}

{statement}

URI: {uri}
Version: 1
Chain ID: solana:{cluster}    (mainnet | devnet | localnet)
Nonce: {nonce}
Issued At: {ISO-8601}
```

### Endpoints

| Method | Path | Auth | Body | Response |
| --- | --- | --- | --- | --- |
| POST | `/api/auth/nonce` | — | `{ publicKey }` | `{ ok, nonce, statement, version }` + sets cookie |
| POST | `/api/auth/verify` | — | `{ message, signature, publicKey }` | `{ ok, user: { pubkey, chainId }, expiresAt }` |
| GET | `/api/auth/me` | cookie | — | `{ ok, user: { pubkey, chainId, issuedAt, expiresAt } \| null }` |
| POST | `/api/auth/logout` | cookie | — | `{ ok: true }` |

Server validations: ed25519 signature valid for pubkey · message pubkey line ==
claimed signer · nonce matches session · chainId allowed · `issuedAt` within
5 min. Error codes: `VALIDATION_FAILED`, `AUTH_INVALID_SIGNATURE`,
`AUTH_NONCE_INVALID`, `AUTH_UNSUPPORTED_CHAIN`, `AUTH_MESSAGE_EXPIRED`.
Backend adds `AUTH_ADDRESS_LOCKED`, `AUTH_RATE_LIMITED` (Session 7).

---

## Clusters (`lib/solana.ts`)

| Cluster | chainId | Badge | RPC |
| --- | --- | --- | --- |
| mainnet-beta | `solana:mainnet` | green | `NEXT_PUBLIC_RPC_URL_MAINNET` → fallback `clusterApiUrl` |
| devnet | `solana:devnet` | yellow | `NEXT_PUBLIC_RPC_URL_DEVNET` → fallback `clusterApiUrl` |
| localnet | `solana:localnet` | blue | `http://localhost:8899` |

Selection persists in localStorage (`useClusterStore`).

## Anchor program (`lib/anchor.ts`)

Placeholder IDL until Session 6. PDA helpers (seeds must match the program):

- `findVerifierConfigPDA()` → `["verifier_config"]`
- `findUserAccountPDA(authority)` → `["user", authority]`
- `findCircuitPDA(circuitId)` → `["circuit", u32 LE]`
- `findProofAccountPDA(authority, nonce)` → `["proof", authority, u64 LE]`

---

## Endpoints/feeds the dApp will need next (backend to implement)

Indicative shapes; finalized as dashboard/prove/verify/explorer UIs land.

- `GET /api/stats/overview` → `{ tps, slot, epoch, totalProofs, proofs24h, avgVerifyTimeMs, activeUsers24h, rpcLatencyMs, status }`
- `GET /api/transactions?pubkey&type&status&cursor&limit` → `{ items, nextCursor, total }`
- `GET /api/transactions/:signature`
- `GET /api/proofs?authority&type&cursor` · `GET /api/proofs/:proofAccount`
- `GET /api/circuits` · `GET /api/circuits/:id`
- `GET /api/stats/leaderboard?period=24h`
- `GET /api/prices?mints=…` (Jupiter Price API, USD)
- `WS /ws` channels: `stats`, `proofs`, `proofs:circuit:{id}`, `user:notifications`, `user:proofs`, `address:{pubkey}:txs`

**Direct chain (no backend):** `useSolBalance` (onAccountChange), `useTokenBalances`
(getParsedTokenAccountsByOwner), footer slot (onSlotChange). Recent user history
via `getSignaturesForAddress`; historical via backend.

---

## Session 3 — Dashboard & Transactions data contracts

The dashboard/transactions consume these shapes. Implemented now as a **mock
client** (`lib/api/mock.ts`, latency + ~6% transient errors); backend mirrors them.

| Function (→ REST) | Returns |
| --- | --- |
| `getOverviewStats()` → `GET /api/stats/overview` | `OverviewStats { tps, slot, epoch, slotInEpoch, totalProofs, proofs24h, avgVerifyTimeMs, activeUsers24h, rpcLatencyMs, status }` |
| `getProofsTimeseries(range)` → `GET /api/stats/timeseries?metric=proofs&period=24h\|7d\|30d` | `TimeseriesPoint[] { t, value }` |
| `getCuByType()` → `GET /api/stats/cu-by-type` | `{ kind, cu }[]` |
| `getProofDistribution()` → `GET /api/stats/distribution` | `{ kind, count }[]` |
| `getActiveProofs()` → `GET /api/proofs/me/summary` | `{ total, pending }` |
| `getRecentActivity(limit)` / `getTransactions(filters,cursor,limit)` → `GET /api/transactions` | `Page<Transaction> { items, nextCursor, total }` (cursor = signature) |
| `getTransaction(sig)` → `GET /api/transactions/:signature` | `Transaction + { logs[], accountKeys[], tokenBalanceChanges[] }` |
| `getAnnouncements()` → `GET /api/announcements` | `Announcement[]` |

**Transaction filters** (query params): `search` (signature\|pubkey\|program),
`type` (transfer\|proof\|program-call), `status` (success\|failed), `fromDate`, `toDate`.

**Realtime stats** (mocked by `useRealtimeStats`; backend `WS /ws` channel `stats`):
server pushes `OverviewStats` snapshots; client shows a live indicator + pulses
changed numbers. Direct chain (no backend): `useSolBalance` (onAccountChange),
`useEpochInfo` (getEpochInfo + onSlotChange), footer slot (onSlotChange).

**Prices**: `getPrices(mints)` → Jupiter Price API V2 (`lite-api.jup.ag/price/v2`),
60s cache, **graceful fallback** to static reference prices when offline.

## Session 4 — Prove & Verify (client-side + on-chain)

Proof **generation** and **verification** are client-side; **submission** is a
direct Solana transaction to the verifier program (no REST). Read APIs back the
explorer/verify lookups (Sessions 6–8).

### Client flow

1. Configure (react-hook-form + Zod per circuit) → split into public/private inputs.
2. **Generate** in a Web Worker (`workers/proof-worker.ts`, staged progress; mock
   prover now — swap `snarkjs.groth16.fullProve` in, loading `public/circuits/*.wasm` + `*.zkey`).
3. **Format** Groth16 → Solana bytes (`lib/zk/format.ts`): `proof_a` 64B, `proof_b`
   128B, `proof_c` 64B, `public_inputs` `[u8;32][]` (big-endian).
4. **Submit** via Anchor (`lib/zk/submit.ts`) — simulated until the program deploys (Session 6).
5. Persist to IndexedDB (Dexie, `lib/db.ts`); history sidebar + reuse.

### Anchor `verify_proof` instruction (program — Session 6)

```
verify_proof(
  circuit_id: u32,
  proof_a: [u8; 64],
  proof_b: [u8; 128],
  proof_c: [u8; 64],
  public_inputs: Vec<[u8; 32]>,   // max 8
)
accounts: { user (signer), proofAccount (PDA), verifierConfig (PDA), systemProgram }
```

**ProofAccount** (PDA, seeds `["proof", authority, nonce u64 LE]`): `authority`,
`circuit_id`, `proof_type`, `public_inputs`, `proof_hash`, `verified`,
`verified_at`, `slot_verified`, `bump`. Custom errors `6000–6012`
(see `lib/anchor.ts` `PROGRAM_ERRORS`).

### Verify

- **Off-chain**: structural + pairing check in-browser (`lib/zk/verify.ts`
  `verifyOffchain`; swap `snarkjs.groth16.verify(vk, …)`). Shared links carry the
  proof: `/verify?proof=<base64url>` (`lib/zk/share.ts`).
- **On-chain**: look up `ProofAccount` by account / signature / id → check `verified`.
  Backed by the indexer; resolves from local history until then.

### Circuits

5 registered (`lib/zk/circuits.ts`): `balance_proof`, `ownership_proof`,
`age_proof`, `membership_proof`, `custom_circuit`. Each declares fields
(public/private), input Zod schema, est. CU (~186–256k), proof size (~256B),
public-input count. Backend `GET /api/circuits` mirrors these.

## Env vars

| Var | Purpose | Dev default |
| --- | --- | --- |
| `SESSION_SECRET` | iron-session signing (≥32 chars) | insecure dev fallback |
| `NEXT_PUBLIC_RPC_URL_MAINNET` | mainnet RPC (Helius/Triton/QuickNode) | `clusterApiUrl("mainnet-beta")` |
| `NEXT_PUBLIC_RPC_URL_DEVNET` | devnet RPC | `clusterApiUrl("devnet")` |
| `NEXT_PUBLIC_PROGRAM_ID` | zkHelios Anchor program id | System Program (placeholder) |
| `NEXT_PUBLIC_API_URL` | backend base URL (Session 7+) | — |
