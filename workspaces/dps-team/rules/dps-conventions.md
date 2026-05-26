# DPS Development Conventions

## API Design (JAX-RS / CXF)

- All core services expose REST APIs via Apache CXF (JAX-RS)
- URL pattern: `/dps{segment}/api/v1/sales-offers/packages/{resource}`
- `{segment}` encodes site context (e.g., `-dlr`, `-dlp`)
- Use Jakarta EE annotations (`@Path`, `@POST`, `@GET`, etc.)
- Always include `Correlation-Id` header for distributed tracing
- Backward compatible changes only — additive fields, new endpoints
- Never break existing Pact contracts

## SOAP / TravelBox Integration

- TravelBox integration uses JAX-WS 4.0 (Jakarta XML WS)
- SOAP clients are generated from WSDL — do not hand-edit generated code
- TravelBox WS Client library handles connection pooling and retry
- Always test SOAP interactions with WireMock stubs
- Handle SOAP faults gracefully — map to structured REST error responses

## Pact Contract Testing

- Consumer tests define expectations against downstream services
- Provider tests verify DPS fulfills contracts for upstream consumers
- Run Pact tests as part of `mvn clean test`
- Never break a published Pact contract without coordinating with consumers
- Tag Pact versions with environment (latest, stage, prod)

## Caching (Redis)

- **Cache**: Product catalog data (PAT responses), scoring configurations, rate plans
- **Never cache**: Eligibility (PAT) and Availability responses (DPOS, RAS, TAS, AAS)
- **TTL**: Configurable per data type via mpropz
- Redis Lettuce client with connection pooling

## Resilience

- Circuit breakers (Resilience4j) on ALL downstream service calls
- Configure per-service: PAT, RAS, TAS, AAS, DPE, CEA, RIS
- Fallback behavior: degrade gracefully
- Timeout configuration per downstream service
- Retry with exponential backoff for transient failures

## Offer Lifecycle Rules

- Price protection: persisted offers have configurable TTL — never serve expired prices
- Freeze IDs are composite (link to component freeze IDs from RIS)
- Freeze TTL is returned by RIS — DPS must respect and propagate it
- Quote must re-validate availability and pricing — never serve stale data
- Price change indicator must be set when quote price differs from search price

## Multi-Site (DLR / DLP)

- DLR and DLP have different product catalogs, code systems, and availability sources
- Code translation (TBX ↔ domain, Accovia ↔ domain) is handled by PAT
- Separate Harness pipelines for DLR and DLP where applicable
- Site-specific configuration via mpropz (not hardcoded)
- Test both sites in integration tests

## Docker

- Base image: `wdpr-ra-docker-base-tomcat-tc10jre21:v2` (ECR: 876496569223)
- OpenTelemetry agent bundled (`core-opentelemetry:v1.0.0`)
- Non-root user: UID 1000, GID 3000
- WAR deployed to Tomcat 10 webapps
- Health check: Spring Actuator `/actuator/health`
- ECR auth via `awsmyid login`

## Build & Run

```bash
# Standard build
mvn clean install

# Fast build (skip tests)
mvn clean install -Dfast

# Run locally
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Coverage
mvn clean test jacoco:report
```

## Testing

- Unit tests: `mvn clean test` (required before every PR)
- Integration tests: WireMock for downstream services, REST Assured for API verification
- BDD: Serenity BDD for acceptance tests
- Contract: Pact 4.6.14 (consumer + provider)
- Always test multi-site scenarios (DLR vs DLP code paths)
- Always test multi-client scenarios (TBX client vs Non TBX client)
- Test freeze lifecycle: create → validate → confirm/cancel
- Mock data endpoints available in resflowmgmt for local testing

## Logging

- Use WDPR loggingapi for JSON structured logging (Splunk)
- Log all API requests with correlation IDs
- Log errors with full stack traces and request context
- Use appropriate levels: DEBUG for dev, INFO for operations, WARN/ERROR for issues
- Never log sensitive data (tokens, credentials, PII, payment info)
- Guard `log.debug()` with `isDebugEnabled()` for expensive payloads

## Branch Naming

- Feature: `feat/DPS-{ticket}-{short-description}`
- Bugfix: `fix/DPS-{ticket}-{short-description}`
- Hotfix: `hotfix/DPS-{ticket}-{short-description}`
- Default branch: `develop` (not `main`)

## PR Conventions

- One Jira ticket = one PR
- PR title: `ISOPP-{ticket}: {description}`
- PR commits: Use Conventional Commits type prefix + flow + message + jira ticket number e.g., `fix(offer): DPS should send right classification to DPOS for DLR/DLP Offer [ISOPP-9226]`
- Include summary of the changes
- Include BEFORE/AFTER for any behavioral change
- Run `mvn clean test` before submitting
- Minimal diff — don't refactor unrelated code

## Development Conventions

- Avoid verbose implementations, excessive comments, or boilerplate code
- Follow established patterns before creating new ones
- Use existing interfaces and service patterns as templates
- Leverage mapping libraries (MapStruct) for data transformations
- Use try-with-resources for AutoCloseable
- Bean Validation annotations, meaningful error messages

## Java 21 Conventions

### Prefer

- `sealed` interfaces for closed type hierarchies (offer states, pricing results)
- Pattern matching with `instanceof`
- `switch` expressions (with `->` and `yield`)
- `Stream.toList()` over `Collectors.toList()`
- Text blocks for multi-line strings (JSON templates, SOAP payloads)
- `Optional` for return types that may be absent
- `var` for local variables when type is obvious
- `List.of()`, `Map.of()`, `Set.of()` for immutable collections
- Virtual threads for I/O-bound downstream calls (where supported)

### Avoid

- Raw types
- `null` returns — use `Optional` or empty collections
- No .get(0) without size validation
- No method chains without null checks
- No unsafe Optional usage (.get() without .orElse())
- No resource leaks (unclosed streams/connections)
- Mutable DTOs when immutability suffices
- Checked exceptions for control flow
- `StringBuffer` — use `StringBuilder`
- Hand-editing WSDL-generated SOAP client code

## Performance

- Offer search target: < 5 seconds P95 (involves multiple downstream calls)
- Use async/parallel calls for independent availability checks (RAS, TAS, AAS in parallel)
- Batch requests to DPE when pricing multiple candidates
- Monitor Redis connection pool utilization
- Circuit breakers prevent cascade failures from slow downstream services
- ShedLock prevents duplicate scheduled jobs across instances

## Security

- All endpoints require WDPR AuthZ (OAuth2)
- Never commit credentials — use Vault/mpropz
- Validate all request inputs at controller level
- Never log tokens or auth headers
