# Runbook: Incident Response

1. **Acknowledge** the page (PagerDuty/Opsgenie). Declare severity.
2. **Assess**: check Grafana (API health, error rate, p99), `/health/ready`,
   `/api/admin/health/detailed`, and recent deploys.
3. **Mitigate**:
   - Elevated 5xx / latency → roll back the last API deploy (`helm rollback zkhelios-api`).
   - DB saturated → check connections; scale read replicas / kill long queries.
   - Redis down → API degrades gracefully (cache misses, no realtime); restart/failover.
   - Under attack → tighten Cloudflare rate limits / enable Bot Fight Mode.
   - Program-level abuse → pause via `update_config(new_paused = true)` (admin multisig).
4. **Communicate**: update status page (status.zkhelios.app).
5. **Postmortem** within 48h; file follow-ups.

Alert → runbook mapping is in `infra/observability/alerts.yml`.
