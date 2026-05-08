# Facility Status Publisher — Channel Contracts

> **Channel:** `facility-status-publisher`
> **Platform:** Dash (content propagation)

---

## Couchbase Channel Patterns

<!-- TODO: Document the Sync Gateway channel naming conventions for facility status -->

- **Channel Naming:** `TODO — e.g., status::{facilityType}::{facilityId}`
- **Channel Granularity:** `TODO — per-facility / per-park / per-status-type?`
- **Access Control:** `TODO — which consumers subscribe to status channels?`

---

## Document ID Patterns

<!-- TODO: Document the key structure used in Couchbase -->

- **ID Format:** `TODO — e.g., status::{facilityId} (single doc per facility, overwritten)`
- **Versioning:** `TODO — timestamp-based? sequence number?`
- **Collision Strategy:** `TODO — last-write-wins for real-time status?`

---

## Supported Destinations

<!-- TODO: Confirm all downstream consumers -->

| Destination | Protocol | Notes |
|-------------|----------|-------|
| Couchbase (primary) | SDK / Sync Gateway | `TODO — confirm bucket` |
| `TODO` | `TODO` | `TODO — wait times display? mobile push notifications?` |

---

## Contract Versioning

- **Schema Registry:** `TODO — where are status schemas stored?`
- **Breaking Change Policy:** `TODO — how are consumers notified of status enum changes?`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/facility-status-publisher`.*
