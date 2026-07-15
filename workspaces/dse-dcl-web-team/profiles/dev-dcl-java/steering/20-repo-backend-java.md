---
inclusion: fileMatch
fileMatchPattern: ["**/*.java", "**/*.xml", "**/*.yml", "**/*.yaml", "pom.xml"]
---

# Backend (Java) steering — DCL Reactive Microservices

## Architecture
- Layered: Controller → Service (interface) → ServiceImpl → DAO (interface) → DAOImpl / Repository
- All layers reactive: `Mono<T>` / `Flux<T>` — no `.block()` in production code
- Interface-driven design for service and DAO layers
- Constructor injection via Lombok `@RequiredArgsConstructor`

## Resilience
- Triple pattern on all external HTTP calls: `@CircuitBreaker` + `@TimeLimiter` + `@Retry`
- Fallback returns cached data or error-flagged response, never throws
- RetryablePredicate: only retry on 408, 429, 500, 503, 504

## Backward compatibility
- Do not modify existing endpoints in a breaking way
- Prefer adding new endpoints or optional fields
- Response DTOs: `@JsonIgnoreProperties(ignoreUnknown = true)` always

## Testing
- JUnit 5 + Mockito + StepVerifier for reactive assertions
- 84% branch coverage minimum (JaCoCo)
- Embedded MongoDB for integration tests
- MockWebServer for HTTP mocking

## Do not
- Do not use `.block()` in production code
- Do not use RestTemplate — use WebClient
- Do not skip Resilience4j annotations on external calls
- Do not hardcode secrets — use Spring profiles and env vars
