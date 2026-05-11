# Content Publisher — Channel Contracts

> **Channel:** `content-publisher`
> **Platform:** Dash (content propagation)

---

## Couchbase Channel Patterns

<!-- TODO: Document the Sync Gateway channel naming conventions -->

- **Channel Naming:** `TODO — e.g., content::{type}::{locale}::{id}`
- **Channel Granularity:** `TODO — per-entity / per-type / per-region?`
- **Access Control:** `TODO — which consumers subscribe to which channels?`

---

## Document ID Patterns

<!-- TODO: Document the key structure used in Couchbase -->

- **ID Format:** `TODO — e.g., content::{entityType}::{entityId}`
- **Versioning:** `TODO — is version embedded in key or document body?`
- **Collision Strategy:** `TODO — how are duplicate keys handled?`

---

## Supported Destinations

<!-- TODO: Confirm all downstream consumers -->

| Destination | Protocol | Notes |
|-------------|----------|-------|
| Couchbase (primary) | SDK / Sync Gateway | `TODO — confirm bucket` |
| `TODO` | `TODO` | `TODO — any secondary destinations?` |

---

## Contract Versioning

- **Schema Registry:** `TODO — where are schemas stored?`
- **Breaking Change Policy:** `TODO — how are consumers notified?`

---

*Stub generated 2026-04-29. Fill TODOs from repo `wdpro-development/content-publisher`.*
