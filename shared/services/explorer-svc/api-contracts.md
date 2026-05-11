# Explorer Service — API Contracts

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Latest | `https://latest.explorer.wdprapps.disney.com/explorer-service` |
| Stage | `https://stage.explorer.wdprapps.disney.com/explorer-service` |
| Load | `https://load.explorer.wdprapps.disney.com/explorer-service` |
| Production | `https://prod.explorer.wdprapps.disney.com/explorer-service` |

## Authentication

Requests require a valid auth token passed via standard headers. Token validation is handled at the gateway/service layer. Helix endpoints may require additional cast/guest identity context.

## Partial Response (Field Filtering)

Explorer supports field filtering via the `wdpr-partial-response` library. Clients can request a subset of fields to reduce payload size.

**Usage:**
```
GET /explorer-service/finder-data/detail/{id}?fields=name,coordinates,schedule
```

- The `fields` query parameter accepts a comma-separated list of top-level or nested field paths.
- Omitting `fields` returns the full response.
- Invalid field names are silently ignored.

## Response Format

All endpoints return JSON (`application/json`).

**Standard success response:**
```json
{
  "id": "80007944",
  "type": "theme-park",
  "name": "Magic Kingdom Park",
  "coordinates": { "lat": 28.4177, "lng": -81.5812 },
  "schedule": { ... }
}
```

**List responses include metadata:**
```json
{
  "totalCount": 142,
  "results": [ ... ],
  "facets": { ... }
}
```

**Error response:**
```json
{
  "status": 404,
  "message": "Facility not found",
  "correlationId": "abc-123"
}
```

## Common Query Parameters

| Parameter | Description |
|-----------|-------------|
| `fields` | Partial response field filter |
| `id` | Facility identifier(s) |
| `type` | Facility type filter |
| `destination` | Destination/resort filter |
| `date` | Date for schedule queries (YYYY-MM-DD) |
