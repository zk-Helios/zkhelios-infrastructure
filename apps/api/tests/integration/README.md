# API integration tests

Integration tests run the real Fastify app against ephemeral Postgres + Redis
(Testcontainers) and exercise the full auth + module stack.

```bash
# requires Docker
pnpm --filter @zkhelios/api test:integration
```

Suggested coverage (to implement when Docker is available in CI):

- **Auth**: nonce → sign (tweetnacl keypair) → verify → cookie → `/me`; replay
  (reused nonce) rejected; expired message rejected; lockout after 10 fails.
- **Users**: update profile, watched-address CRUD, public profile, IDOR (cannot
  read/modify another user's resources).
- **Transactions/Proofs/Stats**: pagination cursors, CSV export, filters.
- **Notifications**: preferences round-trip, mark-read, email verify code flow.
- **Admin**: requireAdmin enforced (403 for non-admin), announcements fan-out.

The pure logic these depend on (SIWS verify, preference merge, cursor codec,
search classify, event normalize, CSV, email templates) is already covered by
the unit suite (`pnpm --filter @zkhelios/api test`, 29 tests).
