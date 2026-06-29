---
inclusion: fileMatch
fileMatchPattern: ["**/*Service.java", "**/*ServiceImpl.java", "**/*UseCaseHandler.java", "**/*Handler.java", "**/*Facade.java", "**/*Controller.java", "**/*Resource.java", "**/*Adapter.java", "**/*Gateway.java", "**/*Client.java", "**/*Processor.java", "**/*Batch*.java", "**/*Job.java", "**/*Task.java", "**/*Scheduler.java", "**/*Image*.java", "**/*File*.java", "**/application*.properties", "**/application*.yml"]
description: >
---

# Performance, Memory & DoS Prevention

> **Related Rules**:
> - Resource cleanup (try-with-resources) → `dlp/exception-handling.mdc`
> - Thread safety & mutable shared state → `java/clean-code.mdc`
> - Connection pooling & N+1 queries → `spring/database-configuration.mdc`
> - Input validation (`@Size`, `@Valid`) → `spring/rest-api.mdc`

---

## Memory Management

### General Rules

- **No object creation inside loops** — reuse objects, use `StringBuilder` for string building
- **No blocking calls on main thread** — use `@Async` or `CompletableFuture` for I/O-bound work
- **Appropriate data structures** — choose by access pattern:

| Need | Use | Avoid |
|------|-----|-------|
| Fast lookup by key | `HashMap` | Iterating a `List` |
| Ordered by key | `TreeMap` | Sorting after insert |
| Insertion order | `LinkedHashMap` | Custom ordering logic |
| Thread-safe map | `ConcurrentHashMap` | `Collections.synchronizedMap()` |
| Unique elements | `Set` | Manual dedup on `List` |

### Resource Leaks (Beyond try-with-resources)

- [ ] No memory leaks from **static collections** — use bounded caches with TTL, not `static Map` that grows forever
- [ ] No memory leaks from **event listeners** — unregister when no longer needed
- [ ] **Thread pools** sized with bounded queue + rejection policy (not unbounded `LinkedBlockingQueue`)
- [ ] **HTTP connections** closed after use (especially in non-Foundation REST clients)

### Image & Binary Processing

> These checks apply when code processes images, PDFs, or large binary data.

- [ ] `BufferedImage.flush()` called after use to release native memory
- [ ] Intermediate images flushed (not just final result)
- [ ] Original image flushed after transformation
- [ ] Image **dimensions validated before processing** (prevent decompression bombs / OOM attacks)
- [ ] Maximum pixel count enforced (e.g., 16MP = 16,000,000 pixels limit)
- [ ] Large byte arrays nulled after use to assist GC

```java
// ✅ Validate image dimensions before processing
private static final int MAX_PIXELS = 16_000_000; // 16MP

public BufferedImage safeResize(MultipartFile file) {
    BufferedImage original = ImageIO.read(file.getInputStream());
    try {
        int pixels = original.getWidth() * original.getHeight();
        if (pixels > MAX_PIXELS) {
            throw new ValidationException("image", "Image too large: " + pixels + " pixels");
        }
        BufferedImage resized = resize(original);
        return resized;
    } finally {
        original.flush(); // Release native memory
    }
}
```

### Memory Impact Assessment

When reporting memory issues, estimate:
- **Memory waste per request** (e.g., "30-80MB/request" for unflushed BufferedImage)
- **Risk under load** (e.g., "OOM after ~100 concurrent requests")

**Severity for memory/performance findings:**
- **HIGH**: Actual leak (resource not closed, static collection growing unbounded), or clear OOM risk (e.g. unflushed BufferedImage, unbounded upload size).
- **MEDIUM**: Unnecessary allocations, extra GC pressure, or copy-on-each-call when there is no leak and no OOM (e.g. map copy on every retry). Recommend optimization but do not block as HIGH.

---

## Algorithm & Data Structure Optimization

### Loop Optimization

- [ ] **Avoid nested loops** where possible — use `Map` for O(1) lookups instead of O(n) inner loops
- [ ] **Early exit** from loops when result found (`break`, `return`, `findFirst()`)
- [ ] **Cache repeated method calls** inside loops — don't call `list.size()` or `service.getConfig()` on every iteration
- [ ] **Avoid repeated collection copying** — `List.copyOf()` inside a loop creates a new list each time

```java
// ❌ O(n²) — nested loop for lookup
for (Order order : orders) {
    for (Customer customer : customers) {
        if (customer.getId().equals(order.getCustomerId())) { ... }
    }
}

// ✅ O(n) — Map lookup
Map<Long, Customer> customerMap = customers.stream()
    .collect(Collectors.toMap(Customer::getId, Function.identity()));
for (Order order : orders) {
    Customer customer = customerMap.get(order.getCustomerId());
}
```

### String Operations

- [ ] Use `StringBuilder` for building strings in loops (not `+` concatenation)
- [ ] Use `String.join()` or `Collectors.joining()` for joining collections
- [ ] Pre-compile regex patterns as `static final Pattern` (not `String.matches()` in loops)

---

## Parallelism & Async Processing

| Scenario | Recommended Approach |
|----------|---------------------|
| CPU-intensive on large collections | `parallelStream()` |
| Multiple independent API calls | `CompletableFuture.allOf()` |
| I/O-bound concurrent tasks (Java 21+) | Virtual threads |
| Bulk database operations | JDBC batch (`batch_size=25`) |
| Background work | `@Async("defaultTaskExecutor")` |

### Guidelines

- [ ] Independent operations run **in parallel** where beneficial (not sequentially)
- [ ] `CompletableFuture` chains have **timeout** (`orTimeout()` or `completeOnTimeout()`)
- [ ] Async tasks use **Foundation's executor** (`defaultTaskExecutor`) for MDC propagation
- [ ] **Batch processing** for bulk DB operations (enable `hibernate.jdbc.batch_size`, `order_inserts`, `order_updates`)
- [ ] Virtual threads (Java 21+) for I/O-bound parallel tasks — don't pin them with `synchronized`

### Detecting Sequential-to-Parallel Opportunities (Missed Parallelism)

> **Proactively scan** service/use-case methods for sequential operations that have **no data dependency** between them. Sequential execution of independent I/O-bound calls is a common latency problem — the total latency is the **sum** of all calls instead of the **max**.

#### Code Patterns That Signal Missed Parallelism

Scan for methods containing **two or more** of the following back-to-back statements where **result A is not used as input to call B**:

| Sequential Pattern (Anti-Pattern) | Why It's a Problem | Parallel Alternative |
|---|---|---|
| Two+ gateway/adapter calls in sequence (`gateway1.fetch(id); gateway2.fetch(id);`) | Total latency = sum of all calls; each blocks the thread waiting for I/O | `CompletableFuture.allOf()` with `defaultTaskExecutor` — latency = max(calls) |
| Sequential REST/SOAP client calls to **different** endpoints or services | Same as above — thread sits idle during network I/O on each call | `CompletableFuture.supplyAsync()` per call + `allOf().orTimeout()` |
| Loop calling an external service **one item at a time** (`for (id : ids) { client.get(id); }`) | N sequential network round-trips; latency = N × single-call time | Batch API if available, else `CompletableFuture` fan-out with bounded parallelism |
| Sequential independent DB queries (`repo1.findByX(); repo2.findByY();` — no FK/join dependency) | Blocks on each query; both could run concurrently | `CompletableFuture.allOf()` (beware: each needs its own connection from pool) |
| Aggregation method that calls multiple services to compose a response | API latency = sum of all downstream calls, degraded UX | Parallel fan-out + compose: `thenCombine()` or `allOf()` |
| Sequential `@Async` calls where the caller `.join()`s each one before starting the next | Defeats async — equivalent to synchronous | Start all futures first, then `allOf().join()` once |

#### How to Confirm the Opportunity Is Real

Before flagging, verify:
1. **No data dependency** — call B does NOT use the return value of call A as input
2. **No ordering requirement** — business logic does not require A to complete before B (e.g., no compensating transaction)
3. **Thread pool headroom** — the service's `defaultTaskExecutor` or connection pool can absorb additional concurrent work (check `app.async.default.thread-pool.max-size` and HikariCP `maximum-pool-size`)
4. **I/O-bound** — the calls are network/DB/file I/O (CPU-bound work parallelizes differently via `parallelStream`)

#### Severity Classification

| Situation | Severity | Rationale |
|-----------|----------|-----------|
| 3+ independent external calls in sequence (gateway/REST/SOAP) in a user-facing API path | 🟠 **HIGH** | Directly degrades response time by sum of latencies; users experience cumulative delay |
| 2 independent external calls in sequence on a user-facing path | 🟡 **MEDIUM** | Meaningful latency saving but smaller impact |
| Sequential independent calls in a batch/background job (not user-facing) | 🟡 **MEDIUM** | Affects throughput, not user latency — still worth parallelizing for job duration |
| Sequential independent DB queries within the same transaction | 🟢 **LOW** | Parallelizing DB queries within a transaction is complex (connection-per-thread); flag as opportunity, not defect |
| Loop calling external service one-by-one (N items, N > 5) | 🟠 **HIGH** | Linear latency growth; potential thread-pool starvation under load |

#### Review Checklist — Parallelism Opportunities

- [ ] **Service aggregators**: Methods that call 2+ gateways/adapters/clients — are any calls independent?
- [ ] **Orchestration use cases**: Use-case handlers composing data from multiple sources — can fan-out reduce latency?
- [ ] **Batch item processing**: Loop processing items one-by-one against an external service — can batch or fan-out?
- [ ] **Controller composition**: Endpoint that gathers data from multiple services before responding — sequential or parallel?
- [ ] **Event-driven alternatives**: Are there fire-and-forget side effects (notifications, audit logs) that can be `@Async` instead of blocking the response?

---

## Lazy Loading & Efficient Data Access

- [ ] **Lazy initialization** for expensive objects — use `Supplier<T>` or Spring `@Lazy`
- [ ] **Load only needed data** — projections or DTOs instead of full entities
- [ ] **Streaming for large result sets** — `Stream<T>` instead of `List<T>` to avoid loading everything in memory
- [ ] No `FetchType.EAGER` on `@OneToMany` / `@ManyToMany` — use `LAZY` + explicit fetch (`JOIN FETCH`, `@EntityGraph`) when needed

```java
// ❌ Loads entire object graph eagerly
@OneToMany(fetch = FetchType.EAGER)
private List<OrderItem> items;

// ✅ Lazy loading + explicit fetch when needed
@OneToMany(fetch = FetchType.LAZY)
private List<OrderItem> items;

// In repository: fetch only when needed
@Query("SELECT o FROM Order o JOIN FETCH o.items WHERE o.id = :id")
Optional<Order> findByIdWithItems(@Param("id") Long id);
```

---

## DoS Prevention Configuration

> **Check both Java files AND `application.properties`/`application.yml`.**
> Missing limits = DoS vulnerability.

### In Java Files

- [ ] `@Size` constraints on large input fields (base64, text areas, collections)
- [ ] Image/file **dimension validation** before processing (prevent decompression bombs)
- [ ] Maximum pixel count validation for images

### In Configuration Files

- [ ] `spring.servlet.multipart.max-file-size` configured (set explicit limit)
- [ ] `spring.servlet.multipart.max-request-size` configured
- [ ] `spring.mvc.async.request-timeout` configured
- [ ] Rate limiting for public/sensitive endpoints (Foundation `RateLimitFilter` for global, `PerIdentityRateLimitFilter` for per-caller fairness)

```properties
# ✅ DoS prevention — always set explicit limits
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=25MB
spring.mvc.async.request-timeout=30000
```

> **Note**: Do NOT flag `server.tomcat.*` properties — DLP services use an external Tomcat from the base image, not embedded Tomcat.

---

## Caching Best Practices

- [ ] Cache **read-heavy, stable data** — don't cache data that changes frequently
- [ ] Set **TTL** on all caches — no unbounded caches that grow forever
- [ ] Use **`@Cacheable`** with explicit cache name and key
- [ ] **Evict on write** — use `@CacheEvict` or `@CachePut` on mutation methods
- [ ] **Appropriate cache type** — EhCache for local, Redis for distributed

| Data Characteristics | Cache Type | TTL Guideline |
|---------------------|------------|---------------|
| Reference data (countries, config) | EhCache (local) | 1-24h |
| Frequently read, shared across instances | Redis (distributed) | 5-60min |
| User session data | Redis | Session TTL |
| Expensive computation results | Either | Depends on freshness needs |

> Skills: `dlp-add-redis-cache`, `dlp-add-ehcache`

---

## Database Performance Additions

> N+1 queries, connection pools, OSIV → covered by `spring/database-configuration.mdc`

- [ ] **Database migration tool** present if service owns schema (Flyway or Liquibase — mark N/A if managed externally)
- [ ] **Pagination** for list endpoints — never return unbounded result sets
- [ ] **Indexed columns** used in WHERE clauses and JOIN conditions
- [ ] **Prepared statement caching** enabled for repeated queries

---

## Performance Anti-Patterns

| Anti-Pattern | What to look for | Risk |
|---|---|---|
| Unclosed streams / readers | `new FileInputStream` without try-with-resources | File descriptor and native memory leaks |
| `BufferedImage` without `flush()` / dispose | Image pipelines holding raster data | Native memory growth (OOM) |
| Unbounded caches | Cache without TTL or max entries | Heap exhaustion |
| `FetchType.EAGER` on large collections | `@OneToMany(fetch = EAGER)` | Loads huge graphs; memory and N+1 |
| Missing multipart limits | No `max-file-size` / `max-request-size` | DoS via uploads |
| Synchronous blocking on slow I/O | No timeouts on HTTP calls to externals | Thread pool starvation |
| Creating heavy objects in tight loops | `new` parser, matcher, formatter per iteration | GC pressure, latency spikes |
| No image dimension check before decode | User upload decoded without width/height limits | OOM / CPU DoS |
| **Sequential independent I/O calls** | 2+ gateway/REST/SOAP calls in same method with no data dependency between them | **Cumulative latency (sum vs max); degraded response time** |
| **Loop calling external service one-by-one** | `for (item : items) { client.call(item); }` without batch API or fan-out | **N × round-trip latency; thread-pool starvation under load** |

---

## Performance Checklist

| Area | Critical Checks |
|------|----------------|
| **Memory** | No object creation in loops, BufferedImage flushed, static collections bounded, thread pools bounded |
| **Algorithm** | No nested loops for lookups (use Map), early exit, cached loop variables |
| **Async / Parallelism** | Parallel independent operations, CompletableFuture with timeout, Foundation executor for MDC, **no sequential independent I/O calls where fan-out is possible**, no one-by-one loops to external services |
| **Data Access** | Lazy fetch default, projections for reads, streaming for large sets, no EAGER on collections |
| **DoS** | Multipart limits set, async timeout set, image dimensions validated, rate limiting configured |
| **Caching** | TTL on all caches, evict on write, appropriate cache type |
| **Database** | Migrations present, pagination for lists, indexed query columns |
