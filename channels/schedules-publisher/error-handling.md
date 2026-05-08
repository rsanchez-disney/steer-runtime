# Schedules Publisher — Error Handling

> **Channel:** `schedules-publisher`
> **Monitoring:** Splunk · AppDynamics

---

## Error Isolation

<!-- TODO: Document how errors in this publisher are contained -->

- **Blast Radius:** `TODO — does a single schedule failure halt the batch?`
- **Dead Letter Queue:** `TODO — DLQ destination and retention`
- **Poison Message Handling:** `TODO — max attempts before quarantine`
- **Circuit Breaker:** `TODO — circuit breaker on Couchbase connection?`

---

## Retry Patterns

<!-- TODO: Document retry configuration -->

- **Retry Strategy:** `TODO — exponential backoff / fixed interval?`
- **Max Retries:** `TODO — count before DLQ`
- **Idempotency:** `TODO — are schedule upserts safe to retry?`
- **Retry Scope:** `TODO — per-schedule / per-facility / per-batch?`

---

## Monitoring & Alerting

<!-- TODO: Document observability setup -->

| Signal | Tool | Alert Threshold |
|--------|------|-----------------|
| Error rate | Splunk | `TODO` |
| Publish latency | AppDynamics | `TODO` |
| DLQ depth | `TODO` | `TODO` |
| Stale schedule detection | `TODO` | `TODO — alert if schedule not updated by expected time` |

- **Splunk Index:** `TODO — index name`
- **Splunk Saved Search:** `TODO — link`
- **AppDynamics Dashboard:** `TODO — link`
- **PagerDuty/Escalation:** `TODO — on-call routing`
- **Jenkins Health Job:** `TODO — link`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/schedules-publisher`.*
