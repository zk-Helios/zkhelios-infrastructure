# Threat Model — Backend & System

Program-specific threats: [`programs/zkhelios/THREAT_MODEL.md`](../programs/zkhelios/THREAT_MODEL.md).

## Penetration-test checklist (verify before launch)

| Attack | Control |
| --- | --- |
| SQL injection | Prisma parameterized queries; no `$queryRaw` with user input. |
| XSS in stored fields | `displayName` regex-restricted; API serves JSON; outputs not HTML-rendered server-side. |
| IDOR (cross-user access) | Every `/me*` query scoped by `user: { pubkey }`; resource mutations filtered by owner. Integration tests assert. |
| Auth bypass | `authenticate`/`requireAdmin` decorators; JWT + DB session check; locked users force-logged-out. |
| Replay / nonce reuse | Nonce single-use in Redis (10-min TTL), deleted on success; SIWS `issuedAt` 5-min window. |
| Mass assignment | Zod `.strict()` on bodies rejects unknown fields. |
| Rate-limit bypass | Redis sliding window keyed by IP; tight auth limits (nonce 10/min, verify 5/min). |
| Brute-force sign-in | Address lockout after 10 failed verifies in 1h. |
| SSRF | Only outbound fetch is Jupiter (fixed host); no user-supplied URLs fetched. |
| Session fixation | New session row + JWT on each sign-in; cookie httpOnly + SameSite=Lax + Secure (prod). |
| Webhook spoofing | Helius webhook validates a shared auth header; (prod) IP allowlist + rate limit. |
| Secrets exposure | Env-injected, never in git; Pino redacts cookies/tokens/signatures. |

## Web3-specific
- Pubkey validation: base58 + `PublicKey.isOnCurve`.
- Chain-id checked in SIWS verification; signatures verified with ed25519 (tweetnacl).
- Pubkeys normalized/compared as base58 strings consistently.

## Residual risks / follow-ups
- Trusted-setup integrity for circuit VKs (process control, multisig registration).
- DDoS absorption relies on Cloudflare in front of the API.
- CSRF: cookie is SameSite=Lax + API requires JSON content-type; add double-submit
  token if cross-site state-changing GETs are ever introduced.
