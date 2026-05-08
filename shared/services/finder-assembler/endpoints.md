# Finder Assembler Service (FAS) — Endpoints

Base context path: `/finder-assembler-service`

## Notification Endpoints

These receive change events from DScribe (content management system).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/finder-assembler-service/notify-change` | Primary notification endpoint. DScribe calls this when content changes. Triggers cache assembly pipeline. |

### notify-change Behavior
1. Accepts notification payload identifying changed entity
2. Fetches updated content from Facility Service + backends
3. Assembles cache model using `finder-cache-models`
4. Diffs against existing cache entry (Javers)
5. If changed: writes to Redis + Couchbase, publishes SNS/SQS event
6. If unchanged: no-op (avoids unnecessary downstream churn)

## Admin Cache Management Endpoints

Used by operations teams to manually manage cache state.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/finder-assembler-service/admin/cache/rebuild` | Triggers full or partial cache rebuild |
| POST | `/finder-assembler-service/admin/cache/evict` | Evicts specific cache entries |
| POST | `/finder-assembler-service/admin/cache/refresh` | Refreshes specific entities without full rebuild |
| GET | `/finder-assembler-service/admin/cache/status` | Returns cache health/statistics |

### Admin Access
Admin endpoints require elevated authorization. Access is controlled via service-to-service auth tokens.

## Debug / Cache Viewer Endpoints

Used for troubleshooting and inspecting cached state.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finder-assembler-service/debug/cache/{key}` | View raw cached content for a given key |
| GET | `/finder-assembler-service/debug/cache/{key}/diff` | View Javers diff history for an entity |
| GET | `/finder-assembler-service/debug/cache/{key}/metadata` | View cache metadata (TTL, last-updated, source) |

### Debug Access
Debug endpoints are typically restricted to non-production environments or gated behind LaunchDarkly feature flags.

## Health / Operational

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finder-assembler-service/health` | Liveness/readiness check |
| GET | `/finder-assembler-service/info` | Build info, version, environment |
