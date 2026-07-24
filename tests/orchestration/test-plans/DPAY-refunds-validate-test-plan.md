# Test Plan: POST /api/v1/refunds/validate

**Project:** DPAY — Adaptive Payment Platform
**Service:** Payment Services (Spring Boot / Java)
**Endpoint:** `POST /api/v1/refunds/validate`
**Author:** QA Engineering
**Date:** 2026-07-24
**Related tickets:** DPAY-14500 (legacy HTTP status code bug)

---

## 1. Scope

### In scope

- Request payload validation (field presence, format, types)
- HTTP status code correctness for all response scenarios (critical — lesson from DPAY-14500)
- Business rule validation (amount limits, refund windows, transaction state)
- `RLX_AUTH_AMT_CHECK` flag bypass behavior for configured clients
- Partial refund vs full refund validation logic
- Multi-currency handling (USD for WDW/DLR/DCL, EUR for DLP)
- Authentication and authorization enforcement
- Concurrent request handling for the same transaction
- Rate limiting and abuse prevention
- Integration with upstream payment/transaction lookup services
- Error response body structure and messaging
- Contract compatibility with downstream consumers

### Out of scope

- Actual refund processing (this endpoint only validates)
- Payment gateway integration (no funds movement)
- UI/client-side validation (handled by Payment Sheet / Config Studio)
- Load testing at scale (covered by separate performance test plan)
- Database migration testing
- Legacy `SharedPayment.java` endpoint behavior (deprecated)

---

## 2. Test strategy

### Unit tests

- **Scope:** Controller, service, validator, and mapper classes
- **Framework:** JUnit 5 + Mockito
- **Coverage target:** 90%+ line coverage on validation logic
- **Focus areas:**
  - Request DTO validation annotations (`@NotNull`, `@Pattern`, etc.)
  - `RefundValidationService` business rule logic
  - `RLX_AUTH_AMT_CHECK` flag evaluation
  - Currency validation and amount precision
  - HTTP status code mapping in controller (verify NO blanket `Response.ok()`)

### Integration tests

- **Scope:** Controller → Service → Repository with embedded dependencies
- **Framework:** Spring Boot Test (`@SpringBootTest`) + Testcontainers for DynamoDB/MariaDB
- **Focus areas:**
  - Full request lifecycle through Spring MVC
  - Transaction lookup against data store
  - Configuration flag retrieval (`RLX_AUTH_AMT_CHECK`)
  - Error propagation and HTTP status mapping end-to-end

### Contract tests

- **Scope:** API contract stability for consumers (Payment Controls API, Payment Sheet API)
- **Framework:** Spring Cloud Contract or Pact
- **Focus areas:**
  - Request schema (field names, types, required/optional)
  - Response schema per status code
  - Error response structure consistency

### End-to-end tests

- **Scope:** Full service deployed in Latest/Stage environment
- **Framework:** REST Assured or Bruno collection
- **Focus areas:**
  - Real authentication tokens (Keystone)
  - Real transaction data in test environment
  - Multi-park currency scenarios
  - Concurrent request behavior under realistic conditions

---

## 3. Test environment requirements

| Component                | Requirement                                                        |
|--------------------------|--------------------------------------------------------------------|
| Java version             | Java 21 (match production)                                         |
| Spring Boot              | Current production version                                         |
| Database                 | DynamoDB Local or Testcontainers (unit/integration); Latest RDS (E2E) |
| Auth                     | Keystone test tokens (Latest environment)                          |
| Config service           | Mock for unit tests; real Latest instance for E2E                   |
| Transaction test data    | Pre-seeded transactions: paid, partially refunded, fully refunded, cancelled |
| VPN                      | Required for Latest/Stage environment access                       |
| Feature flags            | Ability to toggle `RLX_AUTH_AMT_CHECK` per test                    |
| Monitoring               | Splunk access for error rate verification post-deploy              |

### Test data requirements

| Data type                     | Details                                                 |
|-------------------------------|---------------------------------------------------------|
| Valid paid transaction        | $100.00 USD, WDW, status=COMPLETED                     |
| Partially refunded txn        | $100.00 original, $30.00 already refunded               |
| Fully refunded txn            | $50.00 original, $50.00 refunded                        |
| Cancelled transaction         | Status=CANCELLED, no refund eligible                    |
| DLP transaction (EUR)         | €75.00 EUR, DLP park context                            |
| RLX-configured client         | Client ID with `RLX_AUTH_AMT_CHECK=true`                |
| Standard client               | Client ID with `RLX_AUTH_AMT_CHECK=false` (default)     |
| Expired refund window txn     | Transaction older than refund policy window             |

---

## 4. Test cases

### 4.1 Happy path

| Test ID       | Title                                                 | Priority | Type        | Preconditions                                        | Steps                                                                                                                                         | Expected Result                                                                                     |
|---------------|-------------------------------------------------------|----------|-------------|------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| TC-RV-001     | Validate full refund for completed transaction        | Critical | Functional  | Transaction $100.00 USD exists, status=COMPLETED     | 1. POST `/api/v1/refunds/validate` with `transactionId`, `refundAmount: 100.00`, `currency: USD`, `reason: CUSTOMER_REQUEST`, `requestedBy: operator1` | HTTP 200, body contains `{ "eligible": true, "validationStatus": "PASSED" }`                       |
| TC-RV-002     | Validate partial refund for completed transaction     | Critical | Functional  | Transaction $100.00 USD exists, status=COMPLETED     | 1. POST with `refundAmount: 45.50`, other fields valid                                                                                        | HTTP 200, body confirms eligibility with remaining refundable amount                                |
| TC-RV-003     | Validate refund for partially refunded transaction    | High     | Functional  | Transaction $100.00, $30.00 already refunded         | 1. POST with `refundAmount: 70.00` (remaining balance)                                                                                        | HTTP 200, validation passed                                                                         |
| TC-RV-004     | Validate refund with EUR currency (DLP)               | High     | Functional  | DLP transaction €75.00 EUR exists, status=COMPLETED  | 1. POST with `refundAmount: 75.00`, `currency: EUR`                                                                                           | HTTP 200, validation passed                                                                         |
| TC-RV-005     | Validate refund with RLX_AUTH_AMT_CHECK enabled       | Critical | Functional  | RLX client configured, transaction $100.00           | 1. POST with `refundAmount: 150.00` (exceeds original) from RLX-configured client                                                             | HTTP 200, validation passed (amount check bypassed)                                                 |

### 4.2 Input validation (HTTP 400)

| Test ID       | Title                                                 | Priority | Type        | Preconditions         | Steps                                                       | Expected Result                                                                                   |
|---------------|-------------------------------------------------------|----------|-------------|-----------------------|-------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| TC-RV-010     | Missing transactionId field                           | Critical | Functional  | Auth token valid      | 1. POST with body missing `transactionId`                   | HTTP 400, error body: `{ "field": "transactionId", "message": "required" }`                       |
| TC-RV-011     | Missing refundAmount field                            | Critical | Functional  | Auth token valid      | 1. POST with body missing `refundAmount`                    | HTTP 400, error identifies missing field                                                          |
| TC-RV-012     | Missing currency field                                | High     | Functional  | Auth token valid      | 1. POST with body missing `currency`                        | HTTP 400, error identifies missing field                                                          |
| TC-RV-013     | Missing reason field                                  | High     | Functional  | Auth token valid      | 1. POST with body missing `reason`                          | HTTP 400, error identifies missing field                                                          |
| TC-RV-014     | Missing requestedBy field                             | High     | Functional  | Auth token valid      | 1. POST with body missing `requestedBy`                     | HTTP 400, error identifies missing field                                                          |
| TC-RV-015     | Empty request body                                    | High     | Functional  | Auth token valid      | 1. POST with empty JSON `{}`                                | HTTP 400, error lists all required fields                                                         |
| TC-RV-016     | Null request body                                     | Medium   | Functional  | Auth token valid      | 1. POST with no body / null content                         | HTTP 400, error indicates missing request body                                                    |
| TC-RV-017     | Invalid currency code (non-ISO 4217)                  | High     | Functional  | Auth token valid      | 1. POST with `currency: "FAKE"`                             | HTTP 400, error: invalid currency code                                                            |
| TC-RV-018     | Negative refund amount                                | Critical | Functional  | Auth token valid      | 1. POST with `refundAmount: -10.00`                         | HTTP 400, error: amount must be positive                                                          |
| TC-RV-019     | Zero refund amount                                    | High     | Functional  | Auth token valid      | 1. POST with `refundAmount: 0.00`                           | HTTP 400, error: amount must be greater than zero                                                 |
| TC-RV-020     | Refund amount with excessive decimal places           | Medium   | Functional  | Auth token valid      | 1. POST with `refundAmount: 10.999`                         | HTTP 400, error: amount precision exceeds 2 decimal places                                        |
| TC-RV-021     | Non-numeric refund amount                             | High     | Functional  | Auth token valid      | 1. POST with `refundAmount: "abc"`                          | HTTP 400, error: invalid type for refundAmount                                                    |
| TC-RV-022     | TransactionId with invalid format                     | Medium   | Functional  | Auth token valid      | 1. POST with `transactionId: ""`  (empty string)            | HTTP 400, error: transactionId cannot be blank                                                    |
| TC-RV-023     | Malformed JSON body                                   | Medium   | Functional  | Auth token valid      | 1. POST with invalid JSON `{transactionId: broken`          | HTTP 400, error: malformed request body                                                           |
| TC-RV-024     | Extremely large refund amount (overflow)              | Medium   | Functional  | Auth token valid      | 1. POST with `refundAmount: 99999999999999.99`              | HTTP 400, error: amount exceeds maximum allowed value                                             |

### 4.3 Business rules (HTTP 404, 409, 422)

| Test ID       | Title                                                          | Priority | Type        | Preconditions                                               | Steps                                                                    | Expected Result                                                                                     |
|---------------|----------------------------------------------------------------|----------|-------------|-------------------------------------------------------------|--------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| TC-RV-030     | Transaction not found                                          | Critical | Functional  | TransactionId does not exist in system                      | 1. POST with valid format but non-existent `transactionId`               | HTTP 404, error: original transaction not found                                                     |
| TC-RV-031     | Refund exceeds original amount (standard client)               | Critical | Functional  | Transaction $100.00, no prior refunds, standard client      | 1. POST with `refundAmount: 150.00`                                      | HTTP 422, error: refund amount exceeds original transaction amount                                  |
| TC-RV-032     | Refund exceeds remaining balance after partial refund          | Critical | Functional  | Transaction $100.00, $30.00 already refunded                | 1. POST with `refundAmount: 80.00` (only $70.00 remaining)              | HTTP 422, error: refund amount exceeds remaining refundable balance                                 |
| TC-RV-033     | Transaction already fully refunded                             | High     | Functional  | Transaction $50.00, fully refunded                          | 1. POST with `refundAmount: 10.00`                                       | HTTP 409, error: transaction already fully refunded                                                 |
| TC-RV-034     | Transaction in cancelled state                                 | High     | Functional  | Transaction status=CANCELLED                                | 1. POST with valid refund amount                                         | HTTP 409, error: transaction in invalid state for refund                                            |
| TC-RV-035     | Transaction in pending state                                   | High     | Functional  | Transaction status=PENDING                                  | 1. POST with valid refund amount                                         | HTTP 409, error: transaction not yet completed                                                      |
| TC-RV-036     | Refund outside policy window                                   | High     | Functional  | Transaction completed 400 days ago, policy=365 days         | 1. POST with valid refund amount                                         | HTTP 422, error: refund window expired                                                              |
| TC-RV-037     | Currency mismatch with original transaction                    | High     | Functional  | Transaction in USD                                          | 1. POST with `currency: EUR`                                             | HTTP 422, error: currency does not match original transaction                                       |
| TC-RV-038     | Duplicate refund in progress (concurrent)                      | High     | Functional  | Active refund request exists for same transaction           | 1. POST with same transactionId while another refund is processing       | HTTP 409, error: refund already in progress for this transaction                                    |
| TC-RV-039     | Invalid reason code                                            | Medium   | Functional  | Auth token valid, transaction exists                        | 1. POST with `reason: "INVALID_CODE"`                                    | HTTP 422, error: invalid refund reason code                                                         |
| TC-RV-040     | RLX_AUTH_AMT_CHECK bypass — amount exceeds original            | Critical | Functional  | RLX client, transaction $100.00                             | 1. POST with `refundAmount: 200.00` from RLX-enabled client              | HTTP 200, validation passed (amount check relaxed)                                                  |
| TC-RV-041     | RLX_AUTH_AMT_CHECK disabled — amount exceeds original          | Critical | Functional  | Standard client (flag=false), transaction $100.00           | 1. POST with `refundAmount: 200.00` from standard client                 | HTTP 422, error: refund amount exceeds original                                                     |
| TC-RV-042     | RLX_AUTH_AMT_CHECK bypass still enforces zero/negative amount  | High     | Functional  | RLX client configured                                      | 1. POST with `refundAmount: -5.00` from RLX-enabled client               | HTTP 400, error: amount must be positive (input validation not bypassed)                            |
| TC-RV-043     | Transaction with chargeback — refund not eligible              | Medium   | Functional  | Transaction has active chargeback                           | 1. POST with valid refund amount                                         | HTTP 409, error: transaction has active chargeback                                                  |

### 4.4 HTTP status code regression (DPAY-14500)

| Test ID       | Title                                                                | Priority | Type       | Preconditions                                    | Steps                                                                                                  | Expected Result                                                                                |
|---------------|----------------------------------------------------------------------|----------|------------|--------------------------------------------------|--------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------|
| TC-RV-050     | Validation failure returns non-200 status (not legacy pattern)       | Critical | Regression | Transaction exists, standard client              | 1. POST with `refundAmount` exceeding original 2. Verify HTTP status code in response                  | HTTP 422 (NOT 200). Body contains error detail. Confirms DPAY-14500 fix.                       |
| TC-RV-051     | Missing field returns 400 (not 200 with error in body)               | Critical | Regression | Auth token valid                                 | 1. POST with missing required field 2. Verify HTTP status code                                         | HTTP 400 (NOT 200). Confirms endpoint does not follow SharedPayment.java pattern.              |
| TC-RV-052     | Not-found transaction returns 404 (not 200 with error in body)       | Critical | Regression | Non-existent transactionId                       | 1. POST with non-existent transactionId 2. Verify HTTP status code                                    | HTTP 404 (NOT 200). Body has structured error.                                                 |
| TC-RV-053     | Conflict state returns 409 (not 200 with error in body)              | Critical | Regression | Fully refunded transaction                       | 1. POST against fully refunded txn 2. Verify HTTP status code                                         | HTTP 409 (NOT 200). Body has structured error.                                                 |
| TC-RV-054     | Successful validation returns 200 with explicit success payload      | High     | Regression | Valid transaction, valid amounts                  | 1. POST with all valid fields 2. Verify HTTP 200 AND body contains positive eligibility confirmation   | HTTP 200 with `eligible: true`. Success is explicitly stated, not inferred from absence of error. |

### 4.5 Security

| Test ID       | Title                                               | Priority | Type     | Preconditions                        | Steps                                                                          | Expected Result                                                     |
|---------------|-----------------------------------------------------|----------|----------|--------------------------------------|--------------------------------------------------------------------------------|---------------------------------------------------------------------|
| TC-RV-060     | Request without auth token                          | Critical | Security | No auth header                       | 1. POST without `Authorization` header                                         | HTTP 401 Unauthorized                                               |
| TC-RV-061     | Request with expired auth token                     | High     | Security | Expired Keystone token               | 1. POST with expired token                                                     | HTTP 401 Unauthorized                                               |
| TC-RV-062     | Request with insufficient permissions               | High     | Security | Token without refund-validate scope  | 1. POST with valid token missing required role/scope                            | HTTP 403 Forbidden                                                  |
| TC-RV-063     | SQL injection in transactionId                      | High     | Security | Auth token valid                     | 1. POST with `transactionId: "'; DROP TABLE transactions; --"`                 | HTTP 400 or 404, no SQL execution                                   |
| TC-RV-064     | XSS payload in reason field                         | Medium   | Security | Auth token valid                     | 1. POST with `reason: "<script>alert('xss')</script>"`                         | HTTP 400 or 422, payload sanitized/rejected in response             |
| TC-RV-065     | Oversized request body (DoS attempt)                | Medium   | Security | Auth token valid                     | 1. POST with 10MB request body                                                 | HTTP 413 or 400, request rejected before full processing            |
| TC-RV-066     | Rate limiting — excessive requests from single client| High     | Security | Auth token valid                     | 1. Send 1000 requests in 10 seconds from same client                           | HTTP 429 Too Many Requests after threshold exceeded                 |
| TC-RV-067     | Cross-tenant transaction access                     | Critical | Security | Token for Client A, transaction belongs to Client B | 1. POST with transactionId belonging to different client                 | HTTP 403 or 404 (do not leak existence of other client's data)      |

### 4.6 Performance

| Test ID       | Title                                                     | Priority | Type        | Preconditions                    | Steps                                                               | Expected Result                                  |
|---------------|-----------------------------------------------------------|----------|-------------|----------------------------------|---------------------------------------------------------------------|--------------------------------------------------|
| TC-RV-070     | Response time under 500ms for valid request               | High     | Performance | Transaction exists, system idle  | 1. POST with valid payload 2. Measure response time                 | Response time < 500ms (p95)                      |
| TC-RV-071     | Response time under 200ms for input validation failure    | Medium   | Performance | Auth token valid                 | 1. POST with missing field 2. Measure response time                 | Response time < 200ms (input validation is fast) |
| TC-RV-072     | Concurrent validation requests — 50 simultaneous          | High     | Performance | 50 unique transactions exist     | 1. Fire 50 concurrent POST requests for different transactions      | All return correct status, no errors, < 1s p99   |
| TC-RV-073     | Concurrent requests for same transaction — idempotent     | High     | Performance | Single transaction exists        | 1. Fire 10 concurrent POST requests for same transactionId          | All return same result, no race condition errors  |

### 4.7 Edge cases

| Test ID       | Title                                                          | Priority | Type       | Preconditions                                          | Steps                                                                       | Expected Result                                                          |
|---------------|----------------------------------------------------------------|----------|------------|--------------------------------------------------------|-----------------------------------------------------------------------------|--------------------------------------------------------------------------|
| TC-RV-080     | Refund amount equals exactly remaining balance (boundary)      | High     | Functional | Transaction $100.00, $99.99 already refunded           | 1. POST with `refundAmount: 0.01`                                           | HTTP 200, validation passed (exact boundary)                             |
| TC-RV-081     | Refund amount is $0.01 (minimum)                               | Medium   | Functional | Transaction exists, status=COMPLETED                   | 1. POST with `refundAmount: 0.01`                                           | HTTP 200, validation passed                                              |
| TC-RV-082     | Very old transaction within refund window (boundary day)       | Medium   | Functional | Transaction completed exactly 365 days ago (policy=365)| 1. POST with valid refund amount                                            | HTTP 200, validation passed (inclusive boundary)                         |
| TC-RV-083     | Very old transaction outside refund window (boundary + 1 day)  | Medium   | Functional | Transaction completed 366 days ago (policy=365)        | 1. POST with valid refund amount                                            | HTTP 422, refund window expired                                          |
| TC-RV-084     | Unicode characters in reason field                             | Low      | Functional | Auth token valid, transaction exists                   | 1. POST with `reason` containing Unicode (e.g., "客户请求退款")              | HTTP 200 or 422 depending on allowed reason codes; no server error       |
| TC-RV-085     | TransactionId with maximum allowed length                      | Low      | Functional | Auth token valid                                       | 1. POST with transactionId at max char limit                                | Processed normally (200/404 depending on existence)                      |
| TC-RV-086     | Multiple validation calls for same transaction (idempotent)    | High     | Functional | Transaction exists, valid request                      | 1. POST valid request 2. POST same request again immediately                | Both return HTTP 200 (validate is read-only, idempotent)                 |
| TC-RV-087     | JPY currency — zero decimal handling                           | Medium   | Functional | Transaction in JPY (zero-decimal currency)             | 1. POST with `refundAmount: 1000`, `currency: JPY`                          | HTTP 200, amount handled correctly without decimal places                |
| TC-RV-088     | Upstream payment service timeout                               | High     | Integration| Transaction lookup service artificially delayed        | 1. POST valid request when upstream is slow (>5s)                           | HTTP 500 or 504 with timeout error, graceful failure                     |
| TC-RV-089     | Upstream payment service unavailable                           | High     | Integration| Transaction lookup service down                        | 1. POST valid request when upstream is unreachable                           | HTTP 503 Service Unavailable, circuit breaker engaged                    |
| TC-RV-090     | Request with extra/unknown fields in body                      | Low      | Functional | Auth token valid                                       | 1. POST with valid fields plus `"extraField": "value"`                      | Extra fields ignored, validation proceeds normally on known fields        |

---

## 5. Entry / exit criteria

### Entry criteria

- Code complete for `POST /api/v1/refunds/validate` endpoint
- Unit tests written and passing locally
- Endpoint deployed to Latest environment
- Test data seeded (transactions in various states)
- Keystone test credentials available
- `RLX_AUTH_AMT_CHECK` flag configurable in test environment
- CI/CD pipeline green (build + existing tests pass)
- API contract documentation (OpenAPI/Swagger) reviewed

### Exit criteria

- All Critical priority test cases pass (100%)
- All High priority test cases pass (≥95%)
- Medium/Low priority: ≥90% pass rate
- No open P0/P1 defects
- Code coverage ≥ 90% on validation logic
- Performance benchmarks met (p95 < 500ms)
- Security tests pass (no injection vulnerabilities)
- DPAY-14500 regression tests all pass (HTTP status code correctness confirmed)
- Contract tests pass against known consumers
- Splunk error rate < 1% for 15 minutes post-deploy to Stage

---

## 6. Risks and mitigations

| Risk                                                              | Impact | Probability | Mitigation                                                                                              |
|-------------------------------------------------------------------|--------|-------------|---------------------------------------------------------------------------------------------------------|
| Legacy `Response.ok()` pattern reintroduced                       | High   | Medium      | Unit test assertions on HTTP status codes; code review checklist item; TC-RV-050 through TC-RV-054      |
| `RLX_AUTH_AMT_CHECK` flag misconfigured in production             | High   | Medium      | Dedicated test cases (TC-RV-040/041/042); config validation in deployment pipeline                      |
| Upstream payment service degradation causes cascading failures    | High   | Medium      | Circuit breaker pattern; timeout tests (TC-RV-088/089); Splunk alerting                                 |
| Currency precision errors (JPY zero-decimal, EUR 2-decimal)       | Medium | Low         | Explicit currency handling tests; use `BigDecimal` not `double`                                         |
| Race condition on concurrent refund validation                    | Medium | Low         | Concurrency tests (TC-RV-073); validate is read-only so risk is lower than execute                      |
| Test data pollution across test runs                              | Medium | Medium      | Isolated test transactions per run; teardown in `@AfterEach`; Testcontainers for integration tests      |
| Rate limiting blocks legitimate test execution                    | Low    | Medium      | Use dedicated test client credentials with higher rate limits; reset counters between test runs          |
| Connection pool exhaustion (BAPP0012692 known issue)              | High   | Low         | Monitor connection pool during perf tests; verify pool config preserved post-deploy (per incident docs) |
| Multi-park routing misconfiguration                               | Medium | Low         | Test with WDW (USD), DLR (USD), DCL (USD), DLP (EUR) transactions explicitly                           |

---

## Appendix: Response body contracts

### Success (HTTP 200)

```json
{
  "eligible": true,
  "validationStatus": "PASSED",
  "transactionId": "TXN-12345",
  "refundableAmount": 100.00,
  "remainingBalance": 0.00,
  "currency": "USD"
}
```

### Error (HTTP 4xx)

```json
{
  "error": {
    "code": "REFUND_EXCEEDS_BALANCE",
    "message": "Refund amount exceeds remaining refundable balance",
    "field": "refundAmount",
    "details": {
      "requestedAmount": 80.00,
      "remainingBalance": 70.00,
      "currency": "USD"
    }
  }
}
```

---

## Appendix: RLX_AUTH_AMT_CHECK decision matrix

| Client flag value | Refund > Original | Expected result                          |
|-------------------|-------------------|------------------------------------------|
| `true` (relaxed)  | Yes               | HTTP 200 — amount check bypassed         |
| `true` (relaxed)  | No                | HTTP 200 — normal validation             |
| `false` (default) | Yes               | HTTP 422 — exceeds original amount       |
| `false` (default) | No                | HTTP 200 — normal validation             |
| `true` (relaxed)  | Negative amount   | HTTP 400 — input validation NOT bypassed |
| `true` (relaxed)  | Zero amount       | HTTP 400 — input validation NOT bypassed |

> **Key principle:** `RLX_AUTH_AMT_CHECK` relaxes business rules (amount ceiling) but NEVER bypasses input validation (format, sign, presence).
