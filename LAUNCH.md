# Launch Readiness Checklist

## Frontend
- [ ] `apps/web`, `apps/dapp`, `apps/docs` build; Lighthouse 95+ (perf), 100 (a11y)
- [ ] E2E (Playwright) green; Sentry + analytics (Plausible/PostHog) configured
- [ ] All env vars documented + set; DNS + TLS for zkhelios.app / app. / docs.

## Backend
- [ ] CI green (`api.yml`): lint · type-check · unit + integration tests · build · audit
- [ ] Security checklist complete ([`docs/threat-model.md`](docs/threat-model.md))
- [ ] Rate limits tuned for expected load; load test baseline documented (k6)
- [ ] Monitoring + alerts active ([`infra/observability`](infra/observability)); runbooks tested
- [ ] Backups + restore drill passed (RPO 5m / RTO 30m)
- [ ] Secrets in a manager (not env files); JWT key rotation plan

## Anchor program
- [ ] External audit complete; findings addressed
- [ ] ≥ 4 weeks devnet soak; bug bounty (Immunefi) live
- [ ] Squads multisig (3-of-5) configured + upgrade procedure dry-run
      ([`docs/runbooks/program-upgrade.md`](docs/runbooks/program-upgrade.md))
- [ ] IDL published on-chain + synced to `packages/idl`

## Operational
- [ ] Status page (status.zkhelios.app) + support channel
- [ ] On-call rotation; cost monitoring
- [ ] Legal review (Terms, Privacy, geo-restrictions)

## Integration cut-over (mocks → real)
- [ ] dApp `lib/api/mock.ts` → real REST/WS client; `lib/anchor.ts` mock IDL →
      `@zkhelios/idl` (bump `@coral-xyz/anchor` to match the 1.x IDL)
- [ ] dApp mock prover → real `snarkjs` + circuit artifacts in `public/circuits/`
- [ ] `NEXT_PUBLIC_PROGRAM_ID` / RPC URLs set to the deployed program + premium RPC

## Status
Sessions 1–10 implemented and verified at the code level (type-check, unit tests,
program tests, builds, OpenAPI export). Remaining items above require live
infrastructure + external services (audit, cloud, RPC, email/push providers).
