<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Schedules Publisher — Patterns & Conventions

## Error Handling

The sync endpoint aggregates reports per `DatabaseType`. Each `Report` contains:
- Success/failure status
- Count of documents processed
- Concurrency error count

If any report has concurrency errors, the endpoint returns HTTP 409 (Conflict) with the full report map. Unhandled exceptions return HTTP 500 with the error message.

## Concurrency Handling

Couchbase writes may encounter CAS (Compare-And-Swap) conflicts when concurrent writes target the same document. These are tracked as `concurrencyErrors` in the report and surfaced via HTTP 409.

## Multi-Database Writes

Schedules are written to multiple Couchbase databases:
- `park-platform-pub` — primary public bucket for mobile apps
- TXP public bucket — secondary destination for TXP consumers

The `DatabaseType` enum tracks which database each report belongs to.

## Data Types Synced

| Type | Method | Description |
|------|--------|-------------|
| Schedules | `syncSchedules()` | Operating hours and schedule data |
| Blockouts | `syncBlockouts()` | Annual pass blockout dates |
| Closed Restaurants | `syncClosedRestaurants()` | Restaurant closure information |

## Idempotency

Schedule syncs are full-replacement operations — each run fetches the complete current state and upserts all documents. Safe to retry.

## Common Gotchas

- Destination must be lowercase (`wdw`, `dlr`, `hkdl`) — case-sensitive lookup
- Concurrency errors don't prevent data from being written; they indicate some documents may need re-sync
- Both Couchbase connections (public + txp) require separate credentials from Vault
- Meal period and annual pass configurations are externalized via properties
