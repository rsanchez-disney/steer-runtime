# Java + Spring Boot Conventions

## Code Style

- Google Java Style Guide or project-specific style
- Organize by feature or layer (`resource`, `service`, `repository`, `dto`, `model`, `config`)
- Prefer immutability — use `final` fields, unmodifiable collections
- Document public APIs with Javadoc
- Format with project formatter (`mvn formatter:format` or IDE settings)

## Method Contracts

- Never return `null` — use `Optional`, empty collections, or throw exceptions
- If `null` is accepted/returned, document it in Javadoc
- Don't pre-initialize variables assigned from multiple paths — let the compiler enforce

## Null Handling

Null checks only when a value could reasonably be null:
- External input (API, file, network)
- Methods that explicitly document null returns

No defensive null checks on internal methods that should never return null.

## Exception Handling

- Wrap checked exceptions in domain-specific runtime exceptions
- Always pass the original exception as `cause`
- Handle runtime exceptions at the resource layer with JAX-RS `ExceptionMapper` providers
- Never swallow exceptions silently
- Use problem-detail format (RFC 7807) for error responses

## Spring Boot Specifics (version-adaptive)

- **1.5.x–2.x**: `javax.persistence`, `javax.validation`
- **3.x+**: `jakarta.persistence`, `jakarta.validation`
- Constructor injection — never `@Autowired` on fields (all versions)
- `@ConfigurationProperties` with `@Validated` for typed config (2.x+)
- `@Valid` on all request body parameters (all versions)
- Return DTOs from resource classes — never JPA entities (all versions)
- Use `@Transactional` on service methods that modify data (all versions)
- JAX-RS `ExceptionMapper` for global exception handling (all versions)

## REST API Design

- Resource-oriented URLs: `/api/v1/{resource}`
- HTTP methods: GET (read), POST (create), PUT (full update), PATCH (partial), DELETE
- Pagination: `page`, `size`, `sort` parameters on list endpoints
- Consistent error response format across all endpoints
- API versioning in URL path

## Data Access

- Spring Data JPA repositories
- Use `@EntityGraph` or `JOIN FETCH` to avoid N+1 queries
- Always paginate list queries
- Parameterized queries only — never string concatenation
- Flyway or Liquibase for schema migrations

## Logging

- SLF4J + Logback (Spring Boot default)
- `LoggerFactory.getLogger(ClassName.class)`
- Structured JSON in production
- Correlation IDs via MDC
- Never log passwords, tokens, PII, or full request/response bodies

## Testing (MANDATORY)

Unit tests are required for every code change. No exceptions.

- JUnit 5 + Mockito for unit tests (JUnit 4 acceptable for legacy Spring Boot 1.5 projects)
- `@SpringBootTest` + `@Transactional` for integration tests
- Test naming: `{ClassName}Test.java`
- AssertJ `assertThat` over JUnit assertions
- Cover happy path + error cases + edge cases
- Target: ≥80% line coverage
- Bug fixes must include a regression test

## Dependency Management

- Maven with `spring-boot-starter-parent` BOM
- Pin versions — no SNAPSHOT in main/release branches
- Verify with `mvn clean verify`
- Remove unused dependencies regularly

## Security

- Spring Security for authentication/authorization
- Input validation on all endpoints (`@Valid`, `@NotNull`, `@Size`, etc.)
- CORS configured explicitly — never `allowAll` in production
- No secrets in code, properties, or logs
- Use environment variables or secrets manager for credentials

## Design by Contract

- Validate preconditions at public API boundaries — fail fast with clear messages
- Use `Objects.requireNonNull(param, "param must not be null")` at constructor/method entry
- Postconditions: assert return values meet documented contracts in tests
- Class invariants: enforce via constructor validation + immutable state where possible

## Immutability & Value Objects

- Prefer immutable objects — `final` class, `final` fields, no setters
- Use Java records (17+) or Lombok `@Value` for value objects
- Collections returned from methods should be unmodifiable (`List.copyOf()`, `Collections.unmodifiableList()`)
- DTOs should be immutable — construct fully via constructor or builder, never mutate after creation
- Mutable state must be explicitly justified and thread-safety documented

## Error Handling Strategy

- Define a domain exception hierarchy: `ServiceException` → `EntityNotFoundException`, `BusinessRuleViolationException`, etc.
- Never use exceptions for flow control — exceptions are for exceptional conditions
- Fail fast: detect invalid state early, don't propagate corrupted data
- Always include context in exceptions: entity ID, operation attempted, constraint violated
- Log at the boundary where the exception is handled, not where it's thrown
- Use JAX-RS `ExceptionMapper` — never leak stack traces to clients
- Retry-safe operations: document idempotency guarantees on service methods

## Concurrency & Thread Safety

- Document thread-safety guarantees on every shared class (`@ThreadSafe`, `@NotThreadSafe`, `@Immutable`)
- Prefer stateless services — Spring singletons must not hold mutable instance state
- Use `@Async` with a configured `TaskExecutor` — never the default SimpleAsyncTaskExecutor in production
- CompletableFuture: always handle exceptions with `.exceptionally()` or `.handle()`
- Avoid `synchronized` blocks in service layer — use database-level locking or distributed locks
- `@Transactional` isolation levels: document why anything other than DEFAULT is chosen

## API Versioning & Backward Compatibility

- Additive changes only — never remove or rename fields in existing response DTOs
- New required request fields must have a migration path (default value or new endpoint version)
- Deprecate before removing: `@Deprecated` annotation + Javadoc with removal timeline
- Version in URL path (`/api/v1/`, `/api/v2/`) — not headers
- Breaking changes require a new version; old version supported for minimum 2 release cycles
- Use `@JsonIgnoreProperties(ignoreUnknown = true)` on all deserialization DTOs for forward compatibility

## Service Layer Contracts

- One service per aggregate root — avoid cross-aggregate mutations in a single service
- Service methods represent use cases, not CRUD wrappers
- Keep services stateless — inject dependencies, don't hold request-scoped state
- Inter-service communication: prefer events/messages over synchronous calls for non-critical paths
- Document side effects: if a method sends email, publishes events, or calls external APIs — Javadoc it
- Return domain objects from services, map to DTOs in resource classes

## Configuration Management

- Group related config in `@ConfigurationProperties` classes with `@Validated`
- Use `@ConstructorBinding` (Boot 2.x) or record-based config (Boot 3.x) for immutable config
- Separate config by concern: `app.http.*`, `app.cache.*`, `app.feature.*`
- Feature flags: use a dedicated `FeatureProperties` class, never scattered `@Value` booleans
- Secrets: never in application.yml — use environment variables, AWS Secrets Manager, or Spring Cloud Config
- Document every property with comments in the properties class — these are your config docs

## Resilience & Fault Tolerance

- External calls (HTTP, DB, messaging) must have timeouts — never unbounded waits
- Use circuit breakers (Resilience4j) for downstream service calls
- Implement retry with exponential backoff for transient failures — document max retries
- Bulkhead pattern: isolate thread pools for different downstream dependencies
- Graceful degradation: define fallback behavior when dependencies are unavailable
- Health checks: `/actuator/health` must reflect actual dependency connectivity
- Connection pools: size explicitly, monitor exhaustion, set validation queries

## Code Organization & Modularity

- Package by feature for large services, by layer for small ones — be consistent within a project
- No circular package dependencies
- Keep resource classes thin: validate → delegate to service → map response (max 10–15 lines per method)
- Extract complex business rules into dedicated strategy/policy classes
- Utility classes: static methods only, private constructor, `final` class
- Avoid deep inheritance hierarchies (max 2 levels) — prefer composition and interfaces
- Inner classes only for tightly-coupled helpers — otherwise extract to own file

## Database Discipline

- Index strategy: index foreign keys, frequently filtered columns, and composite keys for common queries
- Avoid `SELECT *` — always specify columns to prevent breakage on schema changes
- Use database constraints (NOT NULL, UNIQUE, CHECK) as the last line of defense — don't rely solely on app validation

## Observability & Monitoring

- Trace IDs: propagate via MDC for all log entries within a request
- Custom metrics: use Micrometer counters/timers for business-critical operations
- Log at method boundaries for service-layer operations: entry (DEBUG), exit (DEBUG), failure (ERROR)
- Structured log fields: `traceId`, `userId`, `operation`, `duration`, `status`
- Alert-worthy events: log at WARN/ERROR with enough context to diagnose without code access
- Never log full request/response payloads — log identifiers and metadata only
- Health endpoint must distinguish between liveness (app running) and readiness (dependencies available)

## Code Review Checklist

Before approving any code, verify:

- [ ] No business logic in resource classes
- [ ] All public methods have Javadoc (services and above)
- [ ] No raw types — generics fully specified
- [ ] No magic numbers/strings — extract to named constants or config
- [ ] Resources (streams, connections) closed in finally/try-with-resources
- [ ] Equals/hashCode consistent — both overridden or neither
- [ ] toString() does not include sensitive fields
- [ ] No System.out/System.err — use logger
- [ ] No Thread.sleep in production code
- [ ] Collections sized appropriately (initial capacity for known sizes)
- [ ] Optional used for return types only — never as method parameters or fields
- [ ] Builder pattern for objects with >4 constructor parameters

## Legacy Code Ratchet Policy

- New code: fully compliant with all conventions
- Modified code: bring touched methods/classes up to standard where safe (no behavioral change)
- Existing untouched code: tolerated — flag in reviews but don't block PRs
- Never mix refactoring and feature work in the same commit
- When upgrading Spring Boot versions, create dedicated migration PRs — no feature changes mixed in

## DTO Mapping Strategy

- Use MapStruct for compile-time type-safe mapping (preferred)
- One mapper interface per aggregate: `UserMapper`, `OrderMapper`
- Never map inside entity constructors or service methods — dedicated mapper layer
- Null-safe mappings: configure MapStruct with `nullValueMappingStrategy = RETURN_DEFAULT`
- Nested DTOs: map explicitly — no deep auto-mapping that hides N+1 risks
- If MapStruct is not available (legacy), use manual static factory methods on the DTO: `UserDto.from(User entity)`

## Event & Messaging Conventions

- Event classes are immutable value objects — records (17+) or final classes with final fields
- Event naming: past tense verb + noun — `OrderPlacedEvent`, `PaymentFailedEvent`
- Include: `eventId` (UUID), `timestamp`, `aggregateId`, `payload`
- Publish events after transaction commits — use `@TransactionalEventListener(phase = AFTER_COMMIT)`
- Consumer idempotency: always check for duplicate `eventId` before processing
- Dead letter queue: configure for all async consumers — never silently drop failed messages

## Caching Strategy

### General Principles

- Cache read-heavy, rarely-changing data only — never cache user-specific mutable state
- Use `@Cacheable` with explicit cache names — never rely on default cache
- Always define `@CacheEvict` for any mutation that invalidates cached data
- TTL: set explicit expiration — never cache indefinitely
- Cache keys: use business identifiers, not internal IDs that may change
- Document cache boundaries: what's cached, TTL, eviction trigger
- Never cache `null` values unless explicitly handled with a sentinel
- Cache at the service layer — never at the resource or repository layer

### Cache Provider Selection

| Scenario | Provider | Why |
|----------|----------|-----|
| Single-instance service, low-latency local cache | Caffeine | Fastest in-process cache, zero network overhead |
| Single-instance, complex eviction policies or persistence | Ehcache | Tiered storage (heap → off-heap → disk), rich eviction |
| Multi-instance / distributed / shared state | Redis | Shared cache across nodes, pub/sub for invalidation |
| Hybrid (local + distributed) | Caffeine L1 + Redis L2 | Local speed with distributed consistency |

### Caffeine Conventions

- Use as the default cache provider for single-instance services
- Configure via `spring.cache.caffeine.spec` or programmatic `CacheManager` bean
- Always set `maximumSize` — unbounded caches are memory leaks
- Always set `expireAfterWrite` or `expireAfterAccess` — never indefinite
- Use `recordStats()` in non-production for hit/miss ratio monitoring
- Prefer `expireAfterWrite` over `expireAfterAccess` — predictable eviction, avoids stale data

```yaml
spring:
  cache:
    type: caffeine
    caffeine:
      spec: maximumSize=10000,expireAfterWrite=300s
    cache-names: clients,configurations,lookups
```

- For per-cache configuration, define a custom `CacheManager` bean:

```java
@Bean
public CacheManager cacheManager() {
    CaffeineCacheManager manager = new CaffeineCacheManager();
    manager.setCaffeine(Caffeine.newBuilder()
        .maximumSize(10_000)
        .expireAfterWrite(Duration.ofMinutes(5))
        .recordStats());
    return manager;
}
```

### Ehcache Conventions

- Use when tiered caching is needed (heap → off-heap → disk) or when cache persistence across restarts is required
- Configure via `ehcache.xml` — reference in `spring.cache.jcache.config`
- Define explicit heap and off-heap tiers — never rely on defaults
- Set `timeToLiveSeconds` and `timeToIdleSeconds` per cache
- Use `CacheEventListener` for monitoring evictions and expirations
- Prefer Ehcache 3.x (JSR-107 / JCache compliant) over legacy 2.x

```xml
<cache alias="configurations">
    <expiry>
        <ttl unit="minutes">10</ttl>
    </expiry>
    <heap unit="entries">5000</heap>
    <offheap unit="MB">50</offheap>
</cache>
```

- For Spring Boot integration:

```yaml
spring:
  cache:
    type: jcache
    jcache:
      config: classpath:ehcache.xml
```

### Redis Conventions

- Use when cache must be shared across multiple service instances
- Use Spring Data Redis with `RedisCacheManager` — never raw Jedis/Lettuce commands for caching
- Always set TTL per cache — Redis does not evict by default without `maxmemory-policy`
- Prefix all cache keys with service name: `{service}:{cache}:{key}` — avoid collisions in shared clusters
- Use JSON serialization (`GenericJackson2JsonRedisSerializer`) — not Java serialization (version-fragile, security risk)
- Handle `RedisConnectionException` gracefully — cache miss should fall through to source, never throw to client
- Never store sensitive data (PII, tokens) in Redis without encryption

```java
@Bean
public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
    RedisCacheConfiguration defaults = RedisCacheConfiguration.defaultCacheConfig()
        .entryTtl(Duration.ofMinutes(10))
        .prefixCacheNameWith("ticketing:")
        .serializeValuesWith(SerializationPair.fromSerializer(
            new GenericJackson2JsonRedisSerializer()));

    return RedisCacheManager.builder(factory)
        .cacheDefaults(defaults)
        .withCacheConfiguration("sessions", defaults.entryTtl(Duration.ofMinutes(30)))
        .withCacheConfiguration("lookups", defaults.entryTtl(Duration.ofHours(1)))
        .build();
}
```

- Connection pool sizing: match expected concurrent cache operations, monitor pool exhaustion
- Use Redis Sentinel or Cluster for production — never single-node without failover
- Set `spring.redis.timeout` explicitly — default is infinite (dangerous)

### Cache Invalidation Patterns

| Pattern | When to use |
|---------|-------------|
| TTL-based expiry | Data that's acceptable slightly stale (config, lookups) |
| Event-driven eviction | Data modified by this service — `@CacheEvict` on mutation |
| Pub/Sub invalidation | Multi-instance with Redis — publish eviction events |
| Version-based keys | Append version to key — old entries expire naturally |

- Prefer TTL + event-driven eviction as the default combination
- Never rely solely on TTL for data that has strong consistency requirements
- For distributed invalidation: use Redis pub/sub or Spring Cloud Bus to notify other instances

### Cache Monitoring

- Expose cache metrics via Micrometer: hit ratio, eviction count, size
- Alert when hit ratio drops below 70% — indicates misconfigured TTL or cache size
- Log cache misses at DEBUG level with the key — helps diagnose cold-start issues
- Monitor Redis memory usage — set `maxmemory` with `allkeys-lru` policy in production

## API Documentation (OpenAPI)

- Every public endpoint must have OpenAPI annotations
- `@Operation(summary = "...")` on every resource method
- `@ApiResponse` for all possible HTTP status codes (200, 400, 404, 500 at minimum)
- `@Schema` on DTO fields with `description`, `example`, and constraints
- Generate OpenAPI spec as build artifact — `mvn verify` produces `openapi.json`
- Spec is the contract — if it's not in the spec, clients can't rely on it

## Test Slicing (Performance)

Use the narrowest test scope that covers the behavior:

- Default to plain unit tests (JUnit + Mockito) — fastest, no Spring context
- `@SpringBootTest` is expensive — use only for smoke tests or cross-layer integration flows
- Never use `@SpringBootTest` to test a single service method — mock dependencies instead
- Integration tests must be idempotent — use `@Transactional` rollback or test containers

## Method Size & Complexity Limits

- Methods: max 20 lines of logic (excluding blank lines and braces)
- Cyclomatic complexity: max 10 per method — extract branches into named private methods
- Parameters: max 4 — beyond that, introduce a parameter object or builder
- If a method needs a comment explaining "what" it does, it should be a named method instead
- One level of abstraction per method — don't mix high-level orchestration with low-level details

## Feign Client Conventions

### Declaration

- One Feign interface per downstream service — named `{Service}Client` (e.g., `PaymentClient`, `InventoryClient`)
- Use `@FeignClient(name = "service-name", url = "${app.clients.service-name.url}")` — never hardcode URLs
- Group Feign interfaces in a dedicated `client/` package
- Annotate with JAX-RS annotations (`@GET`, `@POST`, `@Path`) or Feign's own annotations

### Configuration

- Define per-client configuration classes: timeouts, interceptors, error decoders
- Connect timeout: 2–5 seconds max — fail fast on unreachable services
- Read timeout: match the downstream SLA — never unbounded
- Use `@ConfigurationProperties` for timeout values — never hardcode in `application.yml` inline

```text
app:
  clients:
    payment-service:
      url: ${PAYMENT_SERVICE_URL}
      connect-timeout: 3000
      read-timeout: 10000
```

### Error Handling

- Implement a custom `ErrorDecoder` per client — never rely on default (throws generic `FeignException`)
- Map HTTP status codes to domain exceptions:
  - 4xx → `ClientRequestException` (caller's fault, don't retry)
  - 5xx → `DownstreamServiceException` (retry-eligible)
  - 404 → `EntityNotFoundException` or return `Optional.empty()` depending on context
- Never catch `FeignException` in service layer — let the error decoder translate it
- Log the downstream response status + correlation ID at WARN level on failures

### Resilience

- Wrap Feign calls with Resilience4j circuit breaker — never call downstream without protection
- Define fallback behavior: return cached data, empty result, or throw a clear "service unavailable" exception
- Retry only on 5xx and connection timeouts — never retry 4xx (client errors)
- Configure retry with exponential backoff: max 3 attempts, 500ms initial delay

### Request/Response

- Use dedicated DTOs for Feign request/response — never share DTOs with your own API layer
- Name them `{Service}{Operation}Request` / `{Service}{Operation}Response` (e.g., `PaymentChargeRequest`)
- Apply `@JsonIgnoreProperties(ignoreUnknown = true)` on all response DTOs — downstream may add fields
- Never pass your internal entities to a Feign client

### Interceptors

- Use `RequestInterceptor` for cross-cutting concerns: auth tokens, correlation IDs, tracing headers
- Propagate `X-Correlation-Id` / `X-Request-Id` to all downstream calls
- For OAuth2: use a token-refreshing interceptor — never manually manage tokens in service code

### Testing

- Unit test: mock the Feign interface with Mockito — test your service logic, not HTTP
- Integration test: use WireMock to simulate downstream responses (happy path + errors + timeouts)
- Always test the error decoder with realistic error payloads
- Test circuit breaker behavior: verify fallback triggers after threshold failures

## Apache CXF REST (JAX-RS) Conventions

### When to Use

- JAX-RS-based REST services (enterprise standard)
- Projects already using CXF for REST endpoints or clients
- When JAX-RS annotations (`@Path`, `@GET`, `@POST`) are the team standard
- Interop with systems that publish JAX-RS contracts

### Project Setup

- Use `cxf-spring-boot-starter-jaxrs` for Spring Boot integration
- Define JAX-RS resources as Spring beans — CXF auto-discovers them
- Configure Jackson as the JSON provider: `JacksonJsonProvider` or `JacksonJaxbJsonProvider`
- Register providers (exception mappers, filters, interceptors) in a `@Configuration` class

```xml
<dependency>
    <groupId>org.apache.cxf</groupId>
    <artifactId>cxf-spring-boot-starter-jaxrs</artifactId>
</dependency>
<dependency>
    <groupId>com.fasterxml.jackson.jaxrs</groupId>
    <artifactId>jackson-jaxrs-json-provider</artifactId>
</dependency>
```

### Server-Side (Exposing REST APIs)

- Annotate resource classes with `@Path` — one resource class per aggregate/entity
- Use `@Produces(MediaType.APPLICATION_JSON)` and `@Consumes(MediaType.APPLICATION_JSON)` at class level
- Keep resource classes thin — delegate to service layer
- Return `Response` objects for fine-grained control, or domain DTOs for simplicity
- Use `@BeanParam` for complex query parameter groups — avoid methods with >4 parameters
- Register a global `ExceptionMapper<Throwable>` — never leak stack traces

```text
src/main/java/com/disney/{service}/
├── resource/            # JAX-RS resource classes (@Path)
├── provider/            # ExceptionMappers, filters, interceptors
├── dto/                 # Request/Response DTOs
├── service/             # Business logic
└── config/
    └── CxfConfig.java   # Bus, providers, resource registration
```

### Client-Side (Consuming REST APIs)

- Use CXF `JAXRSClientFactory` or `WebClient` for programmatic REST clients
- Prefer proxy-based clients (interface + `JAXRSClientFactory.create()`) for type safety
- Configure timeouts on the underlying HTTP conduit — never unbounded:
  - Connection timeout: 3–5 seconds
  - Receive timeout: match downstream SLA
- Wrap CXF client proxies in an adapter class — isolate CXF types from your domain

### Configuration

```yaml
cxf:
  path: /api
  jaxrs:
    server:
      address: /v1
    client:
      headers:
        accept: application/json
```

- Configure the CXF servlet path via `cxf.path` — keep it consistent with your API versioning
- Use `@ConfigurationProperties` for client URLs and timeouts — never hardcode
- Register `LoggingFeature` for request/response logging in non-production only

### Error Handling

- Implement `ExceptionMapper<T>` for each domain exception type
- Return RFC 7807 problem-detail JSON from exception mappers
- Map CXF client exceptions (`ProcessingException`, `WebApplicationException`) to domain exceptions in the adapter
- Never let JAX-RS/CXF exceptions propagate into your service layer

### Interceptors & Filters

- Use `@Provider`-annotated `ContainerRequestFilter` for cross-cutting concerns (auth, correlation IDs)
- Use `ClientRequestFilter` on CXF clients to propagate tracing headers
- Register interceptors via the CXF bus or in `@Configuration` — never in resource classes

### Testing

- Unit test resource classes with mocked services — verify delegation and response mapping
- Integration test with CXF `LocalTransportFactory` or embedded server for full request/response validation
- Test exception mappers independently — verify correct HTTP status and problem-detail body
- For CXF clients: use WireMock to simulate downstream responses

## HTTP Client Selection Guide

| Scenario | Use | Why |
|----------|-----|-----|
| REST service-to-service (Spring Cloud) | Feign | Declarative, integrates with service discovery, Resilience4j |
| REST external API (no service discovery) | Feign or WebClient | Feign for sync, WebClient for reactive/async |
| JAX-RS REST endpoints (server) | Apache CXF JAX-RS | Standard JAX-RS annotations, enterprise interop |
| JAX-RS REST client (type-safe proxy) | CXF `JAXRSClientFactory` | Interface-based, mirrors server contract |
| Simple one-off HTTP call | RestTemplate (legacy) or RestClient (Boot 3.2+) | Minimal setup, no interface needed |
| Streaming/SSE | WebClient | Non-blocking, backpressure support |

- Never mix HTTP client libraries for the same concern — pick one per category and standardize
- All HTTP clients must have explicit timeouts configured — no defaults
- All HTTP clients must propagate correlation IDs via interceptors
