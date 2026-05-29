<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-28 -->
# Explorer Service — Endpoints

Context path: `/explorer-service`

## Finder Data Endpoints (RestExplorerServiceImpl)

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

## TXP Endpoints (RestTxpExplorerServiceImpl)

TXP-specific data feed endpoints.

| Endpoint Pattern | Purpose |
|-----------------|---------|
| `/txp-finder-data-feed/detail/{id}` | TXP detail data |
| `/txp-finder-data-feed/list` | TXP listings |

## Mobile Endpoints (RestExplorerMobileServiceImpl)

Optimized bulk endpoints for mobile clients.

| Endpoint Pattern | Purpose |
|-----------------|---------|
| `/mobile/bulk-facilities` | Batch facility retrieval |
| `/mobile/facets` | Available filter facets |
| `/mobile/schedules` | Bulk schedule data |
| `/mobile/resort-groups` | Resort grouping metadata |
| `/mobile/destination-facet-groups` | Destination-level facet groups |
| `/mobile/ancestor-activities-schedules` | Ancestor activity schedules |
| `/mobile/business-hours` | Business hours |

## Helix Endpoints (RestExplorerHelixServiceImpl)

Internal endpoints for cast and guest-facing applications.

| Endpoint Pattern | Purpose |
|-----------------|---------|
| `/helix/guest-data/detail/{id}` | Guest Discovery data for a given entity |
| `/helix/guest-data/list` | Guest Discovery data listing |
| `/helix/cast-data/detail/{id}` | Cast Discovery data (Guest + KnowsMore + advisories + associations) |
| `/helix/cast-data/list` | Cast Discovery data listing |

### Guest/Cast API Overview

| API | Returns | Data Source |
|-----|---------|-------------|
| Guest Detail | Guest Discovery data for a given enterprise ID + entity type | FAS cache (from Watcher guest-facing content) |
| Guest Listing | Filtered list of guest-facing entities | FAS cache |
| Cast Detail | Guest Discovery data + Cast Discovery data (KnowsMore, advisories, associations, accommodations) | FAS cache + Watcher Cast endpoints |
| Cast Listing | Same entity IDs as Guest Listing | FAS cache |

**Cast Discovery data** extends Guest data with:
- `knowsMore` — DScribe/KnowsMore content (accordion modules with Cast-only operational info)
- `advisories` — Active advisories for the entity
- `associations` — Related entities by type (ActivityProduct, FoodBeverageFacility, MerchandiseFacility)
- `accommodations` — Room types with system codes, ADA flags, and guest-facing names (resorts only)

**Supported entity types:** Attraction, Character, DiningEvent, DinnerShow, Entertainment, EntertainmentVenue, Event, GuestService, Land, MerchandiseFacility, Overview, Recreation, RecreationActivity, Resort, Restaurant, Spa, ThemePark, Tour, Transportation, WaterPark

**Supported brands:** WDW, DLR (en-US locale)

## Netomi Endpoints (RestExplorerNetomiServiceImpl)

Integration endpoints for Netomi AI chatbot.

| Endpoint Pattern | Purpose |
|-----------------|---------|
| `/netomi/facility/{id}` | Facility details for Netomi |
| `/netomi/facilities-mapping` | Facilities mapping for Netomi |

## Yext Endpoints (RestExplorerYextServiceImpl)

Integration endpoints for Yext location management.

| Endpoint Pattern | Purpose |
|-----------------|---------|
| `/yext/facility/{id}` | Facility data formatted for Yext |

## Debug / Operational (RestExplorerDebugServiceImpl)

| Endpoint | Purpose |
|----------|---------|
| `/debug/cache/status` | Cache status (Redis keys, EhCache stats) |
| `/debug/cache/ehcache-status` | EhCache-specific status |
| `/debug/cache/viewer/detail/{key}` | View raw cached entity |
| `/debug/cache/viewer/list` | View cached list |
| `/debug/cache/viewer/ancestors/{key}` | View cached ancestors |

## Actuator / Admin (RestActuatorServiceImpl)

| Endpoint | Purpose |
|----------|---------|
| `/admin/actuator/health` | Health check |
| `/admin/actuator/info` | Build/version info |
| `/admin/actuator/env` | Environment properties |
