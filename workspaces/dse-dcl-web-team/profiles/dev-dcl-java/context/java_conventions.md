# Java Conventions — DCL Microservices

## Stack
- Java 17, Spring Boot 3 WebFlux (reactive, Netty-based)
- Spring Data MongoDB Reactive
- WebClient for HTTP calls (never RestTemplate)
- Resilience4j (circuit breaker + time limiter + retry)
- Caffeine for local caching
- Lombok (@RequiredArgsConstructor, @Value, @Builder, @Jacksonized, @Slf4j/@Log4j2)
- Log4j2 with WdprConfiguredJsonLayout
- Maven with Disney parent POM (dcl-apps-microservice-parent)
- springdoc-openapi for Swagger

## Code Style
- Spotless (Eclipse formatter) + OpenRewrite
- Google Java Style Guide as base
- Organize by feature: controller/, service/, dao/, config/, exception/
- Interface-driven: service and DAO layers use interfaces with separate implementations
- Constructor injection via Lombok `@RequiredArgsConstructor` (all fields `final`)

## Method Contracts
- Methods should not return `null` — use `Optional`, exceptions, empty collections, or `Mono.empty()`
- If `null` is accepted, document in Javadoc
- Variables from multiple paths should not be pre-initialized

## Reactive Rules
- All layers return `Mono<T>` / `Flux<T>`
- No `.block()` in production code
- Use `Mono.zip()` for parallel calls, `flatMap()` for sequential
- Use `switchIfEmpty()` for fallback values
- Use `StepVerifier` for testing reactive streams

## Resilience Pattern (WebClient DAOs)
```java
@CircuitBreaker(name = SERVICE_NAME, fallbackMethod = "fallback")
@TimeLimiter(name = SERVICE_NAME)
@Retry(name = SERVICE_NAME)
public Mono<T> callExternalService(...) { ... }
```
- Order: CircuitBreaker (outermost, order=1) → TimeLimiter (order=2) → Retry (innermost, order=3)
- RetryablePredicate: retry only on 408, 429, 500, 503, 504 and Netty timeouts
- Fallback: return cached data or error-flagged response, don't throw

## Response DTOs
```java
@Value @Jacksonized @Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class ResponseDto {
    String field;
}
```

## Error Handling
- `@RestControllerAdvice` with `GlobalExceptionHandler`
- Custom exceptions: `EmptyContentException` (404), `ValidationException` (400)
- Partial response pattern: `isPartialResponse=true` + `errorMessage` when upstream fails
- `CommonDAO.determineException()` converts WebClient errors

## Logging
- Log4j2 (not Logback) — exclude spring-boot-starter-logging
- Async appenders with Disruptor ring buffer
- `LogDCL` utility for reactive context propagation (ThreadContext in WebFlux)
- Per-environment configs: `log4j2-{profile}.xml`

## Testing
- JUnit 5 + Mockito + `@ExtendWith(MockitoExtension.class)`
- `MockitoSettings(strictness = Strictness.WARN)`
- Reactor `StepVerifier` for reactive assertions
- `Instancio` for test data generation
- Embedded MongoDB (flapdoodle) for integration tests
- `MockWebServer` (OkHttp) for HTTP mocking
- JaCoCo: 84% branch coverage minimum at CLASS level
- Exclude from coverage: models, DTOs, config, exception classes
- `*IntegrationTest.java` excluded from Surefire (unit test phase)

## Configuration
- Spring profiles: local, latest, stage, load, prod
- `application-{profile}.yml` per environment
- Resilience4j config per service instance in YAML
- Caffeine cache: configurable TTL and max entries per cache name
- Actuator at `/healthcheck`

## Build
- `mvn clean verify` — full build with tests and coverage
- `mvn spotless:apply` — format code
- Docker: JRE 17 Debian 12 base from Disney ECR
- CI/CD: Harness pipelines
