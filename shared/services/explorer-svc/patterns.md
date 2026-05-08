# Explorer Service — Patterns

## Two-Tier Caching (EhCache + Redis)

### Strategy

Explorer uses a two-tier cache to balance latency and consistency:

| Tier | Technology | Scope | TTL | Use Case |
|------|-----------|-------|-----|----------|
| L1 | EhCache | Per-JVM | Short (minutes) | `finder-data` endpoints — hot path |
| L2 | Redis | Shared cluster | Longer (hours) | `finder-data-feed` endpoints — cross-instance |

### Read Path

1. Check EhCache (L1). If hit → return immediately.
2. On L1 miss, check Redis (L2). If hit → populate L1, return.
3. On L2 miss, read from Elasticsearch or source, populate both tiers.

### Cache Invalidation

- FAS publishes updated models to Redis; Explorer's L2 reflects changes on next read.
- L1 (EhCache) expires via TTL. No active invalidation push to individual JVMs.
- Manual invalidation available via debug endpoints for operational recovery.

### Shared Models

Both Explorer and FAS use `finder-cache-models 465.0.0.340` for serialization compatibility. Model version must stay in sync across services.

## Partial Response

Implemented via `wdpr-partial-response` library integrated as a JAX-RS response filter.

- Intercepts outbound JSON responses.
- Prunes fields not requested in the `fields` query parameter.
- Applied after serialization — no impact on business logic or caching.
- Cached responses store full objects; filtering happens at response time.

## Authentication Patterns

- Gateway-level token validation for all public endpoints.
- Service-to-service auth via internal tokens for Helix endpoints.
- Secrets (tokens, Redis credentials, ES credentials) managed via Vault.
- Environment-specific config via mpropz.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Cache miss + source unavailable | Return stale cached data if available, else 503 |
| Invalid facility ID | 404 with correlation ID |
| Malformed request | 400 with validation details |
| Upstream timeout | Circuit breaker, fallback to cache |
| Internal error | 500 with correlation ID for tracing |

All error responses include a `correlationId` for distributed tracing across Explorer, FAS, and upstream systems.
