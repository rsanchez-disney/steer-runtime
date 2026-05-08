# Content Publisher — Error Handling

> **Channel:** `content-publisher`
> **Monitoring:** Splunk · AppDynamics

---

## Error Isolation

<!-- TODO: Document how errors in this publisher are contained -->

- **Blast Radius:** `TODO — does a single record failure halt the batch or is it isolated?`
- **Dead Letter Queue:** `TODO — DLQ destination and retention policy`
- **Poison Message Handling:** `TODO — max attempts before quarantine`
- **Circuit Breaker:** `TODO — is there a circuit breaker on the Couchbase connection?`

---

## Retry Patterns

<!-- TODO: Document retry configuration -->

- **Retry Strategy:** `TODO — exponential backoff / fixed interval / immediate?`
- **Max Retries:** `TODO — count before DLQ`
- **Idempotency:** `TODO — are retries safe (upsert-based)?`
- **Retry Scope:** `TODO — per-record / per-batch?`

---

## Monitoring & Alerting

<!-- TODO: Document observability setup -->

| Signal | Tool | Alert Threshold |
|--------|------|-----------------|
| Error rate | Splunk | `TODO` |
| Publish latency | AppDynamics | `TODO` |
| DLQ depth | `TODO` | `TODO` |
| Couchbase timeout | AppDynamics | `TODO` |

- **Splunk Index:** `TODO — index name`
- **Splunk Saved Search:** `TODO — link to saved search`
- **AppDynamics Dashboard:** `TODO — link`
- **PagerDuty/Escalation:** `TODO — on-call routing`
- **Jenkins Health Job:** `TODO — link to CI health check`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/content-publisher`.*
