# Facilities Publisher — Data Flows

> **Channel:** `facilities-publisher`
> **Org:** `wdpro-development`
> **Platform:** Dash (content propagation)
> **Runtime:** Java · realtime-content-wrapper

---

## Source Systems

<!-- TODO: Document upstream source systems feeding facility data -->
<!-- Reference: likely GXP facility/POI APIs, park infrastructure systems -->

- **Primary Source:** `TODO — identify facility source (e.g., GXP facilities API, POI service)`
- **Source Format:** `TODO — JSON/XML?`
- **Authentication:** `TODO — OAuth2 / service account?`
- **Source SLA:** `TODO — expected latency and availability`

---

## Transform Logic

<!-- TODO: Document transformation steps for facility data -->

- **Mapping:** `TODO — describe field mapping (name, location, type, coordinates, metadata)`
- **Enrichment:** `TODO — geo-enrichment, locale translations, media URLs?`
- **Filtering:** `TODO — unpublished facilities excluded? test entities filtered?`
- **Validation:** `TODO — required fields, coordinate bounds validation`

---

## Destination

<!-- TODO: Confirm Couchbase cluster and bucket details -->

- **Destination Type:** Couchbase (assumed, per Dash platform pattern)
- **Cluster:** `TODO — cluster name / environment`
- **Bucket:** `TODO — bucket name`
- **Document TTL:** `TODO — expiration policy if any`
- **Write Strategy:** `TODO — upsert / insert / replace`

---

## Trigger Mechanism

<!-- TODO: Document what triggers a facility publish cycle -->

- **Trigger Type:** `TODO — event-driven / polling / scheduled?`
- **Frequency:** `TODO — real-time on change? periodic sync?`
- **Backpressure:** `TODO — handling during bulk facility imports (new park launch)`
- **Manual Trigger:** `TODO — Jenkins job for full facility resync?`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/facilities-publisher` and team knowledge.*
