# Facility Service — API Contracts

## Base URLs

| Environment | Base URL |
|-------------|----------|
| Latest | `https://latest.facility.wdprapps.disney.com/facility-service` |
| Stage | `https://stage.facility.wdprapps.disney.com/facility-service` |
| Load | `https://load.facility.wdprapps.disney.com/facility-service` |
| Production | `https://prod.facility.wdprapps.disney.com/facility-service` |

## Authentication & Authorization

- **Library**: wdpr-authz 3.25.0
- **Mechanism**: OAuth 2.0 Bearer tokens (JWT)
- **Header**: `Authorization: Bearer <token>`
- **Client control**: `@ClientIdControl` annotation restricts endpoints to authorized client IDs
- **Token validation**: JWT signature verified against WDPR auth infrastructure

### Required Headers

```
Authorization: Bearer <oauth-token>
Accept: application/json
```

## Response Format

### Success Response

```json
{
  "id": "80007944",
  "type": "attraction",
  "name": "Space Mountain",
  "links": { ... },
  "coordinates": { ... },
  "ancestors": [ ... ]
}
```

### Collection Response

```json
{
  "entries": [ ... ],
  "totalCount": 142,
  "links": {
    "self": "/facility-service/attractions?page=1",
    "next": "/facility-service/attractions?page=2"
  }
}
```

### ETag Support

- Responses include `ETag` header for cacheable resources
- Clients send `If-None-Match` header for conditional requests
- Returns `304 Not Modified` when content unchanged

### Cache-Control

- `@CacheControlHeader` annotation sets per-endpoint cache directives
- Typical: `Cache-Control: max-age=300, public`

## Error Handling

Errors are returned in a consistent format via the exception-mapper:

### Error Response Structure

```json
{
  "errors": [
    {
      "code": "FACILITY_NOT_FOUND",
      "message": "Facility with id 12345 not found",
      "status": 404
    }
  ]
}
```

### HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 304 | Not Modified (ETag match) |
| 400 | Bad Request (invalid params) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient client scope) |
| 404 | Resource not found |
| 500 | Internal server error |
| 503 | Service unavailable |

## Content Types

- Request: `application/json`
- Response: `application/json` (default), `application/xml` (select endpoints)
