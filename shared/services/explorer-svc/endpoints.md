# Explorer Service — Endpoints

Context path: `/explorer-service`

## Finder Endpoints

Primary consumer-facing APIs for facility detail, listings, maps, calendars, and park hours.

| Endpoint Pattern | Purpose | Cache Tier |
|-----------------|---------|------------|
| `/finder-data/detail/{id}` | Single facility detail | Local (EhCache) |
| `/finder-data/list` | Filtered facility listings | Local (EhCache) |
| `/finder-data/map` | Map-view facility data | Local (EhCache) |
| `/finder-data/calendar` | Schedule/calendar data | Local (EhCache) |
| `/finder-data/parkhours` | Theme park operating hours | Local (EhCache) |
| `/finder-data-feed/detail/{id}` | Feed-oriented detail | Remote (Redis) |
| `/finder-data-feed/list` | Feed-oriented listings | Remote (Redis) |

**Key distinction:** `finder-data` endpoints serve from local EhCache for lowest latency. `finder-data-feed` endpoints serve from Redis for cross-instance consistency.

## Mobile Endpoints

Optimized bulk endpoints for mobile clients.

| Endpoint Pattern | Purpose |
|-----------------|---------|
| `/mobile/bulk-facilities` | Batch facility retrieval |
| `/mobile/facets` | Available filter facets |
| `/mobile/schedules` | Bulk schedule data |
| `/mobile/resort-groups` | Resort grouping metadata |

## Helix Endpoints

Internal endpoints for cast and guest-facing applications.

| Endpoint Pattern | Purpose |
|-----------------|---------|
| `/helix/cast-data` | Cast member operational data |
| `/helix/guest-data` | Guest-facing experience data |

## Debug / Operational Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/health` | Health check |
| `/info` | Build/version info |
| `/cache/stats` | Cache hit/miss statistics |
| `/cache/clear` | Manual cache invalidation (admin) |
