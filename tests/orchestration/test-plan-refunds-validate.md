# Test Plan: POST /api/v1/refunds/validate

**Project:** DPAY — Adaptive Payment Platform
**Service:** Payment Services (Spring Boot 3.5, Java 21)
**Endpoint:** `POST /api/v1/refunds/validate`
**Author:** QA Automation
**Created:** 2026-07-24
**Version:** 1.0

---

## 1. Scope

### In scope

- Request payload validation (field presence, format, types)
- Business rule validation (refund eligibility, amount limits, policy checks)
- HTTP status code contract (200, 400, 422, 401, 403, 500)
- Authentication and authorization enforcement
- Integration with downstream services (payment gateway, transaction store)
- Performance under expected and peak load
- Regression coverage for DPAY-14500 (incorrect 200 on validation failure)
- RLX_AUTH_AMT_CHECK flag bypass behavior
- Connection pool behavior under sustained load (INC0067890)

### Out of scope

- Actual refund execution (covered by `POST /api/v1/refunds`)
- UI/frontend integration (covered by Payment Sheet E2E suite)
- Payment gateway internals (third-party system)
- Database schema migrations (covered by Liquibase/Flyway pipeline)
- Mobile SDK integration (covered by dpay-android-ui / dpayios suites)

---

## 2. Test strategy

| Layer        | Framework                  | Responsibility                                  | Coverage target |
|--------------|----------------------------|-------------------------------------------------|:---------------:|
| Unit         | JUnit 5 + Mockito          | Controller, Facade, Helper, Validator logic     |      90%+       |
| Integration  | Spring Boot Test + Testcontainers | DB queries, downstream HTTP calls, config flags |      80%+       |
| E2E          | Bruno collection + CI runner | Full request lifecycle against Latest env       |      Critical paths |
| Performance  | Gatling / k6               | Latency p95, throughput, connection pool stress  |      p95 < 200ms |

### Unit tests

- Validate each layer in isolation with mocked dependencies.
- Cover all branching logic in validators and helpers.
- Verify correct exception types propagate for each error category.

### Integration tests

- Use Testcontainers for MariaDB and DynamoDB Local.
- Wire real HTTP clients with WireMock for downstream payment gateway.
- Verify transactional behavior and connection pool lifecycle.

### E2E tests

- Execute against the Latest environment post-deploy.
- Validate full request → response contract including headers.
- Run as Harness smoke step after deployment.

### Performance tests

- Sustained load: 500 RPS for 10 minutes.
- Spike load: 2000 RPS burst for 30 seconds.
- Soak test: 200 RPS for 2 hours (connection pool leak detection).

---

## 3. Test categories and cases

### 3.1 Happy path scenarios

| #    | Test case                                                        | Method | Expected status | Key assertions                                                         |
|:----:|------------------------------------------------------------------|--------|:---------------:|------------------------------------------------------------------------|
| HP-1 | Valid refund validation — full amount, credit card                | POST   |       200       | Body contains `eligible: true`, `validationId` is UUID                 |
| HP-2 | Valid refund validation — partial amount, debit card              | POST   |       200       | `eligible: true`, `maxRefundableAmount` >= requested amount            |
| HP-3 | Valid refund validation — minimum allowed amount ($0.01)          | POST   |       200       | `eligible: true`, no warnings                                          |
| HP-4 | Valid refund validation — maximum transaction amount              | POST   |       200       | `eligible: true`, `validationId` present                               |
| HP-5 | Valid refund validation — gift card payment method                | POST   |       200       | `eligible: true`, `refundMethod: GIFT_CARD`                            |
| HP-6 | Valid refund validation — multi-tender split payment              | POST   |       200       | `eligible: true`, `allocations` array has entries per tender           |
| HP-7 | Valid refund validation with RLX_AUTH_AMT_CHECK enabled           | POST   |       200       | `eligible: true`, `authAmountVerified: true`                           |

### 3.2 Request validation — 400 Bad Request

| #     | Test case                                                       | Payload defect                                 | Expected status | Key assertions                                         |
|:-----:|-----------------------------------------------------------------|------------------------------------------------|:---------------:|--------------------------------------------------------|
| RV-1  | Missing `transactionId` field                                   | `transactionId` omitted                        |       400       | Error code `MISSING_FIELD`, field name in response     |
| RV-2  | Missing `amount` field                                          | `amount` omitted                               |       400       | Error code `MISSING_FIELD`                             |
| RV-3  | Missing `currency` field                                        | `currency` omitted                             |       400       | Error code `MISSING_FIELD`                             |
| RV-4  | Missing `reason` field                                          | `reason` omitted                               |       400       | Error code `MISSING_FIELD`                             |
| RV-5  | Invalid `transactionId` format (not UUID)                       | `transactionId: "abc123"`                      |       400       | Error code `INVALID_FORMAT`                            |
| RV-6  | Negative `amount` value                                         | `amount: -10.00`                               |       400       | Error code `INVALID_VALUE`, message mentions positive  |
| RV-7  | Zero `amount` value                                             | `amount: 0`                                    |       400       | Error code `INVALID_VALUE`                             |
| RV-8  | Non-numeric `amount` value                                      | `amount: "not-a-number"`                       |       400       | Error code `INVALID_TYPE`                              |
| RV-9  | Invalid `currency` code (not ISO 4217)                          | `currency: "FAKE"`                             |       400       | Error code `INVALID_VALUE`                             |
| RV-10 | Empty request body                                              | `{}`                                           |       400       | Multiple error entries returned                        |
| RV-11 | Malformed JSON body                                             | `{invalid json`                                |       400       | Error code `MALFORMED_REQUEST`                         |
| RV-12 | Content-Type not application/json                               | `Content-Type: text/plain`                     |       415       | `Unsupported Media Type` response                      |
| RV-13 | Amount with more than 2 decimal places                          | `amount: 10.999`                               |       400       | Error code `INVALID_PRECISION`                         |
| RV-14 | Excessively long `reason` field (>1000 chars)                   | `reason: "a" * 1001`                           |       400       | Error code `FIELD_TOO_LONG`                            |
| RV-15 | Unknown fields in body (strict mode)                            | Extra field `foo: "bar"`                       |       400       | Error code `UNKNOWN_FIELD` or silently ignored (doc)   |

### 3.3 Business validation — 422 Unprocessable Entity

| #     | Test case                                                       | Scenario                                                    | Expected status | Key assertions                                                |
|:-----:|-----------------------------------------------------------------|-------------------------------------------------------------|:---------------:|---------------------------------------------------------------|
| BV-1  | Transaction not found                                           | `transactionId` does not exist in DB                        |       422       | Error code `TRANSACTION_NOT_FOUND`                            |
| BV-2  | Transaction already fully refunded                              | Prior refunds sum to original amount                        |       422       | Error code `ALREADY_REFUNDED`, `remainingAmount: 0`           |
| BV-3  | Refund amount exceeds remaining balance                         | Requested > (original - prior refunds)                      |       422       | Error code `AMOUNT_EXCEEDS_BALANCE`, shows max allowed        |
| BV-4  | Transaction older than refund policy window (90 days)           | Transaction date > 90 days ago                              |       422       | Error code `REFUND_WINDOW_EXPIRED`                            |
| BV-5  | Payment method does not support refunds                         | E.g., cash, wire transfer                                   |       422       | Error code `REFUND_NOT_SUPPORTED`                             |
| BV-6  | Transaction in pending/processing state                         | Transaction status is not `COMPLETED`                       |       422       | Error code `INVALID_TRANSACTION_STATE`                        |
| BV-7  | Refund blocked by fraud hold                                    | Fraud flag set on transaction                               |       422       | Error code `FRAUD_HOLD`                                       |
| BV-8  | Currency mismatch with original transaction                     | Request USD but original was EUR                            |       422       | Error code `CURRENCY_MISMATCH`                                |
| BV-9  | Refund count exceeds max attempts per transaction               | 5+ prior partial refunds                                    |       422       | Error code `MAX_REFUNDS_EXCEEDED`                             |
| BV-10 | RLX_AUTH_AMT_CHECK flag disabled — amount bypass blocked        | Flag off + amount > authorized threshold                    |       422       | Error code `AUTH_AMOUNT_CHECK_REQUIRED`                       |
| BV-11 | Guest account suspended                                         | Guest linked to transaction is suspended                    |       422       | Error code `ACCOUNT_SUSPENDED`                                |
| BV-12 | Transaction belongs to different resort/property                 | Cross-property refund not allowed                           |       422       | Error code `PROPERTY_MISMATCH`                                |

### 3.4 HTTP status code contract verification (DPAY-14500 regression)

| #      | Test case                                                      | Scenario                                                   | Expected status | Key assertions                                                         |
|:------:|----------------------------------------------------------------|------------------------------------------------------------|:---------------:|------------------------------------------------------------------------|
| SC-1   | Validation failure MUST NOT return 200                         | Any BV-* scenario                                          |     ≠ 200      | Response status is 4xx, never 200 with error body                      |
| SC-2   | Validation success returns exactly 200                         | Valid request                                              |       200       | Body contains `eligible: true`                                         |
| SC-3   | Malformed input returns exactly 400                            | Any RV-* scenario                                          |       400       | Not 200, not 500                                                       |
| SC-4   | Business rule violation returns exactly 422                    | Any BV-* scenario                                          |       422       | Not 200, not 400, not 500                                              |
| SC-5   | Downstream timeout returns 502 or 503                          | Gateway timeout on payment service call                    |     502/503     | Appropriate gateway error, not 200                                     |
| SC-6   | Internal error returns 500 with generic message                | Unhandled NullPointerException                             |       500       | No stack trace in response body, generic error message                 |
| SC-7   | Response content-type is always application/json               | Any scenario                                               |       Any       | `Content-Type: application/json` header present                        |

### 3.5 Security

| #     | Test case                                                       | Attack vector                                              | Expected status | Key assertions                                         |
|:-----:|-----------------------------------------------------------------|------------------------------------------------------------|:---------------:|--------------------------------------------------------|
| SE-1  | Request without Authorization header                            | No auth                                                    |       401       | `WWW-Authenticate` header in response                  |
| SE-2  | Request with expired JWT token                                  | Expired `exp` claim                                        |       401       | Error code `TOKEN_EXPIRED`                             |
| SE-3  | Request with invalid JWT signature                              | Tampered token                                             |       401       | Error code `INVALID_TOKEN`                             |
| SE-4  | Request with valid token but insufficient scope                 | Missing `refund:validate` scope                            |       403       | Error code `INSUFFICIENT_PERMISSIONS`                  |
| SE-5  | SQL injection in `transactionId`                                | `transactionId: "'; DROP TABLE--"`                         |       400       | Input rejected at validation, no DB impact             |
| SE-6  | XSS payload in `reason` field                                   | `reason: "<script>alert(1)</script>"`                      |       400/200   | Payload is sanitized/escaped in response               |
| SE-7  | Request from unauthorized service (mTLS)                        | Invalid client certificate                                 |       403       | Connection rejected or 403                             |
| SE-8  | Rate limiting enforcement                                       | 100+ requests in 1 second from same client                 |       429       | `Retry-After` header present                           |
| SE-9  | CORS preflight returns correct headers                          | OPTIONS request with Origin header                         |       200       | Correct `Access-Control-*` headers                     |
| SE-10 | Request body exceeds max size (10MB)                            | Oversized payload                                          |       413       | `Payload Too Large` response                           |

### 3.6 Integration (downstream service calls)

| #     | Test case                                                       | Scenario                                                   | Expected status | Key assertions                                         |
|:-----:|-----------------------------------------------------------------|------------------------------------------------------------|:---------------:|--------------------------------------------------------|
| IN-1  | Payment gateway returns successful authorization check          | Gateway confirms auth amount                               |       200       | `eligible: true`, gateway call logged                  |
| IN-2  | Payment gateway timeout (>5s)                                   | Gateway does not respond                                   |       502       | Circuit breaker triggered, error logged                |
| IN-3  | Payment gateway returns 500                                     | Gateway internal error                                     |       502       | Graceful degradation, retry logged                     |
| IN-4  | Payment gateway returns 404 for transaction                     | Transaction unknown to gateway                             |       422       | Maps to `TRANSACTION_NOT_FOUND`                        |
| IN-5  | DynamoDB read timeout                                           | Transaction lookup exceeds timeout                         |       503       | Service unavailable, retry-after header                |
| IN-6  | MariaDB connection pool exhausted                               | All connections busy                                       |       503       | No hang, fails fast with clear error                   |
| IN-7  | Circuit breaker open state                                      | After 3 consecutive gateway failures                       |       503       | Fast-fail without calling gateway                      |
| IN-8  | Retry mechanism on transient failure                            | First call fails, second succeeds                          |       200       | Transparent retry, single response to client           |

### 3.7 Performance and load

| #     | Test case                                                       | Load profile                                               | Pass criteria                                          |
|:-----:|-----------------------------------------------------------------|------------------------------------------------------------|--------------------------------------------------------|
| PF-1  | Latency under normal load                                       | 200 RPS sustained for 5 min                                | p95 < 200ms, p99 < 500ms                              |
| PF-2  | Latency under peak load                                         | 500 RPS sustained for 10 min                               | p95 < 200ms, no 5xx errors                            |
| PF-3  | Spike test                                                      | 0 → 2000 RPS in 5 seconds                                 | No connection pool exhaustion, graceful degradation    |
| PF-4  | Soak test — connection pool leak detection (INC0067890)          | 200 RPS for 2 hours                                        | Connection pool stable, no growth, no timeouts         |
| PF-5  | Throughput ceiling                                               | Ramp from 100 → 5000 RPS                                  | Identify max RPS before error rate > 1%               |
| PF-6  | Response time with cold cache                                    | First requests after service restart                       | p95 < 500ms (acceptable cold start)                   |
| PF-7  | Connection pool recovery after exhaustion                        | Exhaust pool → wait 30s → send requests                   | Pool recovers, requests succeed within 5s             |

### 3.8 Edge cases

| #     | Test case                                                       | Scenario                                                   | Expected status | Key assertions                                         |
|:-----:|-----------------------------------------------------------------|------------------------------------------------------------|:---------------:|--------------------------------------------------------|
| EC-1  | Concurrent validation for same transaction                      | 10 parallel requests for same `transactionId`              |       200       | All return consistent result, no race condition        |
| EC-2  | Unicode characters in `reason` field                            | Emoji and CJK characters                                   |       200       | Properly stored and returned                           |
| EC-3  | Amount at currency's smallest unit (¥1 for JPY)                 | Zero-decimal currency                                      |       200       | Correct handling of zero-decimal currencies            |
| EC-4  | Refund exactly equal to remaining balance                       | amount == remaining                                        |       200       | `eligible: true`, full refund allowed                  |
| EC-5  | Refund of $0.01 less than remaining balance                     | Leaves $0.01 unreturned                                    |       200       | `eligible: true`, partial refund allowed               |
| EC-6  | Transaction at exactly 90-day policy boundary                   | Created exactly 90 days ago at same hour                   |       200       | Boundary inclusive — still eligible                    |
| EC-7  | Transaction at 90 days + 1 second                               | Just past policy window                                    |       422       | `REFUND_WINDOW_EXPIRED`                                |
| EC-8  | Very large transaction amount ($999,999.99)                     | Near system max                                            |       200       | No overflow, correct validation                        |
| EC-9  | Multiple validation calls then actual refund                    | Validate 3x, then execute refund                           |       200       | Validation is idempotent, no side effects              |
| EC-10 | Request during service graceful shutdown                         | In-flight request when pod terminating                     |       200/503   | Either completes or returns clean 503                  |

---

## 4. Test environment requirements

| Environment | Purpose                          | Configuration                                                                |
|-------------|----------------------------------|------------------------------------------------------------------------------|
| Local       | Unit + integration tests         | Testcontainers (MariaDB, DynamoDB Local), WireMock for gateway               |
| Latest      | E2E smoke after deploy           | Auto-deployed on merge to `develop`, real DB, mocked gateway                 |
| Stage       | Full regression + performance    | Manual deploy, production-like config, real gateway sandbox                   |
| Load        | Performance and soak tests       | Isolated cluster, production-equivalent resources, synthetic traffic only     |

### Infrastructure requirements

- MariaDB connection pool sized identically to production (max 20 connections per pod)
- DynamoDB provisioned capacity matching production read/write units
- Payment gateway sandbox environment with configurable latency injection
- Monitoring: Splunk dashboards, Datadog APM traces active during test execution
- VPN access for Latest/Stage environments

---

## 5. Entry and exit criteria

### Entry criteria

- [ ] Code complete and merged to `develop`
- [ ] Unit tests passing locally (90%+ coverage on new code)
- [ ] API contract documented in OpenAPI spec
- [ ] Test data provisioned in Latest environment
- [ ] No P1/P2 blockers on dependent services
- [ ] DPAY-14500 fix confirmed in code (status code mapping reviewed)
- [ ] Connection pool configuration matches baseline (INC0067890 safeguard)

### Exit criteria

- [ ] All unit tests pass (0 failures)
- [ ] All integration tests pass (0 failures)
- [ ] E2E smoke suite passes on Latest
- [ ] Performance test: p95 < 200ms at 500 RPS
- [ ] Soak test: no connection pool growth over 2 hours
- [ ] No P1/P2 defects open against this endpoint
- [ ] SC-1 through SC-7 (status code contract) all pass — zero 200s on error paths
- [ ] Security scan (OWASP ZAP) clean — no high/critical findings
- [ ] All 400/422 error paths return correct status codes (DPAY-14500 non-regression)

---

## 6. Risks and mitigations

| #  | Risk                                                              | Impact | Likelihood | Mitigation                                                               |
|:--:|-------------------------------------------------------------------|:------:|:----------:|--------------------------------------------------------------------------|
| R1 | DPAY-14500 regression (200 on validation failure)                 |  High  |   Medium   | Dedicated SC-* test cases; CI gate that fails on any 200 with error body |
| R2 | Connection pool exhaustion under load (INC0067890)                |  High  |    High    | Soak test (PF-4) mandatory before stage promotion; pool metric alerts    |
| R3 | RLX_AUTH_AMT_CHECK flag misconfiguration                          | Medium |   Medium   | BV-10 test case; integration test with flag toggled on/off               |
| R4 | Payment gateway sandbox unavailable during testing                | Medium |    Low     | WireMock stubs as fallback; record/replay from last good session         |
| R5 | Test data pollution between runs                                  |  Low   |   Medium   | Each test creates own transaction; cleanup hook in @AfterEach            |
| R6 | Canary deployment masks latency regression                        | Medium |    Low     | Run perf tests against canary pod directly, not load balancer            |
| R7 | Flaky integration tests due to Testcontainers startup             |  Low   |   Medium   | Shared container lifecycle per test class; retry on CI                    |
| R8 | Cross-property validation logic untested for all 4 properties     | Medium |   Medium   | Parameterized tests with WDW, DLR, DCL, DLP property codes              |

---

## 7. Test data requirements

### Static test data (seeded in environment)

| Data entity              | Details                                                                        | Environment |
|--------------------------|--------------------------------------------------------------------------------|-------------|
| Completed transaction    | `txn-001`, amount $100.00 USD, credit card, WDW, date: today - 30 days         | Latest      |
| Fully refunded txn       | `txn-002`, amount $50.00, prior refund of $50.00                               | Latest      |
| Partially refunded txn   | `txn-003`, amount $200.00, prior refund of $75.00 (remaining: $125.00)         | Latest      |
| Expired transaction      | `txn-004`, amount $80.00, date: today - 91 days                                | Latest      |
| Fraud-held transaction   | `txn-005`, fraud flag = true                                                   | Latest      |
| Pending transaction      | `txn-006`, status = PROCESSING                                                 | Latest      |
| Multi-tender transaction | `txn-007`, $150 total: $100 credit + $50 gift card                             | Latest      |
| DLR property transaction | `txn-008`, property = DLR, $60.00                                              | Latest      |
| JPY transaction          | `txn-009`, amount ¥5000, zero-decimal currency                                 | Latest      |
| Max-refund-count txn     | `txn-010`, 5 prior partial refunds                                             | Latest      |

### Dynamic test data (created per test run)

- Fresh transactions created via test setup API (`POST /api/v1/test/transactions`)
- Unique UUIDs generated per test to avoid collision
- JWT tokens minted with test-specific scopes and expiry

### Sensitive data handling

- No real guest PII in test environments
- Synthetic credit card numbers (Luhn-valid test ranges)
- All test tokens use dedicated `test-service-account` — never production credentials

---

## 8. Execution schedule

| Phase              | Duration | Environment | Owner |
|--------------------|----------|-------------|-------|
| Unit tests         | CI/CD    | Local       | Dev   |
| Integration tests  | CI/CD    | Local       | Dev   |
| E2E smoke          | Post-deploy | Latest   | CI    |
| Full regression    | 1 day    | Stage       | QA    |
| Performance suite  | 4 hours  | Load        | QA    |
| Soak test          | 2 hours  | Load        | QA    |
| Security scan      | 2 hours  | Stage       | SecOps|

---

## 9. Sample request/response payloads

### Valid request

```json
{
  "transactionId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "amount": 50.00,
  "currency": "USD",
  "reason": "Guest requested refund for cancelled dining reservation",
  "requestedBy": "cast-member-12345",
  "property": "WDW"
}
```

### Success response (200)

```json
{
  "eligible": true,
  "validationId": "val-98765432-abcd-1234-efgh-567890abcdef",
  "maxRefundableAmount": 100.00,
  "refundMethod": "CREDIT_CARD",
  "authAmountVerified": true,
  "allocations": [
    {
      "tenderId": "tender-001",
      "method": "VISA",
      "amount": 50.00
    }
  ],
  "expiresAt": "2026-07-24T09:01:36Z"
}
```

### Validation error response (400)

```json
{
  "status": 400,
  "error": "Bad Request",
  "code": "MISSING_FIELD",
  "message": "Required field 'transactionId' is missing",
  "timestamp": "2026-07-24T08:01:36Z",
  "path": "/api/v1/refunds/validate",
  "traceId": "abc123def456"
}
```

### Business validation error response (422)

```json
{
  "status": 422,
  "error": "Unprocessable Entity",
  "code": "AMOUNT_EXCEEDS_BALANCE",
  "message": "Requested refund amount $150.00 exceeds remaining balance $125.00",
  "details": {
    "requestedAmount": 150.00,
    "remainingBalance": 125.00,
    "priorRefunds": 75.00,
    "originalAmount": 200.00
  },
  "timestamp": "2026-07-24T08:01:36Z",
  "path": "/api/v1/refunds/validate",
  "traceId": "abc123def789"
}
```

---

## 10. Traceability matrix

| Requirement / Risk        | Test cases covering it                    |
|---------------------------|-------------------------------------------|
| DPAY-14500 regression     | SC-1, SC-2, SC-3, SC-4, BV-1 through BV-12 |
| RLX_AUTH_AMT_CHECK bypass | HP-7, BV-10                               |
| INC0067890 conn pool      | PF-4, PF-7, IN-6                          |
| p95 < 200ms SLA           | PF-1, PF-2                                |
| Auth enforcement          | SE-1, SE-2, SE-3, SE-4                    |
| Input sanitization        | SE-5, SE-6, RV-5 through RV-14           |
| Graceful degradation      | IN-2, IN-3, IN-5, IN-6, IN-7             |
| Idempotency               | EC-9                                      |
| Multi-property support    | BV-12, EC-3, test data txn-008            |

---

*Total distinct test cases: 68*
