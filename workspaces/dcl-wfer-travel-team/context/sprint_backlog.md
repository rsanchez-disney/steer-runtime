# Sprint backlog — DCL WFER Travel

## Active tickets

### Sprint 1 (due July 27, 2026)

| Ticket | Summary | Priority | Deps | Status |
|:-------|:--------|:---------|:-----|:-------|
| DCLWFER-92 | Pooled RestTemplate — single shared bean with connection pooling | Medium | None | To Do |
| DCLWFER-95 | Cache CMA Token — in-memory cache for Keycloak service-account tokens | Medium | None | To Do |
| DCLWFER-93 | Collapse SwellSteps Helpers — deduplicate 4 near-identical HTTP helpers | Low | DCLWFER-92 | Blocked |

### Sprint 2 (due August 10, 2026)

| Ticket | Summary | Priority | Deps | Status |
|:-------|:--------|:---------|:-----|:-------|
| DCLWFER-21 | Enhance Error Handling — standardize across MQ, HTTP, and JAX-RS | Medium | DCLWFER-93 | Blocked |
| DCLWFER-223 | Parallel Flowable Dispatch — shadow mode behind feature toggles | Medium | DCLWFER-92, 93 | Blocked |

## Dependency graph

```text
DCLWFER-92 (Pooled RestTemplate)  ←── DCLWFER-93 (Collapse helpers)
         │                                     │
         └─────────────────────────────────────┼──── DCLWFER-223 (Parallel Flowable)
                                               │
DCLWFER-95 (Cache CMA Token) ─ independent     │
                                               │
DCLWFER-21 (Error Handling) ───────────────────┘ (overlaps: shared client, outbox)
```

## Recommended implementation order

1. **DCLWFER-92** — enabler, no deps, unblocks 93 and 223
2. **DCLWFER-95** — independent, can parallel with 92
3. **DCLWFER-93** — depends on 92, unblocks 21 and 223
4. **DCLWFER-21** — large scope, overlaps with 93's refactoring
5. **DCLWFER-223** — depends on 92, 93; benefits from 21's patterns

## Ticket details

### DCLWFER-92: Pooled RestTemplate

**Problem**: 4 call sites create `new RestTemplate()` per invocation — no connection pooling, no timeouts.

**Solution**: Single `@Bean RestTemplate` with qualifier `swellstepsRestTemplate`:
- Apache HC `PoolingHttpClientConnectionManager`
- Connect timeout: 5s
- Read timeout: 30s
- Pool max-total: 50, max-per-route: 25
- Idle eviction: 30s
- Config externalized in `application.yml`

**Files to touch**: `config/AppConfig.java` (new bean), `SwellstepsUtil.java`, `CloseFlightReconciliationUtil.java` (inject bean)

### DCLWFER-95: Cache CMA Token

**Problem**: Every CMA call re-authenticates with Keycloak — fresh POST /token per request (tokens valid ~300s).

**Solution**: In-memory cache in `CMAPortsUtil`:
- Key: clientId
- TTL: expiresIn - 60s (refresh before expiry)
- Double-checked synchronized refresh
- 401 invalidate-and-retry
- Micrometer counters: `cma.token.cache.hits`, `cma.token.cache.misses`
- 10-thread concurrency test

**Files to touch**: `CMAPortsUtil.java` (add cache), test class

### DCLWFER-93: Collapse SwellSteps Helpers

**Problem**: 4 helper methods byte-identical except body type — ~120 lines of duplication.

**Solution**:
- Single private `post(T body)` method in `SwellstepsUtil`
- Delete `CloseFlightReconciliationUtil` (move to SwellstepsUtil)
- Keep public signatures unchanged (backward compatible)
- Consistent headers + correlation ID on all calls

**Files to touch**: `SwellstepsUtil.java` (refactor), `CloseFlightReconciliationUtil.java` (delete), callers (update imports)

### DCLWFER-21: Enhance Error Handling

**Problem**: Silently dropped failures, no retry/DLQ, stack trace leaks, TODO catch blocks.

**Solution** (3 services):
1. **Amadeus MQ** — redelivery on failure, backout queue after N retries
2. **Travel-service SwellSteps** — shared `SwellstepsClient` bean (from DCLWFER-93), outbox table + scheduler
3. **JAX-RS mapper** — no stack traces in responses, proper ExceptionMapper

**Cross-cutting**: Actuator HealthIndicator for MQ connectivity.

### DCLWFER-223: Parallel Flowable Dispatch

**Problem**: Add Flowable integration alongside SwellSteps in shadow/observation mode.

**Solution**: Per-flow feature toggles across 3 codebases:
- `travel-service` (Java): parallel HTTP call to Flowable behind toggle
- `travel-webapi` (Node): feature-decider toggle for Flowable endpoint routing
- 7 toggle types covering all message types
- Flowable failure NEVER affects SwellSteps or MQ ack
- Structured logging per dispatch result
- Unit tests per toggle state (on/off)

**Feature toggle names**: `FLOWABLE_TRAVEL_BOOKING`, `FLOWABLE_TRAVEL_CANCEL`, `FLOWABLE_FLIGHT_CHANGE`, `FLOWABLE_HOTEL_BOOKING`, `FLOWABLE_HOTEL_CANCEL`, `FLOWABLE_RECONCILIATION`, `FLOWABLE_CREW_UPDATE`

## IBM MQ patterns (for DCLWFER-21)

The travel-service receives messages from Amadeus via IBM MQ (JMS). Key patterns:

```java
// MQ Listener pattern (existing)
@JmsListener(destination = "${mq.queue.travel-details}")
public void onMessage(Message message) {
    // Current: silently swallows exceptions
    // Target: redeliver on failure, DLQ after N retries
}

// Target error handling:
@JmsListener(destination = "${mq.queue.travel-details}")
public void onMessage(Message message) {
    try {
        processMessage(message);
    } catch (TransientException e) {
        throw e; // triggers redelivery
    } catch (PermanentException e) {
        moveToBackoutQueue(message, e);
    }
}
```

## External endpoints

| Service | URL pattern | Auth |
|:--------|:------------|:-----|
| SwellSteps | `${swellsteps.baseUrl}/api/v1/...` | Headers (correlation ID) |
| CMA | `${cma.baseUrl}/crew/...` | Keycloak OAuth (service-account) |
| Flowable (new) | `${flowable.baseUrl}/process/...` | TBD (likely service-account) |
| Amadeus MQ | Queue: `${mq.queue.travel-details}` | JMS connection factory |
