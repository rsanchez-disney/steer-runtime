# Performance Engineering Guide
> A framework and language-agnostic reference for building concurrent, scalable, high-performance, and observable services.

---

## How to Use This Guide

Each section follows the same structure:

- **The Problem** — what goes wrong without this pattern
- **The Pattern** — what to do instead
- **The Rule** — the enforceable standard
- **Anti-pattern** — the concrete thing to avoid
- **Signals it's needed** — how to recognize when to apply it

This guide is intentionally free of framework-specific APIs. Adapt the pseudocode to your language and stack.

---

## Table of Contents

1. [Concurrency](#1-concurrency)
2. [Asynchronous Behavior](#2-asynchronous-behavior)
3. [Scale](#3-scale)
4. [High-Performance Coding](#4-high-performance-coding)
5. [Observability](#5-observability)
6. [SQL Syntax & Query Quality](#6-sql-syntax--query-quality)

---

## 1. Concurrency

### 1.1 Parallelize Independent I/O

**The Problem:** When multiple data fetches are needed to serve a request, running them sequentially multiplies latency. If each fetch takes 100ms and you have 7, sequential execution costs 700ms. Parallel execution costs ~100ms (the slowest one).

**The Pattern:** Identify all fetches that have no data dependency on each other. Launch them all at once and wait for all to complete before proceeding.

```
// Pseudocode
futureA = async_fetch(sourceA)
futureB = async_fetch(sourceB)
futureC = async_fetch(sourceC)

wait_all(futureA, futureB, futureC)

resultA = futureA.result()
resultB = futureB.result()
resultC = futureC.result()
```

**The Rule:** Any group of I/O operations (database, cache, external API) that are all needed together and have no dependency on each other MUST be launched in parallel.

**Anti-pattern:**
```
// Sequential — each line waits for the previous
resultA = fetch(sourceA)   // 100ms
resultB = fetch(sourceB)   // 100ms
resultC = fetch(sourceC)   // 100ms
// total: 300ms instead of 100ms
```

**Signals it's needed:** You see multiple sequential repository/service calls at the top of a method where none of the calls uses the result of a previous one.

---

### 1.2 Parallelize Independent Items in a Collection

**The Problem:** Processing a list of independent items sequentially means the total time scales linearly with the list size. Processing 10 items takes 10x longer than processing 1.

**The Pattern:** When each item's processing is independent (no shared mutable state, no item depends on another's result), process the collection in parallel.

```
// Pseudocode
results = items.parallel_map(item -> process(item))
```

**The Rule:** Collections of independent work units MUST be processed in parallel. The processing function must be stateless and free of side effects on shared state.

**Anti-pattern:**
```
results = []
for item in items:           // sequential
    results.append(process(item))
```

**Signals it's needed:** A `for` loop or sequential `map` over a list where each iteration is a self-contained unit of work (e.g., pricing a product, validating a record, enriching an entity).

---

### 1.3 Keep Sequential When There Is a Data Dependency

**The Problem:** Blindly parallelizing everything causes race conditions when step N+1 depends on the output of step N.

**The Pattern:** When processing order matters — for example, children must be processed before parents in a hierarchy — keep the loop sequential and document the dependency explicitly.

```
// Pseudocode — depth-first, children before parents
for depth in hierarchy.depths_deepest_first():
    for node in hierarchy.nodes_at(depth):
        child_results = collect_child_results(node, completed_results)
        completed_results[node] = process(node, child_results)
```

**The Rule:** Sequential processing is correct and intentional when there is a data dependency between iterations. Always add a comment explaining why parallelism would be wrong here.

**Signals it's needed:** A tree or DAG where parent nodes aggregate results from child nodes (bundle pricing, hierarchical validation, dependency graphs).

---

### 1.4 Async Writes, Sync Reads for Caches

**The Problem:** Cache writes are not on the critical path — the caller doesn't need to wait for the cache to be populated. Blocking on a cache write adds latency with no benefit to the current request.

**The Pattern:** Cache reads are synchronous (a cache miss changes behavior). Cache writes are fire-and-forget.

```
// Read — synchronous, result affects behavior
value = cache.get(key)
if value is null:
    value = fetch_from_source(key)
    cache.set_async(key, value)   // non-blocking
return value
```

**The Rule:** Cache writes are always async. Cache reads are always sync. Never block the request thread waiting for a cache write to complete.

**Anti-pattern:**
```
value = compute_expensive_value()
cache.set(key, value)   // blocks — adds latency for no benefit to this request
return value
```

---

## 2. Asynchronous Behavior

### 2.1 Offload Blocking Work from Request Threads

**The Problem:** Web frameworks use a fixed pool of request-handling threads. If those threads block on I/O (DB queries, HTTP calls), the server runs out of threads under load and new requests queue up or are rejected.

**The Pattern:** Hand off all blocking work to a separate executor/thread pool immediately. The request thread returns to the pool while the work runs elsewhere.

```
// Pseudocode — REST/GraphQL handler
handler GET /resource:
    return async(worker_pool, () -> {
        data = database.query(...)    // blocking, but on worker thread
        return transform(data)
    })
```

**The Rule:** Request handlers that perform any I/O MUST offload that work to a dedicated executor. The handler method itself must return immediately with a future/promise.

**Anti-pattern:**
```
handler GET /resource:
    data = database.query(...)   // blocks the request thread
    return transform(data)
```

**Signals it's needed:** Any controller/handler method that calls a repository, makes an HTTP call, or reads from a file before returning.

---

### 2.2 Log at the Failure Site, Then Propagate

**The Problem:** Async tasks that silently swallow exceptions produce phantom failures — the request fails or returns wrong data, but there's no log entry explaining why.

**The Pattern:** In async callbacks, log the error with full context at the point where it occurs (where you have the most information), then re-throw so the failure propagates to the caller.

```
// Pseudocode
future = async(() -> fetch_data(params))
    .on_complete((result, error) -> {
        if error:
            log.error("fetch_data failed for params={}, error={}", params, error)
            // do NOT return a default value — let it propagate
    })

wait(future)   // exception surfaces here if fetch failed
```

**The Rule:** Never use `catch`/`exceptionally` to return a default value from a failed async task unless that default is explicitly correct business behavior. Log with full context, then rethrow.

**Anti-pattern:**
```
future = async(() -> fetch_data(params))
    .on_error(e -> {
        log.error("failed")
        return empty_result()    // silent failure — caller gets wrong data
    })
```

---

### 2.3 Batch Remote Writes with Pipelining

**The Problem:** Writing N items to a remote store (cache, queue, database) with N individual round-trips multiplies network latency by N.

**The Pattern:** Collect all writes for a logical operation and send them in a single batched/pipelined call.

```
// Pseudocode
writes = {key1: val1, key2: val2, key3: val3}
cache.pipeline():
    cache.multi_set(writes)
    for key in writes.keys():
        cache.expire(key, ttl)
```

**The Rule:** Multi-item writes to any remote store MUST use the store's batch/pipeline API. Single-item writes are only acceptable when there is genuinely only one item.

---

## 3. Scale

### 3.1 Batch Queries — Eliminate N+1

**The Problem:** Fetching data for N items with N individual queries is the single most common scaling bottleneck. At low load it's invisible; at high load it collapses the database.

**The Pattern:** Repository methods accept a collection of keys and return a map of key → result. One query serves all items.

```
// Interface contract
Map<ID, Result> find_batch(Collection<ID> ids, Criteria criteria)

// SQL pattern
SELECT * FROM table
WHERE id IN (:ids)
  AND effective_date <= :as_of
```

**The Rule:** Repository interfaces MUST expose batch methods that accept collections and return maps. Single-item methods are only acceptable when the set of IDs is genuinely unknown until runtime (e.g., recursive hierarchy traversal).

**Anti-pattern:**
```
for id in ids:
    result = repository.find_one(id)   // N queries
    results.append(result)
```

**Signals it's needed:** Any loop that calls a repository method inside it.

---

### 3.2 Collect All Keys Before Fetching

**The Problem:** Launching batch fetches before you know all the keys forces multiple round-trips or requires merging results from separate calls.

**The Pattern:** In a two-phase approach — first collect all keys needed across the entire operation, then issue a single batch fetch.

```
// Phase 1: collect
all_group_codes = collect_group_codes(all_items)   // pure, no I/O
all_product_codes = collect_product_codes(all_items)

// Phase 2: fetch (all at once)
discounts = discount_repo.find_batch(all_group_codes, criteria)
rates     = rate_repo.find_batch(all_product_codes, criteria)
```

**The Rule:** Key collection (phase 1) and data fetching (phase 2) must be separate steps. Never interleave collection and fetching.

---

### 3.3 Enforce Configurable Request Limits

**The Problem:** Unbounded inputs (large collections, deep hierarchies, wide date ranges) can exhaust thread pools, DB connections, and memory. A single malformed or oversized request can degrade the entire service.

**The Pattern:** Enforce a hard cap on collection sizes at the entry point. Externalize the limit so it can be tuned without a deployment.

```
// Pseudocode — at the handler/controller layer
MAX_ITEMS = config.get("service.max-items-per-request", default=10)

if request.items.size() > MAX_ITEMS:
    throw ValidationError(
        "Request contains {} items, limit is {}".format(request.items.size(), MAX_ITEMS)
    )
```

**The Rule:** Every endpoint that accepts a variable-size collection MUST enforce a configurable upper bound. Validation happens before any processing begins.

---

### 3.4 Derive a Union Range for Batch Fetches

**The Problem:** When items in a collection each have their own date range, fetching data per-item range requires N queries. Fetching with the union of all ranges requires one.

**The Pattern:** Before fetching, compute the minimum start and maximum end across all items. Use that union range for the batch query, then filter per-item in memory.

```
// Pseudocode
min_start = min(item.start for item in items)
max_end   = max(item.end   for item in items)

// One batch query covering all items
all_data = repository.find_batch(item_ids, min_start, max_end)

// Per-item filtering in memory (cheap)
for item in items:
    item.data = filter(all_data[item.id], item.start, item.end)
```

**The Rule:** Derive the union of all date/time ranges before issuing any fetch. Never issue per-item range queries when a single union-range batch query suffices.

---

### 3.5 Explicit Fallback Routing

**The Problem:** When a primary data source doesn't cover all items (e.g., a rate grid that only covers some products), items with no coverage silently get no data, causing incorrect results downstream.

**The Pattern:** After a batch fetch, explicitly check for items with no results and route them to a fallback source. Log the routing decision.

```
// Pseudocode
primary_results = primary_source.fetch_batch(items)

no_coverage = [item for item in items if primary_results[item.id] is empty]

if no_coverage:
    log.info("Falling back to secondary source for {} items", len(no_coverage))
    fallback_results = secondary_source.fetch_batch(no_coverage)
    primary_results.merge(fallback_results)
```

**The Rule:** Fallback logic must be explicit, not implicit. Log which items fell back and why. Never silently return empty results for items with no primary coverage.

---

## 4. High-Performance Coding

### 4.1 Use Hash-Based Structures for Membership Checks

**The Problem:** Checking whether a value exists in a list inside a loop or stream is O(n) per check, making the overall operation O(n²).

**The Pattern:** Convert the lookup collection to a hash set before the loop/stream. Membership checks become O(1).

```
// Pseudocode
allowed = HashSet(allowed_values)   // O(n) once

filtered = items.filter(item -> allowed.contains(item.key))   // O(1) per item
```

**The Rule:** Any `contains` check inside a loop or stream filter MUST use a hash-based structure (HashSet, HashMap, dictionary). Never call `list.contains()` inside a loop.

**Anti-pattern:**
```
// O(n²) — list.contains() is O(n), called once per item
filtered = items.filter(item -> allowed_list.contains(item.key))
```

---

### 4.2 Deduplicate with Group-By + Pick-Best

**The Problem:** Sorting an entire collection just to pick the first or last element per group is O(n log n) and requires materializing the full sorted list.

**The Pattern:** Group by the deduplication key, then pick the best element per group using a comparator. One pass, no full sort.

```
// Pseudocode — keep the record with the latest timestamp per (entity_id, date)
deduplicated = items
    .group_by(item -> (item.entity_id, item.date))
    .map_values(group -> group.max_by(item -> item.timestamp))
    .values()
```

**The Rule:** When deduplicating a collection by a composite key, use group-by + max/min. Avoid sorting the full collection to achieve deduplication.

---

### 4.3 Use Immutable Data Structures for Shared State

**The Problem:** Mutable objects passed between concurrent tasks are a source of race conditions. Defensive copying is expensive and easy to forget.

**The Pattern:** Make data objects immutable by default. Use a builder pattern with a `copy-with-change` method for modifications — this creates a new object with only the changed field, leaving the original untouched.

```
// Pseudocode
original = Input.builder()
    .field_a(value_a)
    .field_b(value_b)
    .build()

// Non-destructive update — original is unchanged
modified = original.to_builder()
    .field_b(new_value_b)
    .build()
```

**The Rule:** Objects shared across concurrent tasks MUST be immutable. Use builder + copy-with-change for modifications. Never mutate an object that may be read by another thread.

---

### 4.4 Gate Work on Capability Checks

**The Problem:** Unconditionally assembling, transforming, or fetching data that some consumers don't need wastes CPU, memory, and I/O.

**The Pattern:** Before doing work, check whether the consumer actually needs it. Skip the work entirely if not.

```
// Pseudocode
for item in items:
    if item.calculator.supports(FEATURE_X):
        item.data_x = assemble_data_x(item)   // only when needed

    if item.calculator.supports(FEATURE_Y):
        item.data_y = assemble_data_y(item)
```

**The Rule:** Any assembly, transformation, or fetch that is only needed by a subset of consumers MUST be gated on a capability/feature check. Never do unconditional work that may be wasted.

---

### 4.5 Fail Fast at the Boundary

**The Problem:** Invalid input that passes the entry point propagates deep into the processing pipeline, where it causes cryptic errors far from the source.

**The Pattern:** Validate all inputs at the outermost layer (controller, handler, API boundary) before any processing begins. Return a clear, descriptive error immediately.

```
// Pseudocode — validate before touching business logic
handler POST /process:
    errors = validate(request)
    if errors:
        throw ValidationError(errors)   // fail here, not 10 layers deep

    return business_logic.process(request)
```

**The Rule:** Input validation (format, range, existence, consistency) MUST happen at the entry point. Business logic must be able to assume its inputs are valid.

---

### 4.6 Separate Resolved State from Source Data

**The Problem:** Mutating source objects (e.g., database entities) with derived/resolved values during processing creates shared mutable state, makes the code hard to reason about, and causes bugs in parallel pipelines.

**The Pattern:** Keep source objects read-only. Store all derived, resolved, or enriched values in a separate value object that travels alongside the source.

```
// Pseudocode
// Source object — never mutated after load
product = repository.load(product_code)

// Resolved state — computed during processing, stored separately
resolved = ResolvedAttributes(
    effective_ages    = resolve_ages(product, request),
    discount_groups   = resolve_discounts(product, hierarchy),
    pricing_dates     = resolve_dates(product, criteria)
)

// Downstream code reads from resolved, not from product
process(product, resolved)
```

**The Rule:** Source/domain objects loaded from persistence MUST NOT be mutated during request processing. All derived state goes into a separate, purpose-built value object.

---

## 5. Observability

### 5.1 Time Every I/O Operation

**The Problem:** Without timing data, you cannot tell whether a slowdown is in the database, the cache, an external API, or the calculation logic. You're debugging blind.

**The Pattern:** Wrap every I/O call in a timer. Record duration, item counts (requested vs. returned), and whether it succeeded or failed. Emit warnings automatically for slow operations.

```
// Pseudocode — try-with-resources timer
with Timer("discount-batch-load") as timer:
    result = discount_repo.find_batch(codes, criteria)
    timer.record_success(items_returned=len(result), items_requested=len(codes))
    return result

// Timer implementation
on_close(duration_ms, items_returned, items_requested):
    if duration_ms >= VERY_SLOW_THRESHOLD:
        log.warn("Very slow: {} took {}ms ({}/{})", name, duration_ms, items_returned, items_requested)
    elif duration_ms >= SLOW_THRESHOLD:
        log.warn("Slow: {} took {}ms ({}/{})", name, duration_ms, items_returned, items_requested)
    else:
        log.debug("OK: {} took {}ms ({}/{})", name, duration_ms, items_returned, items_requested)
```

**The Rule:** Every I/O operation MUST be timed. Slow-operation thresholds MUST be defined and emit WARN-level logs automatically. Timers MUST record both success and failure paths.

---

### 5.2 Log Request Duration at the Entry Point

**The Problem:** Per-operation timing tells you which operation is slow, but not the total cost of a request. You need both.

**The Pattern:** Record a start timestamp at the very beginning of request handling. Log the total duration at the very end, before returning.

```
// Pseudocode
handler GET /resource:
    start = now_ms()

    result = process_request(...)

    log.info("{} completed in {}ms", operation_name, now_ms() - start)
    return result
```

**The Rule:** Every public API endpoint MUST log its total execution time at INFO level. Use wall-clock time (not CPU time). Log the operation name so logs are filterable.

---

### 5.3 Log with Full Context at Error Sites

**The Problem:** An error log that says "fetch failed" is useless in production. You need to know what was being fetched, with what parameters, and the full exception.

**The Pattern:** At every error site, log: what operation was running, what the inputs were, and the full exception object (not just the message).

```
// Pseudocode
try:
    result = fetch_rates(product_code, date_range, criteria)
except Exception as e:
    log.error(
        "fetch_rates failed: product={}, date_range={}, criteria={}, error={}",
        product_code, date_range, criteria, e   // pass full exception, not e.message
    )
    raise   // always re-raise after logging
```

**The Rule:** Error logs MUST include: the operation name, all relevant input parameters, and the full exception (for stack trace). Never log only `e.message`. Always re-raise after logging unless the error is explicitly handled.

---

### 5.4 Pipeline Step Logging at DEBUG

**The Problem:** When a multi-step pipeline produces a wrong result, you need to know what each step received and produced. Without step-level logging, you have to add it under pressure during an incident.

**The Pattern:** At the start and end of every significant pipeline step, log at DEBUG level: what came in (counts, key identifiers) and what came out.

```
// Pseudocode
log.debug("Step 3: resolving dates for {} products", products.size())
date_contexts = resolve_dates(products, criteria)
log.debug("Step 3 complete: resolved dates for {} of {} products", len(date_contexts), products.size())

log.debug("Step 4: fetching price factors for date range {} to {}", min_date, max_date)
price_factors = fetch_price_factors(products, date_contexts)
log.debug("Step 4 complete: {} rates, {} discounts loaded", len(price_factors.rates), len(price_factors.discounts))
```

**The Rule:** Every major pipeline step MUST have a DEBUG log at entry (inputs/counts) and exit (outputs/counts). This must be in place before the code ships, not added during incidents.

---

### 5.5 Expose Runtime Diagnostic Endpoints

**The Problem:** When something goes wrong in production, you need to inspect the service's state without restarting it or deploying new code.

**The Pattern:** Expose management endpoints for: health (is the service up?), metrics (what is it doing?), and log-level control (can I turn on DEBUG without a restart?).

```yaml
# Minimum required endpoints
management:
  endpoints:
    expose:
      - health       # liveness + readiness
      - metrics      # counters, timers, gauges
      - loggers      # runtime log level control
```

**The Rule:** Every service MUST expose at minimum: `health`, `metrics`, and `loggers` (runtime log level control). The `loggers` endpoint is non-negotiable — it is the primary tool for diagnosing production issues without a deployment.

---

### 5.6 Trace Data Provenance

**The Problem:** When a result is wrong, the first question is always "where did this data come from?" Without provenance, answering that question requires a database investigation.

**The Pattern:** Attach a source identifier to every piece of data that has multiple possible origins. Log routing decisions at INFO level.

```
// Pseudocode
rate.source = RateSource.NATIVE          // came from native rate table
rate.source = RateSource.RATE_GRID       // came from rate grid override
rate.source = RateSource.INHERITED       // inherited from parent product

log.info("Routing product={} to {} (grid={} had {} rates)",
    product_code, rate.source, grid_code, grid_rates.size())
```

**The Rule:** Any data that can come from multiple sources MUST carry a source identifier. Routing decisions (which source was chosen and why) MUST be logged at INFO level.

---

## 6. SQL Syntax & Query Quality

### 6.1 Write Syntactically Valid SQL

**The Problem:** Malformed SQL (unbalanced parentheses, wrong keyword order, trailing commas) fails at runtime, often with cryptic errors that are hard to trace back to the query.

**The Rule:** All SQL strings MUST be syntactically valid before committing. Check: balanced parentheses, correct keyword order (`SELECT … FROM … WHERE … GROUP BY … HAVING … ORDER BY … LIMIT`), no trailing commas.

**Anti-pattern:**
```sql
SELECT id, name, FROM product WHERE active = 1  -- trailing comma before FROM
```

---

### 6.2 Never Use SELECT * in Production Code

**The Problem:** `SELECT *` fetches every column including BLOBs, unused fields, and future columns added to the table. This increases I/O, memory pressure, and breaks code silently when the schema changes.

**The Rule:** Every `SELECT` in production code MUST name only the columns it actually uses.

**Anti-pattern:**
```sql
SELECT * FROM rate WHERE product_code IN (:codes)
```

**Pattern:**
```sql
SELECT product_code, rate_value, effective_date FROM rate WHERE product_code IN (:codes)
```

---

### 6.3 Filter on Indexed Columns

**The Problem:** A `WHERE` clause that filters on non-indexed columns forces a full table scan. At scale, this is the difference between milliseconds and seconds.

**The Rule:** `WHERE` clauses MUST use indexed columns as the primary filter predicate. If no suitable index exists, add one or discuss with the DBA before shipping.

**Anti-pattern:**
```sql
SELECT id, name FROM product WHERE description LIKE '%park%'  -- non-indexed, full scan
```

---

### 6.4 Use Parameterized Placeholders — Never Concatenate Values

**The Problem:** Concatenating values into SQL strings opens SQL injection vulnerabilities and prevents the database from reusing query execution plans.

**The Rule:** All dynamic values MUST be passed as named parameters (`:param`). String concatenation of values into SQL is never acceptable.

**Anti-pattern:**
```sql
// Never do this
String sql = "SELECT * FROM product WHERE code = '" + code + "'";
```

**Pattern:**
```sql
String sql = "SELECT code, name FROM product WHERE code = :code";
params.addValue("code", code);
```

---

### 6.5 Use Explicit JOINs

**The Problem:** Implicit joins (comma-separated tables in `FROM` with filter conditions in `WHERE`) are hard to read, easy to get wrong, and produce accidental cross joins when a condition is missing.

**The Rule:** All joins MUST use explicit `JOIN … ON` syntax. Comma joins in `FROM` are not allowed.

**Anti-pattern:**
```sql
SELECT p.code, r.value FROM product p, rate r WHERE p.id = r.product_id
```

**Pattern:**
```sql
SELECT p.code, r.value FROM product p JOIN rate r ON p.id = r.product_id
```

---

### 6.6 Verify Named Parameters Match the Parameter Map

**The Problem:** A mismatch between a named parameter in the SQL string (`:param`) and the key in the parameter map causes a runtime error that only surfaces when the query is executed.

**The Rule:** Every named parameter in the SQL string MUST have a corresponding key in the `MapSqlParameterSource` or parameter map, with identical spelling. Verify 1:1 correspondence before committing.

**Anti-pattern:**
```java
String sql = "SELECT * FROM rate WHERE product_code = :productCode";
params.addValue("product_code", code);  // key mismatch — will fail at runtime
```

---

### 6.7 Remove Unnecessary ORDER BY

**The Problem:** `ORDER BY` forces the database to sort the full result set before returning rows. If the caller doesn't need a specific order, this is pure wasted cost.

**The Rule:** `ORDER BY` is only allowed when the caller explicitly requires ordered results. Remove it from queries where order is irrelevant.

**Anti-pattern:**
```sql
SELECT code, name FROM product WHERE active = 1 ORDER BY code  -- caller doesn't use order
```

---

### 6.8 GROUP BY Must Match Non-Aggregated SELECT Columns

**The Problem:** In strict SQL mode, selecting a column that is neither aggregated nor in the `GROUP BY` clause is an error. Even in permissive modes, the result is non-deterministic.

**The Rule:** Every non-aggregated column in `SELECT` MUST appear in `GROUP BY`. Verify this before committing any grouped query.

**Anti-pattern:**
```sql
SELECT product_code, name, MAX(rate_value)  -- name is not in GROUP BY
FROM rate
GROUP BY product_code
```

**Pattern:**
```sql
SELECT product_code, name, MAX(rate_value)
FROM rate
GROUP BY product_code, name
```

---

### 6.9 Paginate Unbounded Result Sets

**The Problem:** A query with no `LIMIT` can return millions of rows, exhausting memory and DB connection time. A single runaway query can degrade the entire service.

**The Rule:** Any query that could return an unbounded number of rows MUST have a `LIMIT` clause or use cursor-based pagination. The limit MUST be configurable.

**Anti-pattern:**
```sql
SELECT id, name FROM product WHERE active = 1  -- no limit, unbounded
```

**Pattern:**
```sql
SELECT id, name FROM product WHERE active = 1 LIMIT :maxResults
```

---

### 6.10 Don't Use SQL Keywords as Unquoted Aliases

**The Problem:** Using reserved SQL keywords (`value`, `date`, `type`, `key`, `order`) as unquoted column or table aliases causes parse errors on strict SQL engines and is confusing to read.

**The Rule:** Never use SQL reserved words as unquoted aliases. Either quote them with backticks/double-quotes or rename them.

**Anti-pattern:**
```sql
SELECT rate_value AS value FROM rate  -- 'value' is a reserved word
```

**Pattern:**
```sql
SELECT rate_value AS rate_amount FROM rate
```

---

### 6.11 Prefer UNION ALL Over UNION

**The Problem:** `UNION` deduplicates rows by running a sort or hash over the full combined result set. This is expensive and usually unnecessary — most callers either know duplicates won't exist or handle them in application code.

**The Rule:** Use `UNION ALL` by default. Only use `UNION` when deduplication is explicitly required and the cost is justified.

**Anti-pattern:**
```sql
SELECT code FROM product_a
UNION
SELECT code FROM product_b  -- dedup cost paid even when not needed
```

**Pattern:**
```sql
SELECT code FROM product_a
UNION ALL
SELECT code FROM product_b
```

---

## Quick Reference

| Dimension | Pattern | When to Apply |
|---|---|---|
| Concurrency | Parallel async for independent I/O | Multiple fetches needed together with no dependency |
| Concurrency | Parallel collection processing | List of independent work units |
| Concurrency | Sequential with documented dependency | Tree/DAG where parent needs child results |
| Concurrency | Async writes, sync reads | Any cache layer |
| Async | Offload blocking work from request threads | Any handler that does I/O |
| Async | Log at failure site, then propagate | Any async callback/handler |
| Async | Pipeline batch writes | Multi-item writes to remote store |
| Scale | Batch queries with `IN` clause | Any loop that calls a repository |
| Scale | Collect keys before fetching | Multi-entity assembly pipelines |
| Scale | Configurable request size limits | Any endpoint accepting a collection |
| Scale | Union range for batch date queries | Items with individual date ranges |
| Scale | Explicit fallback routing | Primary source with partial coverage |
| Performance | HashSet for membership checks | `contains` inside a loop or stream |
| Performance | Group-by + max/min for deduplication | Keeping best record per composite key |
| Performance | Immutable objects + copy-with-change | Objects shared across concurrent tasks |
| Performance | Capability-gated assembly | Work only needed by some consumers |
| Performance | Fail fast at the boundary | Input validation |
| Performance | Separate resolved state from source | Derived values during processing |
| Observability | Timer on every I/O operation | All DB, cache, external API calls |
| Observability | Request duration at entry point | All public API handlers |
| Observability | Full-context error logging | Every catch/error handler |
| Observability | Pipeline step DEBUG logging | Multi-step processing pipelines |
| Observability | Runtime diagnostic endpoints | Every deployed service |
| Observability | Data provenance on results | Data with multiple possible sources |
| SQL | Syntactically valid SQL | Every SQL string before committing |
| SQL | No `SELECT *` | All production queries |
| SQL | Filter on indexed columns | All `WHERE` clauses |
| SQL | Parameterized placeholders | Any query with dynamic values |
| SQL | Explicit `JOIN … ON` | Any multi-table query |
| SQL | Named params match parameter map | Any named-parameter query |
| SQL | No unnecessary `ORDER BY` | Queries where caller doesn't need order |
| SQL | `GROUP BY` matches `SELECT` columns | Any grouped query |
| SQL | `LIMIT` on unbounded queries | Any query without a natural row cap |
| SQL | No reserved words as unquoted aliases | Any query using aliases |
| SQL | `UNION ALL` over `UNION` | Any set-union query without required dedup |

---

## Checklist for Code Review

Use this when reviewing a PR or auditing a service:

**Concurrency**
- [ ] Are independent I/O calls parallelized?
- [ ] Are sequential loops justified by a documented data dependency?
- [ ] Are cache writes non-blocking?

**Async**
- [ ] Do request handlers return futures/promises and offload blocking work?
- [ ] Do async error handlers log with context and re-throw (not swallow)?

**Scale**
- [ ] Are there any N+1 query patterns (repository call inside a loop)?
- [ ] Are request collection sizes bounded by a configurable limit?
- [ ] Are batch queries using union ranges where applicable?

**Performance**
- [ ] Are `contains` checks inside loops using hash-based structures?
- [ ] Are source/domain objects kept immutable during processing?
- [ ] Is work gated on capability checks where only some consumers need it?
- [ ] Does input validation happen at the entry point?

**Observability**
- [ ] Is every I/O operation timed?
- [ ] Does every handler log its total duration?
- [ ] Do error logs include full context and the exception object?
- [ ] Does every pipeline step have DEBUG entry/exit logs?
- [ ] Are `health`, `metrics`, and `loggers` endpoints exposed?
- [ ] Does data with multiple sources carry a provenance identifier?

**SQL Syntax & Query Quality**
- [ ] Is the SQL syntactically valid (balanced parentheses, correct keyword order, no trailing commas)?
- [ ] Does every `SELECT` specify only needed columns — no `SELECT *`?
- [ ] Do `WHERE` clauses filter on indexed columns?
- [ ] Are all dynamic values passed as named parameters — no string concatenation?
- [ ] Are all joins explicit (`JOIN … ON`) — no implicit comma joins?
- [ ] Do named parameters match the parameter map keys 1:1?
- [ ] Is `ORDER BY` present only when the caller needs ordering?
- [ ] Do `GROUP BY` columns match all non-aggregated `SELECT` columns?
- [ ] Is `LIMIT` / pagination applied for queries that could return unbounded rows?
- [ ] Are SQL reserved words avoided as unquoted aliases?
- [ ] Is `UNION ALL` used instead of `UNION` where dedup is not required?

---

_This guide is derived from production patterns. Update it when a new pattern is established or an anti-pattern is discovered in a post-incident review._
