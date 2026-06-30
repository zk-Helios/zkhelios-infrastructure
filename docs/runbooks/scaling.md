# Runbook: Scaling

- **API** is stateless → scale horizontally (HPA on CPU + RPS, 3→10 replicas).
  PodDisruptionBudget keeps ≥2 available during rollouts.
- **Indexer** is single-leader (one replica, `Recreate` strategy) — do not scale out;
  parallel indexers would double-process. Scale *up* (CPU/mem) if behind.
- **Workers** scale horizontally (BullMQ distributes jobs); stats-aggregator is a
  repeatable job (idempotent).
- **Postgres**: add read replicas for read-heavy endpoints; tune connection pool
  (alert at >80%). **Redis**: scale vertically / cluster mode for pub/sub fan-out.
- **WebSocket**: cap subs/connection (10) + connections/IP; shard the WS tier behind
  a sticky LB if connection count grows.
- **RPC**: use a premium provider (Helius/Triton) with a fallback endpoint; the
  indexer backs off on RPC failures.
