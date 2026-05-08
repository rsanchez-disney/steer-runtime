# Schedules Publisher — Channel Contracts

> **Channel:** `schedules-publisher`
> **Platform:** Dash (content propagation)

---

## Couchbase Channel Patterns

<!-- TODO: Document the Sync Gateway channel naming conventions for schedules -->

- **Channel Naming:** `TODO — e.g., schedules::{facilityType}::{facilityId}::{date}`
- **Channel Granularity:** `TODO — per-facility / per-date-range / per-park?`
- **Access Control:** `TODO — which consumers subscribe to schedule channels?`

---

## Document ID Patterns

<!-- TODO: Document the key structure used in Couchbase -->

- **ID Format:** `TODO — e.g., schedule::{facilityId}::{dateRange}`
- **Versioning:** `TODO — is version embedded in key or document body?`
- **Collision Strategy:** `TODO — how are overlapping schedule updates handled?`

---

## Supported Destinations

<!-- TODO: Confirm all downstream consumers -->

| Destination | Protocol | Notes |
|-------------|----------|-------|
| Couchbase (primary) | SDK / Sync Gateway | `TODO — confirm bucket` |
| `TODO` | `TODO` | `TODO — mobile app cache? wait times service?` |

---

## Contract Versioning

- **Schema Registry:** `TODO — where are schedule schemas stored?`
- **Breaking Change Policy:** `TODO — how are consumers notified?`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/schedules-publisher`.*
