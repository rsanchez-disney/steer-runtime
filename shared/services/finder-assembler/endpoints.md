# Finder Assembler Service (FAS) — Endpoints

Base context path: `/finder-assembler-service`

## Notification Endpoints

These receive change events from DScribe (content management system).

| Method | Path | Description |
|--------|------|-------------|
| POST | `/finder-assembler-service/notify-change` | **Deprecated.** Notifications now arrive via SQS (sourced from D-Scribe → Yellowjacket SNS → SQS). This HTTP endpoint remains for backward compatibility but is no longer the primary ingestion path. |

### notify-change Behavior
1. Accepts notification payload identifying changed entity
2. Fetches updated content from upstream data sources
3. Assembles cache model using `finder-cache-models`
4. Diffs against existing cache entry (Javers)
5. If changed: writes to Redis, publishes SNS event
6. If unchanged: no-op (avoids unnecessary downstream churn)

## Admin Cache Management Endpoints (RestFasAdminServiceImpl)

Used by operations teams to manually manage cache state.

| Method | Path | Description |
|--------|------|-------------|
| POST | `/finder-assembler-service/admin/cache/rebuild` | Triggers full or partial cache rebuild |
| POST | `/finder-assembler-service/admin/cache/evict` | Evicts specific cache entries |
| POST | `/finder-assembler-service/admin/cache/refresh` | Refreshes specific entities without full rebuild |
| POST | `/finder-assembler-service/admin/cache/refresh-entity` | Refreshes a specific entity by ID |
| POST | `/finder-assembler-service/admin/cache/ttl-extender` | Extends TTL for cache entries |
| GET | `/finder-assembler-service/admin/cache/status` | Returns cache health/statistics |
| GET | `/finder-assembler-service/admin/publisher-status` | Publisher status for a destination |
| GET | `/finder-assembler-service/admin/quartz-status` | Quartz scheduler job status |
| POST | `/finder-assembler-service/admin/pause-jobs` | Pause Quartz jobs |
| POST | `/finder-assembler-service/admin/resume-jobs` | Resume Quartz jobs |

### Admin Access
Admin endpoints require elevated authorization via authz library (OAuth2 scopes).

## Notification Endpoints (RestFasNotificationServiceImpl)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/finder-assembler-service/notify-change` | **Deprecated.** Facility change notification (now via SQS) |
| POST | `/finder-assembler-service/notify-change/v2` | **Deprecated.** V2 facility change notification (now via SQS) |
| POST | `/finder-assembler-service/notify-schedule-change` | Schedule change notification |
| POST | `/finder-assembler-service/notify-schedule-change/meal-period` | Meal period schedule change notification |
| POST | `/finder-assembler-service/notify-change/media-bundle` | Media bundle change notification |

### Primary Ingestion Path
Notifications now arrive via SQS (sourced from D-Scribe → Yellowjacket SNS → SQS). HTTP endpoints remain for backward compatibility.

### notify-change Behavior
1. Accepts notification payload identifying changed entity
2. Fetches updated content from upstream data sources
3. Assembles cache model using `finder-cache-models`
4. Diffs against existing cache entry (Javers)
5. If changed: writes to Redis, publishes SNS event
6. If unchanged: no-op (avoids unnecessary downstream churn)

## Transportation Endpoints (RestTransportationServiceImpl)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/finder-assembler-service/update-transportation-arrivals` | Update transportation arrival data (being retired → Transportation Publisher) |

## Debug / Cache Viewer Endpoints (RestFasDebugServiceImpl)

Used for troubleshooting and inspecting cached state.

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finder-assembler-service/debug/cache/detail/{key}` | View raw cached entity detail |
| GET | `/finder-assembler-service/debug/cache/entity-index` | View entity index |
| GET | `/finder-assembler-service/debug/cache/url-friendly-id-index` | View URL-friendly ID index |
| GET | `/finder-assembler-service/debug/cache/media-bundle-index` | View media bundle index |
| GET | `/finder-assembler-service/debug/cache/refurbishments-index` | View refurbishments index |
| GET | `/finder-assembler-service/debug/cache/resort-grouping-index` | View resort grouping index |
| GET | `/finder-assembler-service/debug/cache/cache-id-index` | View cache ID index |

## Health / Operational

| Method | Path | Description |
|--------|------|-------------|
| GET | `/finder-assembler-service/health` | Liveness/readiness check |
| GET | `/finder-assembler-service/info` | Build info, version, environment |
