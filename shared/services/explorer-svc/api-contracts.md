<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-28 -->
# Explorer Service — API Contracts

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Latest | `https://latest.explorer.wdprapps.disney.com/explorer-service` |
| Stage | `https://stage.explorer.wdprapps.disney.com/explorer-service` |
| Load | `https://load.explorer.wdprapps.disney.com/explorer-service` |
| Production | `https://explorer.wdprapps.disney.com/explorer-service` |

## Swagger

Available at `{base-url}/swagger.yaml`. Requires Bearer token with `wdpro-explorer-admin-crud` scope.

## Authentication

- **OneID JWT** (v4 and v5) — validated via `jwt.namedConfigs` per environment
- **Client ID control** — `jwt.clientId.oneId.allowedNames` restricts access to registered clients (e.g., `TPR-WDW-LBJS.WEB`, `TPR-WDW-LBSDK.IOS`, `TPR-DLR-LBSDK.AND`)
- Admin/debug endpoints require `wdpro-explorer-admin-crud` scope

## Partial Response (Field Filtering)

Explorer supports field filtering via the `wdpr-partial-response` library.

**Usage:**
```
GET /explorer-service/finder-data/detail/{id}?fields=name,coordinates,schedule
```

- `fields` query parameter accepts comma-separated field paths
- Omitting `fields` returns the full response
- Invalid field names are silently ignored

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

## Error Responses

**CXF-level errors** (unexpected failures):
```json
{
  "errors": [
    {
      "message": "Internal Server Error",
      "typeId": "UNEXPECTED_ERROR"
    }
  ]
}
```

**Data-level errors** (partial failures — individual entities that failed within a successful response):
```json
{
  "results": [ ... ],
  "errors": [
    {
      "exception": "java.lang.NullPointerException",
      "message": "Facility data unavailable",
      "facilityId": "80007944"
    }
  ]
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
