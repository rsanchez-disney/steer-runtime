# Test Plan: POST /api/v1/refunds/validate

## Scope

- In scope:
  - Request payload validation (field presence, types, formats, boundaries)
  - Business rule validation (amount limits, refund window, duplicate detection, partial refund rules)
  - HTTP status code correctness (explicit regression prevention for DPAY-14500)
  - Authentication and authorization enforcement
  - Feature flag `RLX_AUTH_AMT_CHECK` behavior toggle
  - `RefundTransactionValidator` integration
  - Performance under concurrent load
  - Security (injection, IDOR, rate limiting)
- Out of scope:
  - Actual refund execution/processing
  - Payment gateway integration (downstream settlement)
  - UI/frontend behavior
  - Database migration testing
  - Third-party notification services (email, SMS)

## Test Strategy

- Unit tests: JUnit 5 + Mockito for `RefundTransactionValidator`, controller input binding, and business rule logic in isolation. Target 90%+ branch coverage on validation paths.
- Integration tests: Spring Boot `@WebMvcTest` and `@SpringBootTest` with embedded context to verify controller-to-validator wiring, HTTP status code mapping, feature flag toggling, and JSON serialization/deserialization.
- E2E tests: Bruno/Postman collections against staging environment exercising full request lifecycle including auth token acquisition, payload submission, and response assertion.
- Performance tests: JMeter/Gatling scripts targeting 200 RPS sustained for 5 minutes, measuring p95 latency < 200ms and error rate < 0.1%.

## Test Environment

- Environment: Staging (mirrors production config, connected to test payment data store)
- Test data: Synthetic transactions seeded via test data factory — covers multiple payment methods (credit card, debit, gift card, PayPal), currencies (USD, EUR, GBP, JPY), and refund states (none, partial, full)
- Tools:
  - JUnit 5 + Mockito (unit)
  - Spring Boot Test (integration)
  - Bruno collections (E2E)
  - JMeter (performance)
  - OWASP ZAP (security scan)
  - SonarQube (coverage reporting)

## Test Schedule

- Test design: Sprint planning week (Days 1–3)
- Test execution: Development complete + 2 days (Days 4–8)
- Defect fixing: Days 9–11
- Regression: Days 12–13 (full suite re-run before release sign-off)

## Entry Criteria

- Code complete and merged to feature branch
- Unit tests passing in CI (green build)
- Staging environment deployed with feature flag configurable
- Test transaction data seeded
- API contract (OpenAPI spec) finalized and reviewed

## Exit Criteria

- All Critical and High priority tests passed
- No P0/P1 defects open
- 80%+ line coverage, 90%+ branch coverage on validation logic
- Performance benchmarks met (p95 < 200ms at 200 RPS)
- Security scan shows no High/Critical findings
- HTTP status code correctness verified for all error categories (DPAY-14500 non-regression confirmed)

## Risks

| Risk                                                        | Mitigation                                                                                  |
|-------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| DPAY-14500 regression — HTTP 200 returned for failures      | Dedicated test category asserting HTTP status codes; CI gate blocks merge if status tests fail |
| Feature flag `RLX_AUTH_AMT_CHECK` misconfiguration          | Test both flag states explicitly; document flag behavior in runbook                           |
| Test data staleness (expired transactions)                  | Automated seeding script regenerates data before each test run                               |
| Staging environment instability                             | Retry logic in test runner; fallback to local Spring Boot context for integration tests       |
| Concurrent refund race conditions                           | Thread-safety tests with parallel requests targeting same transaction                        |
| Incomplete OpenAPI contract                                 | Contract-first approach; generate tests from spec; block test design until spec is final      |

---

## Test Case Matrix

### Category 1: Happy path / positive tests


```text
Test ID: TC-RV-001
Title: Valid full refund request — credit card (USD)
Priority: Critical
Type: Smoke
Preconditions:
- Authenticated with valid bearer token (role: refund_operator)
- Original transaction TX-10001 exists with amount $100.00 USD, status SETTLED
- No prior refunds on TX-10001
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10001", "amount": 100.00, "currency": "USD", "reason": "customer_request"}
2. Assert HTTP status code
3. Assert response body fields
Expected Result:
- HTTP 200 OK
- Body: {"valid": true, "transactionId": "TX-10001", "validatedAmount": 100.00}
```

```text
Test ID: TC-RV-002
Title: Valid partial refund request — credit card (USD)
Priority: Critical
Type: Functional
Preconditions:
- Authenticated with valid bearer token
- Original transaction TX-10002 exists with amount $250.00 USD, status SETTLED
- No prior refunds on TX-10002
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10002", "amount": 75.50, "currency": "USD", "reason": "partial_return"}
2. Assert HTTP status code
3. Assert response body
Expected Result:
- HTTP 200 OK
- Body: {"valid": true, "transactionId": "TX-10002", "validatedAmount": 75.50}
```

```text
Test ID: TC-RV-003
Title: Valid refund request — debit card (EUR)
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
- Original transaction TX-10003 exists with amount €50.00 EUR, status SETTLED
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10003", "amount": 50.00, "currency": "EUR", "reason": "defective_product"}
2. Assert HTTP status code and body
Expected Result:
- HTTP 200 OK
- Body: {"valid": true, "transactionId": "TX-10003", "validatedAmount": 50.00}
```

```text
Test ID: TC-RV-004
Title: Valid refund request — gift card (GBP)
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
- Original transaction TX-10004 exists with amount £30.00 GBP, payment method GIFT_CARD
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10004", "amount": 30.00, "currency": "GBP", "reason": "customer_request"}
2. Assert HTTP status code and body
Expected Result:
- HTTP 200 OK
- Body: {"valid": true, "transactionId": "TX-10004", "validatedAmount": 30.00}
```

```text
Test ID: TC-RV-005
Title: Valid refund request — PayPal (JPY, zero-decimal currency)
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
- Original transaction TX-10005 exists with amount ¥5000 JPY, payment method PAYPAL
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10005", "amount": 5000, "currency": "JPY", "reason": "customer_request"}
2. Assert HTTP status code and body
Expected Result:
- HTTP 200 OK
- Body: {"valid": true, "transactionId": "TX-10005", "validatedAmount": 5000}
```

```text
Test ID: TC-RV-006
Title: Valid partial refund after prior partial refund (remaining balance)
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
- Original transaction TX-10006 amount $200.00, prior refund of $50.00 already processed
- Remaining refundable: $150.00
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10006", "amount": 150.00, "currency": "USD", "reason": "partial_return"}
2. Assert HTTP status code and body
Expected Result:
- HTTP 200 OK
- Body: {"valid": true, "transactionId": "TX-10006", "validatedAmount": 150.00}
```

### Category 2: Input validation

```text
Test ID: TC-RV-010
Title: Missing transactionId field
Priority: Critical
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"amount": 100.00, "currency": "USD", "reason": "customer_request"}
2. Assert HTTP status code
3. Assert error response body
Expected Result:
- HTTP 400 Bad Request
- Body contains field-level error: "transactionId is required"
```

```text
Test ID: TC-RV-011
Title: Null transactionId
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": null, "amount": 100.00, "currency": "USD", "reason": "customer_request"}
2. Assert HTTP status code
Expected Result:
- HTTP 400 Bad Request
- Body contains validation error for transactionId
```

```text
Test ID: TC-RV-012
Title: Empty string transactionId
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "", "amount": 100.00, "currency": "USD", "reason": "customer_request"}
2. Assert HTTP status code
Expected Result:
- HTTP 400 Bad Request
- Body contains validation error for transactionId
```

```text
Test ID: TC-RV-013
Title: Missing amount field
Priority: Critical
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10001", "currency": "USD", "reason": "customer_request"}
2. Assert HTTP status code
Expected Result:
- HTTP 400 Bad Request
- Body contains field-level error: "amount is required"
```

```text
Test ID: TC-RV-014
Title: Amount as string instead of number
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10001", "amount": "one hundred", "currency": "USD", "reason": "customer_request"}
2. Assert HTTP status code
Expected Result:
- HTTP 400 Bad Request
- Body contains type mismatch error for amount
```

```text
Test ID: TC-RV-015
Title: Missing currency field
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10001", "amount": 100.00, "reason": "customer_request"}
2. Assert HTTP status code
Expected Result:
- HTTP 400 Bad Request
- Body contains field-level error: "currency is required"
```

```text
Test ID: TC-RV-016
Title: Invalid currency code (not ISO 4217)
Priority: Medium
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10001", "amount": 100.00, "currency": "FAKE", "reason": "customer_request"}
2. Assert HTTP status code
Expected Result:
- HTTP 400 Bad Request
- Body contains error: "invalid currency code"
```

```text
Test ID: TC-RV-017
Title: Empty request body
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with empty body: {}
2. Assert HTTP status code
Expected Result:
- HTTP 400 Bad Request
- Body contains multiple field validation errors
```

```text
Test ID: TC-RV-018
Title: Malformed JSON body
Priority: High
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with body: "{invalid json"
2. Assert HTTP status code
Expected Result:
- HTTP 400 Bad Request
- Body contains JSON parse error message
```

```text
Test ID: TC-RV-019
Title: Missing Content-Type header
Priority: Medium
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate without Content-Type header, with valid JSON body
2. Assert HTTP status code
Expected Result:
- HTTP 415 Unsupported Media Type
```

```text
Test ID: TC-RV-020
Title: Amount with excessive decimal places (beyond currency precision)
Priority: Medium
Type: Functional
Preconditions:
- Authenticated with valid bearer token
Test Steps:
1. POST /api/v1/refunds/validate with body:
   {"transactionId": "TX-10001", "amount": 99.999999, "currency": "USD", "reason": "customer_request"}
2. Assert HTTP status code
Expected Result:
- HTTP 400 Bad Request
- Body contains error about decimal precision (USD supports max 2 decimal places)
```

