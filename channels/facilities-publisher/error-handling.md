# Facilities Publisher — Error Handling

> **Channel:** `facilities-publisher`
> **Monitoring:** Splunk · AppDynamics

---

## Error Isolation

<!-- TODO: Document how errors in this publisher are contained -->

- **Blast Radius:** `TODO — does a single facility failure halt the batch?`
- **Dead Letter Queue:** `TODO — DLQ destination and retention`
- **Poison Message Handling:** `TODO — max attempts before quarantine`
- **Circuit Breaker:** `TODO — circuit breaker on Couchbase connection?`

---

## Retry Patterns

<!-- TODO: Document retry configuration -->

- **Retry Strategy:** `TODO — exponential backoff / fixed interval?`
- **Max Retries:** `TODO — count before DLQ`
- **Idempotency:** `TODO — are facility upserts safe to retry?`
- **Retry Scope:** `TODO — per-facility / per-batch?`

---

## Monitoring & Alerting

<!-- TODO: Document observability setup -->

| Signal | Tool | Alert Threshold |
|--------|------|-----------------|
| Error rate | Splunk | `TODO` |
| Publish latency | AppDynamics | `TODO` |
| DLQ depth | `TODO` | `TODO` |
| Facility count drift | `TODO` | `TODO — alert if published count diverges from source` |

- **Splunk Index:** `TODO — index name`
- **Splunk Saved Search:** `TODO — link`
- **AppDynamics Dashboard:** `TODO — link`
- **PagerDuty/Escalation:** `TODO — on-call routing`
- **Jenkins Health Job:** `TODO — link`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/facilities-publisher`.*
