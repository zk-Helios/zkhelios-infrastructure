# Runbook: Disaster Recovery

**Objectives:** RPO 5 min (continuous WAL archiving), RTO 30 min.

## Postgres
- Automated daily backups + PITR (30-day retention).
- Restore: provision a new RDS instance from the latest snapshot or PITR target,
  update `DATABASE_URL` secret, `helm upgrade` the API, run `prisma migrate deploy`.
- Test restore quarterly into a scratch environment.

## Redis
- Cache/pub-sub only — no durable source of truth. On loss: restart; the indexer
  re-derives the cursor (`indexer:cursor`) from the latest indexed signature in Postgres.

## Indexed data
- Postgres is reconstructible from chain: reset `indexer:cursor` and let the indexer
  backfill from the program's signatures (`getSignaturesForAddress`).

## Program (on-chain)
- Upgrade authority is a Squads multisig (3-of-5). Recovery = multisig members
  re-key per the documented ceremony. Buffer accounts pre-funded.

Drill this procedure quarterly; record timings against RTO/RPO.
