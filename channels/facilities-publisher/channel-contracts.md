# Facilities Publisher — Channel Contracts

> **Channel:** `facilities-publisher`
> **Platform:** Dash (content propagation)

---

## Couchbase Channel Patterns

<!-- TODO: Document the Sync Gateway channel naming conventions for facilities -->

- **Channel Naming:** `TODO — e.g., facilities::{facilityType}::{parkId}::{facilityId}`
- **Channel Granularity:** `TODO — per-facility / per-type / per-park?`
- **Access Control:** `TODO — which consumers subscribe to facility channels?`

---

## Document ID Patterns

<!-- TODO: Document the key structure used in Couchbase -->

- **ID Format:** `TODO — e.g., facility::{facilityId} or facility::{type}::{id}`
- **Versioning:** `TODO — is version embedded in key or document body?`
- **Collision Strategy:** `TODO — how are duplicate facility records handled?`

---

## Supported Destinations

<!-- TODO: Confirm all downstream consumers -->

| Destination | Protocol | Notes |
|-------------|----------|-------|
| Couchbase (primary) | SDK / Sync Gateway | `TODO — confirm bucket` |
| `TODO` | `TODO` | `TODO — map services? search index?` |

---

## Contract Versioning

- **Schema Registry:** `TODO — where are facility schemas stored?`
- **Breaking Change Policy:** `TODO — how are consumers notified?`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/facilities-publisher`.*
