<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-26 -->
# Facility Status Publisher — Patterns & Conventions

## Error Handling

### Response Pattern

All endpoints return typed reports (`EntityUpdateReport` or `EntitySingleReport`) with error details:

| Error Type | HTTP Status | Meaning |
|------------|-------------|---------|
| Validation errors | 400 | Missing/invalid request parameters |
| `NO_ENTITY_TO_DELETE` | 404 | Entity not found for deletion |
| `SYNC_CONFLICT_ERROR` | 409 | CAS conflict on Couchbase write |
| `UNKNOWN_ERROR` | 500 | Unrecoverable internal error |
| Other | 422 | Unprocessable entity |

### Multi-Database Reports

Status updates write to multiple databases. Reports are keyed by `DatabaseType` — the primary response uses `DatabaseType.PARK_PUBLIC`.

## Kafka Integration

Real-time status events arrive via Kafka topics. The `facility-status-messaging` module contains the Kafka consumer that processes events and delegates to the same update service used by the REST endpoints.

Message format:
```json
{
  "entityId": "facility-id",
  "waitTimeUpdate": true,
  "operatingStatusUpdate": false
}
```

## Exclusive List Mode

When `exclusive-list=true` on the batch update endpoint, only facilities in the request body remain active. Facilities not in the list are effectively marked as inactive. Use with caution — typically for full-state reconciliation.

## Request Source Filtering

`RequestSourceFilter` validates and logs the source of incoming requests for audit and debugging.

## Idempotency

Status updates are upsert-based (last-write-wins). Safe to retry. For forecasted wait times, the entire forecast document for a facility is replaced.

## Scheduled Sync

A periodic sync runs based on `trigger.SYNC_TIME` configuration, with a configurable startup delay (`app.delay`) and threshold (`app.threshold`).

## Common Gotchas

- Destination enum is case-sensitive — must be lowercase (`wdw`, `dlr`, `hkdl`)
- Dining status only supports `wdw` and `dlr` (not `hkdl`)
- `trigger-facility-status` requires either `facilityId` or `destinationId` (not both empty)
- Kafka consumer requires correct topic name in `messaging.kafka.facility-update.topic` property
- Vault properties required: `couchbase.server.password`, `facility.auth.client-secret`
- `DESTINATIONS_UPDATE_ENABLED` env var controls whether destination-wide updates are allowed
