# Skill: DAO implementation (WebClient + Resilience4j)

Use when adding external service integrations.

## Checklist
1. Create DAO interface with `Mono<T>` / `Flux<T>` return types
2. Create DAOImpl with `WebClient` calls
3. Add triple resilience: `@CircuitBreaker` + `@TimeLimiter` + `@Retry`
4. Add fallback method for circuit breaker
5. Configure Resilience4j in `application.yml` (circuit breaker, time limiter, retry)
6. Add `RetryablePredicate` for selective retry (408, 429, 500, 503, 504)
7. Create WebClient bean in `DaoConfig` with base URL from config
8. Add unit test with `MockWebServer`
9. Test fallback behavior
