# Runbook: Indexer Recovery

## Symptoms
- Alert `IndexerLag` (behind > 1000 signatures or > 5 min).
- Stale `/api/stats/overview`, missing recent proofs/transactions.

## Diagnose
- Check the indexer pod logs (`[indexer] poll error`), RPC latency
  (`solana_rpc_latency_ms`), and the Redis cursor: `GET indexer:cursor`.

## Recover
1. **RPC issues** → switch to the fallback RPC (update secret) and restart the pod.
2. **Crash loop** → the indexer resumes from `indexer:cursor`; it's idempotent
   (signature-unique), so a restart is safe.
3. **Gap / corruption** → backfill: delete or rewind `indexer:cursor` to an earlier
   signature; the poller re-walks `getSignaturesForAddress` and re-ingests (existing
   rows are skipped).
4. **Webhook path** → verify the Helius webhook is reachable and its auth header
   matches `HELIUS_WEBHOOK_AUTH`.

The single-leader indexer must not be scaled out (would double-process). Reconcile
counts against on-chain `config.total_proofs_verified` after recovery.
