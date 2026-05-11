# Facility Status Publisher — Data Flows

> **Channel:** `facility-status-publisher`
> **Org:** `wdpro-development`
> **Platform:** Dash (content propagation)
> **Runtime:** Java · realtime-content-wrapper

---

## Source Systems

<!-- TODO: Document upstream source systems feeding facility status data -->
<!-- Reference: likely real-time operational status (open/closed/refurb/weather) -->

- **Primary Source:** `TODO — identify status source (e.g., ops status service, ride control systems)`
- **Source Format:** `TODO — JSON/XML/event stream?`
- **Authentication:** `TODO — OAuth2 / service account?`
- **Source SLA:** `TODO — expected latency (likely low-latency for real-time status)`

---

## Transform Logic

<!-- TODO: Document transformation steps for facility status data -->

- **Mapping:** `TODO — describe field mapping (facilityId, status, reason, lastUpdate, waitTime?)`
- **Enrichment:** `TODO — status code → display text mapping, locale handling?`
- **Filtering:** `TODO — suppress duplicate status events? debounce rapid changes?`
- **Validation:** `TODO — valid status enum values, timestamp sanity checks`

---

## Destination

<!-- TODO: Confirm Couchbase cluster and bucket details -->

- **Destination Type:** Couchbase (assumed, per Dash platform pattern)
- **Cluster:** `TODO — cluster name / environment`
- **Bucket:** `TODO — bucket name`
- **Document TTL:** `TODO — short TTL for status freshness?`
- **Write Strategy:** `TODO — upsert (likely, for real-time overwrites)`

---

## Trigger Mechanism

<!-- TODO: Document what triggers a status publish cycle -->

- **Trigger Type:** `TODO — event-driven (likely real-time push from ops systems)`
- **Frequency:** `TODO — real-time / sub-second for ride status changes?`
- **Backpressure:** `TODO — handling during park open/close (mass status changes)`
- **Manual Trigger:** `TODO — Jenkins job for status resync?`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/facility-status-publisher` and team knowledge.*
