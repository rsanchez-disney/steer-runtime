# Business Rules — DLP Guest Membership Provider

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | ECS service healthy + API Gateway responding |
| Response time (p95) | < 2s | Membership lookup endpoint |
| Error rate | < 1% | HTTP 5xx responses |

## Peak Periods

- Ticket/package purchase spikes (seasonal sales, promotions)
- Disney+ promotion periods — increased membership verification volume
- Black Friday / holiday booking periods

## Business Logic

- Disney+ subscribers may receive discounts to book Packages, Tickets, and specific hotel rooms for certain dates
- Two key endpoints:
  - **GET membership** — Retrieves membership info for a guest by SWID; checks Redis cache first, then calls Disney+ Streaming Subscriber Benefits API if not cached
  - **GET jwks** — Validates that the caller is an authorized application to make calls to the Disney+ streaming API (JWKS-based authentication)
- Disney+ was the first membership integration; new membership integrations are in development
- Redis cache reduces calls to Disney+ API and improves response times
- MariaDB stores persistent membership data

## Dependencies

- **Disney+ Streaming Subscriber Benefits API** — Source of truth for guest subscription/membership status
- **Redis** — Cache layer for membership data (reduces API calls to Disney+)
- **MariaDB (RDS)** — Persistent storage for membership records
- **AuthZ Service** — OAuth2 token validation
- **DLP Mobile App / Web** — Frontend consumers that trigger membership checks during booking flows

## Impact Classification

- **Full outage (GET membership):** Guests unable to receive applicable discounts for packages or tickets based on their Disney+ subscription. Booking flow continues but without membership discounts.
- **Full outage (GET jwks):** Authorization errors preventing frontend components from calling Disney+ streaming API. Membership verification completely blocked.
- **Degraded:** Slow membership lookups if Redis cache is unavailable (falls back to direct Disney+ API calls). Stale cached data if Disney+ API temporarily unreachable.
