# Security Policy

## Reporting a vulnerability

Email **security@zkhelios.app** (PGP available on request). Do not open public
issues for security reports. We aim to acknowledge within 48 hours and to ship a
fix or mitigation within 7 days for critical issues.

The Anchor program has a bug bounty on Immunefi — see the program page for scope
and rewards. Please test only against **devnet**; never against mainnet funds.

## Scope

- Anchor verifier program (`zkhelios/programs/zkhelios`)
- Backend API (`apps/api`) + indexer/workers
- Frontend (`apps/web`, `apps/dapp`, `apps/docs`)

## Hardening summary

- **API**: Zod-validated input (strict, unknown fields rejected), helmet
  (HSTS/no-sniff/frame-deny/no-referrer), CORS allowlist, Redis-backed rate limits
  (global + tight auth limits), httpOnly+SameSite session cookies, Pino redaction
  of cookies/tokens/signatures, Prisma (no raw SQL with user input), pubkey
  on-curve validation, address lockout after repeated failed sign-ins.
- **Program**: PDA seeds + bump + owner checks, signer checks, checked arithmetic,
  single-instruction (no reentrancy), `init`-based replay protection, fee via
  System Program, public-input length validation. See
  [`programs/zkhelios/THREAT_MODEL.md`](programs/zkhelios/THREAT_MODEL.md).
- **Secrets**: never in code/git; env-injected (Secrets Manager / External Secrets
  in prod). JWT signing key rotatable.
