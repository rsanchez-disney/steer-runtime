# Test Plan: POST /api/v1/refunds/validate

**Service:** Spring Boot (Java)
**Domain:** Payment / Refunds
**Endpoint:** `POST /api/v1/refunds/validate`
**Author:** QA Agent
**Date:** 2026-07-23
**Version:** 1.0

---

## 1. Scope

### In scope

- Input validation of all request fields (`transactionId`, `refundAmount`, `currency`, `reason`, `requestedBy`)
- Business rule validation (amount limits, refund eligibility, duplicate detection, time windows)
- Authentication and authorization enforcement
- HTTP status codes and response body contract
- Error handling and graceful degradation
- Performance characteristics under expected load
- Contract compatibility with downstream consumers

### Out of scope

- Actual refund processing/execution (this endpoint only validates)
- Payment gateway integration behavior
- UI/frontend testing
- Database migration testing
- Third-party notification services (email, SMS)
- Load testing beyond baseline benchmarks (separate performance test plan)

---

## 2. Test strategy

### Unit tests

- **Scope:** Controller layer, service layer, validators, mappers
- **Framework:** JUnit 5 + Mockito
- **Coverage target:** 90%+ line coverage on validation logic
- **Approach:** Test each validation rule in isolation; mock external dependencies (transaction repository, fraud service)

### Integration tests

- **Scope:** Full Spring context with embedded database and service interactions
- **Framework:** Spring Boot Test (`@SpringBootTest`) + Testcontainers
- **Approach:** Verify end-to-end flow from HTTP request through service layer to repository lookups; validate transactional behavior

### API / contract tests

- **Scope:** Request/response schema, HTTP status codes, content types
- **Framework:** Spring MockMvc + REST Assured; optional Pact for consumer-driven contracts
- **Approach:** Assert response shape, field presence, error format consistency across all scenarios

### Security tests

- **Scope:** Authentication enforcement, role-based access, input sanitization
- **Framework:** Spring Security Test (`@WithMockUser`), OWASP ZAP (DAST)
- **Approach:** Verify 401/403 responses for unauthenticated/unauthorized requests; test injection vectors in string fields

---

## 3. Test cases

### 3.1 Happy path / functional validation

| ID          | Title                                              | Priority | Preconditions                                                       | Steps                                                                                                                                               | Expected Result                                                                                          |
|-------------|-------------------------------------------------------|----------|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| TC-RV-001   | Validate refund with all valid fields                 | Critical | Valid auth token; transaction `TXN-001` exists with amount $100.00   | 1. POST `/api/v1/refunds/validate` with body `{transactionId: "TXN-001", refundAmount: 50.00, currency: "USD", reason: "customer_request", requestedBy: "agent@disney.com"}` | 200 OK; body `{valid: true, reasons: []}`                                                                |
| TC-RV-002   | Validate full refund (amount equals original)         | Critical | Transaction `TXN-002` exists with amount $75.00                      | 1. POST with `refundAmount: 75.00` for `TXN-002`                                                                                                   | 200 OK; body `{valid: true, reasons: []}`                                                                |
| TC-RV-003   | Validate refund with all supported currencies         | High     | Transactions exist in USD, EUR, GBP, JPY                             | 1. POST valid refund for each currency                                                                                                              | 200 OK; `valid: true` for each supported currency                                                        |
| TC-RV-004   | Validate refund with minimum allowed amount           | High     | Transaction exists; minimum refund is $0.01                          | 1. POST with `refundAmount: 0.01`                                                                                                                   | 200 OK; `valid: true`                                                                                    |
| TC-RV-005   | Validate partial refund on partially refunded txn     | High     | Transaction `TXN-003` ($100) has prior $30 refund                    | 1. POST with `refundAmount: 50.00` for `TXN-003`                                                                                                   | 200 OK; `valid: true` (remaining $70 available)                                                          |

### 3.2 Input validation (required fields, formats, boundaries)

| ID          | Title                                              | Priority | Preconditions            | Steps                                                                                   | Expected Result                                                                                          |
|-------------|-------------------------------------------------------|----------|--------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| TC-RV-010   | Missing transactionId                                 | Critical | Valid auth token          | 1. POST with `transactionId` omitted from body                                          | 400 Bad Request; body contains `{valid: false, reasons: ["transactionId is required"]}`                   |
| TC-RV-011   | Missing refundAmount                                  | Critical | Valid auth token          | 1. POST with `refundAmount` omitted                                                     | 400 Bad Request; reasons include "refundAmount is required"                                               |
| TC-RV-012   | Missing currency                                      | Critical | Valid auth token          | 1. POST with `currency` omitted                                                         | 400 Bad Request; reasons include "currency is required"                                                   |
| TC-RV-013   | Missing reason                                        | High     | Valid auth token          | 1. POST with `reason` omitted                                                           | 400 Bad Request; reasons include "reason is required"                                                     |
| TC-RV-014   | Missing requestedBy                                   | High     | Valid auth token          | 1. POST with `requestedBy` omitted                                                      | 400 Bad Request; reasons include "requestedBy is required"                                                |
| TC-RV-015   | Empty request body                                    | Critical | Valid auth token          | 1. POST with empty JSON `{}`                                                            | 400 Bad Request; reasons list all required fields                                                         |
| TC-RV-016   | Null request body                                     | High     | Valid auth token          | 1. POST with no body / null content                                                     | 400 Bad Request; descriptive error message                                                                |
| TC-RV-017   | Invalid transactionId format                          | High     | Valid auth token          | 1. POST with `transactionId: "!!!invalid!!!"`                                           | 400 Bad Request; reasons include "transactionId format is invalid"                                        |
| TC-RV-018   | Negative refundAmount                                 | Critical | Valid auth token          | 1. POST with `refundAmount: -10.00`                                                     | 400 Bad Request; reasons include "refundAmount must be greater than zero"                                 |
| TC-RV-019   | Zero refundAmount                                     | High     | Valid auth token          | 1. POST with `refundAmount: 0.00`                                                       | 400 Bad Request; reasons include "refundAmount must be greater than zero"                                 |
| TC-RV-020   | refundAmount with excessive decimal places            | Medium   | Valid auth token          | 1. POST with `refundAmount: 10.999`                                                     | 400 Bad Request; reasons include "refundAmount must have at most 2 decimal places"                        |
| TC-RV-021   | Unsupported currency code                             | High     | Valid auth token          | 1. POST with `currency: "XYZ"`                                                          | 400 Bad Request; reasons include "currency is not supported"                                              |
| TC-RV-022   | Currency code wrong length                            | Medium   | Valid auth token          | 1. POST with `currency: "US"`                                                           | 400 Bad Request; reasons include "currency must be a valid ISO 4217 code"                                 |
| TC-RV-023   | requestedBy invalid email format                      | Medium   | Valid auth token          | 1. POST with `requestedBy: "not-an-email"`                                              | 400 Bad Request; reasons include "requestedBy must be a valid email"                                      |
| TC-RV-024   | refundAmount exceeds numeric limits (overflow)        | Medium   | Valid auth token          | 1. POST with `refundAmount: 99999999999.99`                                             | 400 Bad Request; reasons include "refundAmount exceeds maximum allowed value"                             |
| TC-RV-025   | Reason field exceeds max length                       | Low      | Valid auth token          | 1. POST with `reason` as 5000-char string                                               | 400 Bad Request; reasons include "reason must not exceed 500 characters"                                  |
| TC-RV-026   | Malformed JSON body                                   | High     | Valid auth token          | 1. POST with `Content-Type: application/json` and body `{invalid json`                  | 400 Bad Request; generic parse error message                                                              |
| TC-RV-027   | Wrong Content-Type header                             | Medium   | Valid auth token          | 1. POST with `Content-Type: text/plain`                                                 | 415 Unsupported Media Type                                                                                |

### 3.3 Business rule validation

| ID          | Title                                              | Priority | Preconditions                                                       | Steps                                                                                   | Expected Result                                                                                          |
|-------------|-------------------------------------------------------|----------|----------------------------------------------------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| TC-RV-030   | Refund amount exceeds original transaction            | Critical | Transaction `TXN-010` has amount $50.00                              | 1. POST with `refundAmount: 75.00` for `TXN-010`                                       | 200 OK; `{valid: false, reasons: ["refundAmount exceeds original transaction amount"]}`                   |
| TC-RV-031   | Refund amount exceeds remaining balance               | Critical | Transaction `TXN-011` ($100) has prior $80 refund                    | 1. POST with `refundAmount: 30.00` for `TXN-011`                                       | 200 OK; `{valid: false, reasons: ["refundAmount exceeds remaining refundable balance of 20.00"]}`         |
| TC-RV-032   | Transaction not found                                 | Critical | No transaction exists for `TXN-MISSING`                              | 1. POST with `transactionId: "TXN-MISSING"`                                            | 200 OK; `{valid: false, reasons: ["transaction not found"]}`                                              |
| TC-RV-033   | Transaction already fully refunded                    | Critical | Transaction `TXN-012` ($50) has $50 prior refund                     | 1. POST with `refundAmount: 10.00` for `TXN-012`                                       | 200 OK; `{valid: false, reasons: ["transaction has already been fully refunded"]}`                        |
| TC-RV-034   | Duplicate refund request detected                     | High     | Identical refund request submitted within last 5 minutes             | 1. POST valid refund 2. POST identical refund within 5 min                              | 200 OK; `{valid: false, reasons: ["duplicate refund request detected"]}`                                  |
| TC-RV-035   | Refund window expired                                 | High     | Transaction `TXN-013` is older than 90 days                          | 1. POST refund for `TXN-013`                                                            | 200 OK; `{valid: false, reasons: ["refund window has expired (90 days)"]}`                                |
| TC-RV-036   | Transaction in non-refundable status                  | High     | Transaction `TXN-014` has status `DISPUTED`                          | 1. POST refund for `TXN-014`                                                            | 200 OK; `{valid: false, reasons: ["transaction status does not allow refunds"]}`                          |
| TC-RV-037   | Currency mismatch with original transaction           | High     | Transaction `TXN-015` was in USD                                     | 1. POST with `currency: "EUR"` for `TXN-015`                                           | 200 OK; `{valid: false, reasons: ["currency does not match original transaction"]}`                       |
| TC-RV-038   | Multiple validation failures returned together        | High     | Transaction `TXN-016` ($50) is expired and disputed                  | 1. POST with `refundAmount: 75.00` for `TXN-016`                                       | 200 OK; `{valid: false, reasons: [...]}` with all applicable reasons listed                               |
| TC-RV-039   | Refund by unauthorized requestor                      | Medium   | `requestedBy` is not linked to the original transaction              | 1. POST with `requestedBy: "unauthorized@disney.com"`                                   | 200 OK; `{valid: false, reasons: ["requestor is not authorized for this transaction"]}`                   |
| TC-RV-040   | Transaction flagged for fraud review                  | High     | Transaction `TXN-017` has fraud flag                                 | 1. POST refund for `TXN-017`                                                            | 200 OK; `{valid: false, reasons: ["transaction is under fraud review"]}`                                  |

### 3.4 Authentication and authorization

| ID          | Title                                              | Priority | Preconditions                      | Steps                                                                                   | Expected Result                                                                                          |
|-------------|-------------------------------------------------------|----------|------------------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| TC-RV-050   | Request without authentication token                  | Critical | No auth header                     | 1. POST valid body without `Authorization` header                                       | 401 Unauthorized; no validation performed                                                                 |
| TC-RV-051   | Request with expired token                            | Critical | Expired JWT token                  | 1. POST with expired Bearer token                                                       | 401 Unauthorized                                                                                          |
| TC-RV-052   | Request with malformed token                          | High     | Invalid string as token            | 1. POST with `Authorization: Bearer invalid.token.here`                                 | 401 Unauthorized                                                                                          |
| TC-RV-053   | Request with insufficient role                        | Critical | Token with `ROLE_VIEWER` only      | 1. POST with viewer-only token                                                          | 403 Forbidden                                                                                             |
| TC-RV-054   | Request with valid refund-agent role                  | Critical | Token with `ROLE_REFUND_AGENT`     | 1. POST valid refund request                                                            | 200 OK; validation proceeds normally                                                                      |
| TC-RV-055   | Request with admin role                               | High     | Token with `ROLE_ADMIN`            | 1. POST valid refund request                                                            | 200 OK; validation proceeds normally                                                                      |
| TC-RV-056   | Token from wrong issuer                               | High     | JWT signed by unknown issuer       | 1. POST with foreign JWT                                                                | 401 Unauthorized                                                                                          |
| TC-RV-057   | Token with tampered payload                           | High     | Modified JWT payload, valid header | 1. POST with tampered token                                                             | 401 Unauthorized                                                                                          |

### 3.5 Error handling and edge cases

| ID          | Title                                              | Priority | Preconditions                                | Steps                                                                                   | Expected Result                                                                                          |
|-------------|-------------------------------------------------------|----------|----------------------------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| TC-RV-060   | Transaction service unavailable (downstream timeout)  | High     | Transaction service returns 503 / times out  | 1. POST valid refund request                                                            | 503 Service Unavailable; body `{error: "unable to validate at this time"}`                                |
| TC-RV-061   | Database connection failure                           | High     | Database unreachable                         | 1. POST valid refund request                                                            | 503 Service Unavailable; graceful error                                                                   |
| TC-RV-062   | Concurrent requests for same transaction              | High     | Two threads submit simultaneously            | 1. POST two identical requests concurrently for `TXN-020`                               | Both return consistent results; no data corruption                                                        |
| TC-RV-063   | Request with extra/unknown fields                     | Low      | Valid auth token                             | 1. POST with additional field `unknownField: "foo"`                                     | 200 OK; unknown fields ignored; validation proceeds                                                       |
| TC-RV-064   | Very large request body (payload bomb)                | Medium   | Valid auth token                             | 1. POST with 10MB JSON body                                                             | 413 Payload Too Large or 400 Bad Request; server does not crash                                           |
| TC-RV-065   | SQL injection in transactionId                        | High     | Valid auth token                             | 1. POST with `transactionId: "'; DROP TABLE transactions; --"`                          | 400 Bad Request or 200 with `valid: false`; no SQL executed                                               |
| TC-RV-066   | XSS payload in reason field                           | Medium   | Valid auth token                             | 1. POST with `reason: "<script>alert('xss')</script>"`                                  | Input sanitized or rejected; no script reflected in response                                              |
| TC-RV-067   | Unicode/special characters in reason                  | Low      | Valid auth token                             | 1. POST with `reason: "客户退款请求 — émojis 🎉"`                                       | 200 OK; characters handled gracefully                                                                     |
| TC-RV-068   | HTTP method not allowed (GET instead of POST)         | Medium   | Valid auth token                             | 1. GET `/api/v1/refunds/validate`                                                       | 405 Method Not Allowed                                                                                    |
| TC-RV-069   | Rate limiting (too many requests)                     | Medium   | Valid auth token; rate limit threshold hit   | 1. POST 100 requests in 1 second                                                       | 429 Too Many Requests after threshold; includes `Retry-After` header                                      |
| TC-RV-070   | Idempotent response for identical valid request       | Medium   | Same valid request sent twice, 10 sec apart  | 1. POST valid request 2. POST same request again                                        | Both return 200 OK with `valid: true`; no side effects                                                    |

### 3.6 Performance / load considerations

| ID          | Title                                              | Priority | Preconditions                                  | Steps                                                                                   | Expected Result                                                                                          |
|-------------|-------------------------------------------------------|----------|------------------------------------------------|-----------------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------|
| TC-RV-080   | Response time under normal load                       | High     | Service under < 50 concurrent users            | 1. POST valid request 2. Measure response time                                          | P95 response time < 200ms                                                                                |
| TC-RV-081   | Response time under peak load                         | High     | Service under 500 concurrent users             | 1. Run 500 concurrent valid requests 2. Measure response times                          | P95 response time < 500ms; no 5xx errors                                                                 |
| TC-RV-082   | Sustained throughput                                  | Medium   | 10-minute sustained load at 200 req/s          | 1. Run load test for 10 minutes 2. Monitor error rate                                   | Error rate < 0.1%; no memory leaks; stable response times                                                |
| TC-RV-083   | Graceful degradation under overload                   | Medium   | Load exceeds capacity (2000 req/s)             | 1. Ramp to 2000 req/s 2. Monitor behavior                                              | Service returns 429/503 gracefully; no crashes; recovers when load decreases                              |
| TC-RV-084   | Connection pool exhaustion recovery                   | Low      | All DB connections consumed                    | 1. Exhaust connection pool 2. Release connections 3. Send new request                   | Service recovers and processes requests after connections freed                                            |

---

## 4. Test environment and data requirements

### Environment

| Component           | Specification                                                   |
|---------------------|-----------------------------------------------------------------|
| Application server  | Spring Boot 3.x on JDK 17+ (containerized via Docker)          |
| Database            | MariaDB 10.6+ (Testcontainers for integration; H2 for unit)    |
| Auth provider       | Keycloak / OAuth2 mock (WireMock for contract tests)            |
| CI/CD               | Jenkins / GitHub Actions pipeline                               |
| Load test tool      | Gatling or k6                                                   |
| Environment         | Staging (isolated from production data)                         |

### Test data

| Data Set                  | Description                                                                      |
|---------------------------|----------------------------------------------------------------------------------|
| Valid transactions         | 10+ transactions in various states (completed, partially refunded, disputed)     |
| Expired transactions       | Transactions older than 90 days                                                  |
| Fully refunded             | Transactions with refund total equal to original amount                           |
| Fraud-flagged              | Transactions marked for fraud review                                             |
| Multi-currency             | Transactions in USD, EUR, GBP, JPY                                               |
| High-value transactions    | Transactions at upper boundary of allowed amounts                                |
| Duplicate refund records   | Pre-seeded recent refund requests for duplicate detection tests                   |

### Data management

- Use database seeding scripts (Flyway/Liquibase migrations for schema, SQL scripts for test data)
- Reset test data before each test suite run
- No shared mutable state between test cases

---

## 5. Entry / exit criteria

### Entry criteria

- Code complete for the endpoint and merged to feature branch
- Unit tests passing in CI (> 90% coverage on validation logic)
- API contract documented (OpenAPI spec available)
- Staging environment provisioned and accessible
- Test data seeded and verified
- Authentication/authorization configured

### Exit criteria

- All Critical and High priority test cases pass
- No open P0/P1 defects
- Code coverage ≥ 90% on service/validation layer
- P95 response time < 200ms under normal load
- Security scan (OWASP ZAP) shows no high/critical findings
- Contract tests pass with current consumer expectations
- All test results documented and traceable

---

## 6. Risks and mitigations

| Risk                                                  | Likelihood | Impact   | Mitigation                                                                          |
|-------------------------------------------------------|:----------:|:--------:|--------------------------------------------------------------------------------------|
| Transaction service dependency unavailable in staging | Medium     | High     | Use WireMock stubs for isolation; add circuit breaker tests                          |
| Test data drift (stale/inconsistent seed data)        | Medium     | Medium   | Automated data seeding in CI; verify data preconditions in test setup                |
| Business rules change during testing                  | Low        | High     | Parameterize test expectations; maintain rules in config; close collaboration with PO |
| Rate limiting interferes with load tests              | Medium     | Low      | Disable or raise rate limits in staging; document baseline thresholds                |
| Auth provider outage blocks all testing               | Low        | High     | Mock auth for unit/integration; real auth only for E2E security tests                |
| Duplicate detection logic has race conditions         | Medium     | High     | Add concurrency tests (TC-RV-062); verify idempotency with thread safety review      |
| Currency validation rules differ by region            | Low        | Medium   | Parameterize currency lists; test all supported currencies explicitly                |
| Payload size limits not enforced at gateway           | Low        | Medium   | Verify at both gateway and application layer; add TC-RV-064 specifically             |

---

## Appendix: Request / response contract

### Request

```json
{
  "transactionId": "TXN-001",
  "refundAmount": 50.00,
  "currency": "USD",
  "reason": "customer_request",
  "requestedBy": "agent@disney.com"
}
```

### Response (valid)

```json
{
  "valid": true,
  "reasons": []
}
```

### Response (invalid)

```json
{
  "valid": false,
  "reasons": [
    "refundAmount exceeds original transaction amount",
    "refund window has expired (90 days)"
  ]
}
```

### Response (error)

```json
{
  "error": "unable to validate at this time",
  "code": "SERVICE_UNAVAILABLE"
}
```
