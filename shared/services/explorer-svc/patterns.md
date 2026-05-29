<!-- owner: @finder-services-team -->
<!-- last-updated: 2026-05-28 -->
# Explorer Service — Patterns

## Two-Tier Caching (EhCache + Redis)

### Strategy

Explorer uses a two-tier cache to balance latency and consistency:

| Tier | Technology | Scope | Update Mechanism | Use Case |
|------|-----------|-------|------------------|----------|
| L1 | EhCache | Per-JVM | Redis Pub/Sub subscription (primary), TTL expiry (fallback) | `finder-data` endpoints — hot path |
| L2 | Redis | Shared cluster | Written by FAS | `finder-data-feed` endpoints — cross-instance |

### L1 Cache Update (Redis Subscription)

The primary mechanism for keeping EhCache in sync is a **Redis Pub/Sub subscription**:

1. FAS writes updated data to Redis and publishes a message to a Redis channel.
2. Explorer's `RedisMessageListenerDetail` receives the message.
3. The listener calls `localDetailCache.refresh(cacheKey)` to update the corresponding EhCache entry.

EhCache also has a configurable TTL as a safety net (default: 600s for detail), but the subscription-based refresh is the happy path.

### Read Path

1. Check EhCache (L1). If hit → return immediately.
2. On L1 miss, check Redis (L2). If hit → populate L1, return.
3. On L2 miss → return 404 Not Found.

### Shared Models

Both Explorer and FAS use `finder-cache-models` (v470.0.0.345) for serialization compatibility. Model version must stay in sync across services.

## Partial Response

Implemented via `wdpr-partial-response` library integrated as a JAX-RS response filter.

- Intercepts outbound JSON responses.
- Prunes fields not requested in the `fields` query parameter.
- Applied after serialization — no impact on business logic or caching.
- Cached responses store full objects; filtering happens at response time.

## Authentication & Authorization

Explorer uses the **authz library** (OAuth2 framework) with endpoint-level scope control defined in `scope.json`:

- **Regular endpoints**: Require a valid OAuth2 Bearer token (validated by authz filter)
- **Debug/admin endpoints**: Require `wdpro-explorer-admin-crud` scope
- **OneID JWT support**: v4 and v5 tokens validated via `jwt.namedConfigs`
- **Client ID control**: `jwt.clientId.oneId.allowedNames` restricts access to registered clients

Scope definitions in `scope.json` map URL patterns to required scopes and HTTP methods.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Cache miss (L1 + L2) | 404 Not Found (`RESOURCE_NOT_FOUND`) |
| Individual entity processing failure | Partial success — entity listed in `errors` array alongside successful `results` |
| Malformed request | 400 Bad Request |
| CXF framework error | `{"errors": [{"message": "...", "typeId": "UNEXPECTED_ERROR"}]}` |

## Common Gotchas

- Explorer never calls upstream source systems directly — if data is missing from Redis, it's a FAS issue
- `finder-cache-models` version must match between FAS and Explorer or deserialization fails
- EhCache is per-JVM — different instances may briefly serve different data between Redis publish and subscription delivery
- Partial response filtering is applied post-serialization, so cache keys are not affected by `fields` param
