# Facility Service — Patterns

## Caching (Redis Multi-Tier)

### Stack
- **Library**: wdpr-ra-java-cache-manager (wraps Redisson)
- **Store**: Redis cluster
- **Strategy**: Multi-tier — local in-memory (short TTL) → Redis (medium TTL) → database (source of truth)

### Flow
```
Request → Local Cache (hit?) → Redis Cache (hit?) → Database → Populate caches → Response
```

### Annotations & Controls
- `@CacheControlHeader` — Sets HTTP `Cache-Control` response headers per endpoint
- Cache keys typically: `facility:{type}:{id}:{locale}`
- TTLs configured per entity type via mpropz properties
- Admin endpoints for cache invalidation (`/admin/cache/clear`)

### Cache Invalidation
- TTL-based expiration (primary)
- Manual purge via admin endpoints (operational)
- Event-driven invalidation for critical data updates

## Error Handling (Exception Mapper)

### Pattern
CXF exception-mapper intercepts all exceptions and produces consistent error responses.

```java
@Provider
public class FacilityExceptionMapper implements ExceptionMapper<Exception> {
    @Override
    public Response toResponse(Exception ex) {
        // Maps exception type → HTTP status + error body
    }
}
```

### Exception Hierarchy
- `FacilityNotFoundException` → 404
- `InvalidRequestException` → 400
- `AuthorizationException` → 403
- `ServiceUnavailableException` → 503
- Unhandled `Exception` → 500

### Logging
All exceptions logged via wdpr-loggingapi with correlation IDs for tracing.

## Authentication & Authorization

### wdpr-authz Integration
- **Version**: 3.25.0
- **Filter**: Servlet filter validates JWT on every request
- **Token source**: OAuth 2.0 token endpoint (WDPR auth infrastructure)

### `@ClientIdControl`
Annotation-based access control restricting endpoints to specific registered client IDs:

```java
@GET
@Path("/attractions/{id}")
@ClientIdControl(allowedClients = {"mobile-app", "web-portal"})
public Response getAttraction(@PathParam("id") String id) { ... }
```

### Auth Flow
```
Request → Auth Filter (JWT validation) → @ClientIdControl check → Endpoint logic
```

## Configuration (mpropz + Consul)

### mpropz
- Environment-specific property files
- Loaded at startup, defines DB connections, cache TTLs, feature flags
- Pattern: `application-{env}.properties`

### Consul
- Dynamic configuration (no restart required)
- Key-value store for runtime toggles and operational parameters
- Watched keys trigger config refresh in-app

### Typical Config Properties
```properties
# Database
db.oracle.url=jdbc:oracle:thin:@host:1521:sid
db.mysql.url=jdbc:mysql://host:3306/facility

# Cache
cache.redis.cluster.nodes=redis-node1:6379,redis-node2:6379
cache.attraction.ttl.seconds=300
cache.schedule.ttl.seconds=60

# Feature flags (Consul-managed)
feature.waitTimes.enabled=true
feature.newScheduleFormat.enabled=false
```

## ETag Support

### Pattern
- Service generates ETag from content hash on response
- Subsequent requests with `If-None-Match` header compared against current ETag
- Returns `304 Not Modified` if unchanged, saving bandwidth and processing

### Implementation
Applied at the webservice layer, typically via CXF interceptor or within resource methods for fine-grained control.
