---
inclusion: fileMatch
fileMatchPattern: ["**/adapter/out/gateway/**/*.java", "**/client/**/*.java", "**/restclient/**/*.java"]
description: Resilience strategy overview for Spring Boot services
---

# Resilience Strategy Overview

> **Related Rules**:
> - `dlp/foundation-usage.mdc` — Foundation retry and rest-client modules
> - `dlp/exception-handling.mdc` — ExternalServiceException, ServerException
> - `spring/spring-infrastructure.mdc` — Health indicators for circuit breaker monitoring
> - `dlp/hexagonal-architecture.mdc` — Gateway adapters (primary place resilience patterns apply)

---

## Why Multiple Patterns?

Each resilience pattern solves a specific problem:

| Pattern | Problem Solved | Example |
|---------|----------------|---------|
| **Timeout** | Prevent waiting forever | External service hangs |
| **Circuit Breaker** | Stop calling failing service | Service is down |
| **Rate Limiter** | Prevent overwhelming service | Protect against DoS |
| **Retry** | Recover from transient failures | Network hiccup |
| **Bulkhead** | Isolate failures | One slow service doesn't block others |

## Recommended Order

Apply patterns in this order (outer to inner):

```
Request
   │
   ▼
┌──────────────┐
│   Timeout    │  ← 1. Fail fast if too slow
└──────┬───────┘
       │
       ▼
┌──────────────┐
│Circuit Breaker│ ← 2. Stop if service is down
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Rate Limiter │  ← 3. Throttle requests
└──────┬───────┘
       │
       ▼
┌──────────────┐
│    Retry     │  ← 4. Retry transient failures
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Bulkhead   │  ← 5. Isolate resources
└──────┬───────┘
       │
       ▼
   Actual Call
```

## Configuration Summary

```properties
# ============================================
# Resilience4j Configuration
# ============================================

# Timeout (fail-fast)
resilience4j.timelimiter.instances.externalService.timeout-duration=5s
resilience4j.timelimiter.instances.externalService.cancel-running-future=true

# Circuit Breaker
resilience4j.circuitbreaker.instances.externalService.sliding-window-type=COUNT_BASED
resilience4j.circuitbreaker.instances.externalService.sliding-window-size=10
resilience4j.circuitbreaker.instances.externalService.minimum-number-of-calls=5
resilience4j.circuitbreaker.instances.externalService.failure-rate-threshold=50
resilience4j.circuitbreaker.instances.externalService.wait-duration-in-open-state=30s
resilience4j.circuitbreaker.instances.externalService.permitted-number-of-calls-in-half-open-state=3

# Rate Limiter
resilience4j.ratelimiter.instances.externalService.limit-for-period=100
resilience4j.ratelimiter.instances.externalService.limit-refresh-period=1s
resilience4j.ratelimiter.instances.externalService.timeout-duration=0s

# Retry
resilience4j.retry.instances.externalService.max-attempts=3
resilience4j.retry.instances.externalService.wait-duration=1s
resilience4j.retry.instances.externalService.enable-exponential-backoff=true
resilience4j.retry.instances.externalService.exponential-backoff-multiplier=2
resilience4j.retry.instances.externalService.retry-exceptions=java.io.IOException,java.util.concurrent.TimeoutException

# Bulkhead
resilience4j.bulkhead.instances.externalService.max-concurrent-calls=25
resilience4j.bulkhead.instances.externalService.max-wait-duration=0s
```

## Recommended Patterns

**All external service calls SHOULD have at minimum Timeout + CircuitBreaker.** Add Retry for transient failures.

### Annotation Usage

```java
@Component
public class PaymentGatewayAdapter implements PaymentGateway {
    private final RestClient restClient;
    private final Executor taskExecutor;  // Foundation's MDC-aware executor

    @Override
    @TimeLimiter(name = "paymentService")
    @CircuitBreaker(name = "paymentService", fallbackMethod = "fallback")
    @Retry(name = "paymentService")
    public CompletableFuture<PaymentResponse> processPayment(PaymentRequest request) {
        return CompletableFuture.supplyAsync(() -> {
            // call external service via restClient
        }, taskExecutor);  // Always use Foundation's executor for MDC propagation
    }

    private CompletableFuture<PaymentResponse> fallback(PaymentRequest request, Throwable t) {
        log.warn("Payment service fallback triggered: {}", t.getMessage());
        throw new ExternalServiceException("payment-service", "Payment service unavailable", t);
    }
}
```

### Key Rules
- **Fallback methods**: Same return type + `Throwable` parameter
- **Instance names**: Match service name (e.g., `paymentService`, `inventoryService`)
- **Rate limiter**: Add on public-facing endpoints or when calling rate-limited APIs
- **Bulkhead**: Add when one slow service must not block others

---

## Circuit Breaker States

```
     ┌─────────────────────────────────────────┐
     │                                         │
     │    CLOSED ──────► OPEN ──────► HALF_OPEN
     │      │              │              │
     │      │              │              │
     │      │              ▼              │
     │      │         (wait time)         │
     │      │              │              │
     │      │              │              │
     │      ◄──────────────┴──────────────┘
     │    (success rate OK)    (success/failure)
     │                                         │
     └─────────────────────────────────────────┘

CLOSED:    Normal operation, tracking failures
OPEN:      All calls fail fast with fallback
HALF_OPEN: Limited calls to test if service recovered
```

## Resilience4j Retry

Use Resilience4j `@Retry` when you need:
- Combining with circuit breaker in the same annotation stack
- Retry on specific response predicates
- Metrics integration with Micrometer

> **DLP projects**: Foundation provides its own retry (`@Retryable`, `RetryTemplate`) — skill: `dlp-configure-foundation-retry`; also covered in `dlp/foundation-usage.mdc`

```java
@Retry(name = "externalService", fallbackMethod = "fetchDataFallback")
public DataResponse fetchData(String id) {
    return restClient.get()
        .uri("/data/{id}", id)
        .retrieve()
        .body(DataResponse.class);
}

private DataResponse fetchDataFallback(String id, Exception ex) {
    log.error("All retries exhausted: id={}, error={}", id, ex.getMessage());
    throw new ExternalServiceException("data-service", 
        "Service unavailable after retries", ex);
}
```

### Combining Retry with Circuit Breaker

```java
// Order matters: Retry is INSIDE Circuit Breaker
// CB records one failure per logical operation (not one per retry attempt)
// Circuit breaker prevents retries when service is known to be down
//
// ⚠️ Resilience4j default has Retry OUTSIDE CB. To get this recommended order, configure:
//   resilience4j.circuitbreaker.circuitBreakerAspectOrder=1
//   resilience4j.retry.retryAspectOrder=2
// Or use Foundation retry (foundation-retry) which handles ordering.

@CircuitBreaker(name = "service", fallbackMethod = "fallback")
@Retry(name = "service")
public DataResponse callService(String id) {
    return restClient.getData(id);
}
```

### Spring Retry vs Resilience4j Retry

| Scenario | Recommended |
|----------|-------------|
| Simple retry with backoff | Spring Retry `@Retryable` |
| Programmatic retry control | Spring Retry `RetryTemplate` |
| Combined circuit breaker + retry | Resilience4j `@Retry` |
| Retry on HTTP status codes | Resilience4j (predicates) |
| Metrics/monitoring integration | Resilience4j |

> **DLP projects**: Foundation provides its own `@Retryable` / `RetryTemplate` (skill: `dlp-configure-foundation-retry`)

---

## When to Use Each Pattern

| Scenario | Patterns |
|----------|----------|
| External REST API | Timeout + CircuitBreaker + Retry |
| Database calls | Timeout + Retry (careful with transactions) |
| Message queue | Retry + Bulkhead |
| Critical payment | Timeout + CircuitBreaker (no retry - idempotency) |
| Notification service | CircuitBreaker + Retry (fire-and-forget) |
| Rate-limited API | RateLimiter + CircuitBreaker |

## Quick Reference

| Pattern | Annotation | Key Config |
|---------|------------|------------|
| Timeout | `@TimeLimiter` | `timeout-duration` |
| Circuit Breaker | `@CircuitBreaker` | `failure-rate-threshold`, `wait-duration-in-open-state` |
| Rate Limiter | `@RateLimiter` | `limit-for-period`, `limit-refresh-period` |
| Retry | `@Retry` (Resilience4j) or `@Retryable` (Spring Retry) | `max-attempts`, `wait-duration`, `exponential-backoff` |
| Bulkhead | `@Bulkhead` | `max-concurrent-calls` |

---

## Resilience Anti-Patterns

| Anti-Pattern | What to look for | Why it's wrong |
|---|---|---|
| `@Retry` outside `@CircuitBreaker` | Retry is outer aspect | Each retry counts as CB failure; opens circuit too fast |
| No fallback on CB | `@CircuitBreaker` without `fallbackMethod` | Hard failures propagate |
| Retry on non-idempotent writes | POST without idempotency + `@Retry` | Duplicate side effects |
| Same Resilience4j instance name reused for unrelated calls | One config for many methods | Wrong thresholds for different SLAs |
| Missing `@TimeLimiter` on async externals | CompletableFuture without deadline | Hung threads under load |
| Infinite or huge `max-attempts` | Retry with no cap | Thundering herd; downstream overload |

> **Spring AOP note:** On a single method, **annotation declaration order** can affect which aspect runs “outside” vs “inside.” If in doubt, compare with the **Quick Reference** examples earlier in this file and with Resilience4j/Spring documentation for your Boot version — do not guess from memory alone.

---

## Resilience Checklist

- [ ] All external calls have **Timeout** configured (no infinite waits)
- [ ] All external calls have **Circuit Breaker** with fallback method
- [ ] Retry configured with **exponential backoff** for transient failures
- [ ] Retry **inside** Circuit Breaker (CB records one failure per logical operation)
- [ ] **Fallback methods** match return type + `Throwable` parameter
- [ ] Instance names are **consistent** across patterns for the same service
- [ ] Rate limiter on **public-facing endpoints** or rate-limited API calls
- [ ] Bulkhead for **isolation** when slow services must not block others
- [ ] Circuit breaker state visible where platform expects it (often **`/actuator/health`** when actuator + Micrometer are used). If Micrometer is **intentionally** absent, do not infer a HIGH defect from missing Resilience4j metrics alone — see **`spring/spring-infrastructure.mdc`** → **Actuator starter and Micrometer exclusions**
- [ ] Resilience config values reviewed (not just defaults)

