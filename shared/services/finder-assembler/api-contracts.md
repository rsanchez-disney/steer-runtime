# Finder Assembler Service (FAS) — API Contracts

## Base URLs

| Environment | Base URL |
|-------------|----------|
| latest | `https://latest.fas.wdprapps.disney.com/finder-assembler-service` |
| stage | `https://stage.fas.wdprapps.disney.com/finder-assembler-service` |
| load | `https://load.fas.wdprapps.disney.com/finder-assembler-service` |
| prod | `https://fas.wdprapps.disney.com/finder-assembler-service` |

## Authentication

- **Service-to-service**: Token-based auth via Vault-managed secrets
- **Admin endpoints**: Require elevated service credentials
- **Debug endpoints**: Restricted by environment or LaunchDarkly flag

## Notification Payload Format

### POST `/notify-change`

DScribe sends this payload when content is created, updated, or deleted.

**Request:**
```json
{
  "id": "facility-id-or-entity-id",
  "type": "Attraction|Restaurant|Hotel|Entertainment|...",
  "action": "CREATE|UPDATE|DELETE",
  "timestamp": "2026-04-29T17:00:00Z",
  "source": "dscribe",
  "metadata": {
    "correlationId": "uuid",
    "environment": "prod",
    "changedFields": ["name", "description", "schedule"]
  }
}
```

**Response (200 OK):**
```json
{
  "status": "ACCEPTED",
  "correlationId": "uuid",
  "processingTime": 142
}
```

**Response (202 Accepted):** Returned when processing is queued asynchronously.

**Error Responses:**
| Code | Meaning |
|------|---------|
| 400 | Invalid payload (missing required fields) |
| 401 | Unauthorized |
| 500 | Internal processing error |

## SNS/SQS Published Event Format

After cache assembly, FAS publishes change events downstream:

```json
{
  "eventType": "CACHE_UPDATED",
  "entityId": "facility-id",
  "entityType": "Attraction",
  "action": "UPDATE",
  "timestamp": "2026-04-29T17:00:01Z",
  "cacheVersion": 12345,
  "correlationId": "uuid",
  "diff": {
    "changedPaths": ["name.en_US", "schedule.operating"]
  }
}
```

## Content-Type

All endpoints consume and produce `application/json`.
