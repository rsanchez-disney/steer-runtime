# Facility Status Publisher — Error Handling

> **Channel:** `facility-status-publisher`
> **Monitoring:** Splunk · AppDynamics

---

## Error Isolation

<!-- TODO: Document how errors in this publisher are contained -->

- **Blast Radius:** `TODO — does a single status failure block other status updates?`
- **Dead Letter Queue:** `TODO — DLQ destination and retention (short retention for status?)`
- **Poison Message Handling:** `TODO — max attempts before quarantine`
- **Circuit Breaker:** `TODO — circuit breaker on Couchbase connection? (critical for real-time)`

---

## Retry Patterns

<!-- TODO: Document retry configuration — note: stale status is worse than missing status -->

- **Retry Strategy:** `TODO — fast retry with short timeout (status is time-sensitive)`
- **Max Retries:** `TODO — count before DLQ (keep low for freshness)`
- **Idempotency:** `TODO — status upserts are naturally idempotent (last-write-wins)`
- **Retry Scope:** `TODO — per-facility status update`

---

## Monitoring & Alerting

<!-- TODO: Document observability setup — real-time status requires tight SLAs -->

| Signal | Tool | Alert Threshold |
|--------|------|-----------------|
| Error rate | Splunk | `TODO` |
| Publish latency | AppDynamics | `TODO — tight SLA for real-time status` |
| DLQ depth | `TODO` | `TODO` |
| Stale status detection | `TODO` | `TODO — alert if status not refreshed within expected window` |
| Status event throughput | Splunk | `TODO — drop in throughput may indicate upstream failure` |

- **Splunk Index:** `TODO — index name`
- **Splunk Saved Search:** `TODO — link`
- **AppDynamics Dashboard:** `TODO — link`
- **PagerDuty/Escalation:** `TODO — on-call routing (likely high-priority for guest-facing status)`
- **Jenkins Health Job:** `TODO — link`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/facility-status-publisher`.*
