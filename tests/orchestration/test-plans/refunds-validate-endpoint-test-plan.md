# Test Plan: POST /api/v1/refunds/validate

**Service:** Adaptive Payment Platform — Refund Validation Endpoint
**Version:** 1.0
**Author:** test_planner_agent
**Date:** 2026-08-05
**Ticket Reference:** DPAY-14500 (architectural risk context)
**Target Coverage:** 80%+

---

## 1. Scope

### In scope

- Functional validation of `POST /api/v1/refunds/validate` request/response contract
- HTTP status code correctness (400 for validation failures — regression guard against DPAY-14500 pattern)
- Field-level validation (amount, currency, transaction references, timestamps)
- `RLX_AUTH_AMT_CHECK` flag bypass behavior for configured clients
- Authentication (Bearer token / OAuth2) and authorization (role-based access)
- Rate limiting and abuse prevention mechanisms
- Idempotency handling (duplicate validation requests)
- Concurrency scenarios (parallel validations for same transaction)
- Currency handling (multi-currency, precision, rounding)
- Performance under load (latency P95/P99, throughput)
- Integration with DynamoDB (transaction lookup) and MariaDB (configuration)
- Error response structure consistency

### Out of scope

- Actual refund processing (downstream `POST /api/v1/refunds` execution)
- Payment gateway integration (Cybersource, Adyen, etc.)
- UI/client-side validation
- Deployment pipeline testing (Harness pipeline correctness)
- Database schema migrations
- Legacy `SharedPayment.java` endpoint behavior (tested separately)
- Guest-facing payment sheet interactions

---

## 2. Test strategy

### Unit tests (target: 85% coverage)

| Aspect              | Approach                                                                 |
|---------------------|--------------------------------------------------------------------------|
| Validator classes   | JUnit 5 + Mockito. Test each validation rule in isolation.               |
| Controller layer    | `@WebMvcTest` with mocked service. Verify HTTP status codes and bodies.  |
| Service layer       | Mocked repository/client. Verify orchestration logic.                    |
| Config flag logic   | Parameterized tests for `RLX_AUTH_AMT_CHECK` on/off per client.          |
| Error mapping       | Verify `ValidationException` → 400, not 200 with error body.            |

### Integration tests (target: 75% coverage)

| Aspect                    | Approach                                                            |
|---------------------------|---------------------------------------------------------------------|
| DynamoDB integration      | Testcontainers (LocalStack) for transaction lookup.                 |
| MariaDB integration       | Testcontainers for client config / flag storage.                    |
| Full request lifecycle    | `@SpringBootTest` with `TestRestTemplate`. Real serialization path. |
| Auth integration          | Mocked OAuth2 token validation with Spring Security test support.   |
| Rate limiting integration | Verify Redis/bucket4j integration with embedded Redis.              |

### End-to-end tests

| Aspect               | Approach                                                               |
|----------------------|------------------------------------------------------------------------|
| Contract validation  | Run against `latest` environment post-deploy.                          |
| Smoke suite          | 5 critical-path scenarios executed via Harness post-deploy step.       |
| Multi-service flow   | Validate that downstream services respect validation response.         |

### Performance tests

| Aspect         | Approach                                                                       |
|----------------|--------------------------------------------------------------------------------|
| Load testing   | Gatling or k6 against `load` environment. 500 RPS sustained for 10 minutes.   |
| Soak testing   | 100 RPS for 2 hours. Monitor memory, connection pools, GC pauses.              |
| Spike testing  | Ramp from 50 → 2000 RPS in 30 seconds. Verify graceful degradation.           |
| Concurrency    | 50 parallel requests for same transaction ID. Verify no race conditions.       |

---

## 3. Test cases

### 3.1 Happy path — valid refund request

| ID          | Title                                              | Priority | Type       |
|-------------|----------------------------------------------------|:--------:|------------|
| TC-REF-001  | Validate full refund with valid transaction ID     | Critical | Functional |
| TC-REF-002  | Validate partial refund within allowed amount      | Critical | Functional |
| TC-REF-003  | Validate refund with all optional fields populated | High     | Functional |
| TC-REF-004  | Validate refund with minimum required fields only  | High     | Functional |
| TC-REF-005  | Response body contains validation confirmation     | High     | Functional |

**TC-REF-001: Validate full refund with valid transaction ID**

```text
Preconditions:
- Valid OAuth2 token with refund.validate scope
- Transaction TXN-001 exists with amount $150.00 USD, status COMPLETED

Request:
POST /api/v1/refunds/validate
Authorization: Bearer {valid_token}
Content-Type: application/json
{
  "transactionId": "TXN-001",
  "amount": 150.00,
  "currency": "USD",
  "reason": "GUEST_REQUEST",
  "requestedBy": "cast-member-12345"
}

Expected:
- HTTP 200 OK
- Body: { "valid": true, "transactionId": "TXN-001", "maxRefundableAmount": 150.00 }
- Response time < 500ms
```

**TC-REF-002: Validate partial refund within allowed amount**

```text
Preconditions:
- Transaction TXN-002 exists with amount $200.00 USD, $50.00 already refunded

Request:
POST /api/v1/refunds/validate
{
  "transactionId": "TXN-002",
  "amount": 100.00,
  "currency": "USD",
  "reason": "PARTIAL_RETURN"
}

Expected:
- HTTP 200 OK
- Body: { "valid": true, "maxRefundableAmount": 150.00, "previousRefunds": 50.00 }
```

---

### 3.2 Invalid amounts

| ID          | Title                                               | Priority | Type       |
|-------------|-----------------------------------------------------|:--------:|------------|
| TC-REF-010  | Reject negative refund amount                       | Critical | Functional |
| TC-REF-011  | Reject zero refund amount                           | Critical | Functional |
| TC-REF-012  | Reject amount exceeding original transaction        | Critical | Functional |
| TC-REF-013  | Reject amount exceeding remaining refundable amount | Critical | Functional |
| TC-REF-014  | Reject amount with excessive decimal precision      | High     | Functional |
| TC-REF-015  | Reject amount exceeding currency max (overflow)     | Medium   | Edge Case  |

**TC-REF-010: Reject negative refund amount**

```text
Request:
POST /api/v1/refunds/validate
{ "transactionId": "TXN-001", "amount": -50.00, "currency": "USD" }

Expected:
- HTTP 400 Bad Request (NOT 200 with error body)
- Body: { "valid": false, "errors": [{ "field": "amount", "code": "INVALID_AMOUNT", "message": "..." }] }
```

**TC-REF-012: Reject amount exceeding original transaction**

```text
Preconditions:
- Transaction TXN-001 has original amount $150.00

Request:
POST /api/v1/refunds/validate
{ "transactionId": "TXN-001", "amount": 200.00, "currency": "USD" }

Expected:
- HTTP 400 Bad Request
- Body includes error code "EXCEEDS_ORIGINAL_AMOUNT"
- Body includes maxRefundableAmount for client guidance
```

---

### 3.3 Missing/malformed fields

| ID          | Title                                           | Priority | Type       |
|-------------|-------------------------------------------------|:--------:|------------|
| TC-REF-020  | Reject missing transactionId                    | Critical | Functional |
| TC-REF-021  | Reject missing amount                           | Critical | Functional |
| TC-REF-022  | Reject missing currency                         | Critical | Functional |
| TC-REF-023  | Reject malformed transactionId format           | High     | Functional |
| TC-REF-024  | Reject non-numeric amount (string value)        | High     | Functional |
| TC-REF-025  | Reject empty request body                       | High     | Functional |
| TC-REF-026  | Reject invalid JSON syntax                      | High     | Functional |
| TC-REF-027  | Reject unsupported Content-Type header          | Medium   | Functional |
| TC-REF-028  | Reject request with extra unknown fields        | Low      | Functional |
| TC-REF-029  | Reject amount as string "150.00" instead of num | Medium   | Functional |

**TC-REF-020: Reject missing transactionId**

```text
Request:
POST /api/v1/refunds/validate
{ "amount": 50.00, "currency": "USD" }

Expected:
- HTTP 400 Bad Request
- Body: { "valid": false, "errors": [{ "field": "transactionId", "code": "REQUIRED_FIELD" }] }
```

---

### 3.4 HTTP status code correctness (DPAY-14500 regression)

| ID          | Title                                                           | Priority | Type       |
|-------------|-----------------------------------------------------------------|:--------:|------------|
| TC-REF-030  | Validation failure returns 400, NOT 200 with error body         | Critical | Regression |
| TC-REF-031  | Business rule violation returns 400, not 200                    | Critical | Regression |
| TC-REF-032  | Transaction not found returns 404, not 200 with error           | Critical | Regression |
| TC-REF-033  | Internal error returns 500, not 200 with error body             | Critical | Regression |
| TC-REF-034  | Successful validation returns 200 with valid=true               | Critical | Regression |
| TC-REF-035  | 400 response body still contains structured error details       | High     | Regression |
| TC-REF-036  | No validation scenario returns 200 with valid=false in body     | Critical | Regression |

**TC-REF-030: Validation failure returns 400, NOT 200 with error body**

```text
Purpose: Guard against DPAY-14500 legacy pattern where SharedPayment.java
returned 200 OK for all requests, embedding errors only in JSON body.

Request (invalid — negative amount):
POST /api/v1/refunds/validate
{ "transactionId": "TXN-001", "amount": -10.00, "currency": "USD" }

Expected:
- HTTP 400 Bad Request ← CRITICAL ASSERTION
- NOT HTTP 200 with { "errors": [...] }

Verification:
- Assert response.statusCode == 400
- Assert response.statusCode != 200
- Assert response body contains "valid": false and structured errors
```

**TC-REF-036: No validation scenario returns 200 with valid=false in body**

```text
Purpose: Ensure there is NO scenario where HTTP 200 is returned with
valid=false. This pattern was the DPAY-14500 bug. Every validation failure
must produce a 4xx status code.

Approach:
- Execute ALL negative test cases (TC-REF-010 through TC-REF-029)
- For EACH response, assert: if body contains "valid": false → status != 200
- This is an invariant that should be tested as a cross-cutting concern
```

---

### 3.5 Authentication and authorization

| ID          | Title                                                    | Priority | Type     |
|-------------|----------------------------------------------------------|:--------:|----------|
| TC-REF-040  | Reject request with no Authorization header              | Critical | Security |
| TC-REF-041  | Reject request with expired token                        | Critical | Security |
| TC-REF-042  | Reject request with malformed/invalid token              | Critical | Security |
| TC-REF-043  | Reject request with insufficient scope                   | Critical | Security |
| TC-REF-044  | Accept request with valid token and correct scope        | Critical | Security |
| TC-REF-045  | Reject request with token for different service          | High     | Security |
| TC-REF-046  | Verify 401 for authentication failures (not 403)         | High     | Security |
| TC-REF-047  | Verify 403 for authorization failures (not 401)          | High     | Security |
| TC-REF-048  | Token with refund.read scope cannot validate             | High     | Security |

**TC-REF-040: Reject request with no Authorization header**

```text
Request:
POST /api/v1/refunds/validate
(No Authorization header)
{ "transactionId": "TXN-001", "amount": 50.00, "currency": "USD" }

Expected:
- HTTP 401 Unauthorized
- WWW-Authenticate header present
- No business logic executed (verify via logs/metrics)
```

---

### 3.6 RLX_AUTH_AMT_CHECK flag bypass behavior

| ID          | Title                                                              | Priority | Type       |
|-------------|--------------------------------------------------------------------|:--------:|------------|
| TC-REF-050  | Client with RLX_AUTH_AMT_CHECK=true bypasses amount validation     | Critical | Functional |
| TC-REF-051  | Client with RLX_AUTH_AMT_CHECK=false enforces amount validation    | Critical | Functional |
| TC-REF-052  | RLX flag allows amount exceeding original transaction              | Critical | Functional |
| TC-REF-053  | RLX flag does NOT bypass other validations (currency, format)      | Critical | Functional |
| TC-REF-054  | Unknown client defaults to RLX_AUTH_AMT_CHECK=false                | High     | Functional |
| TC-REF-055  | RLX flag change takes effect without service restart               | Medium   | Functional |
| TC-REF-056  | RLX flag with amount exceeding system max still rejects            | High     | Edge Case  |
| TC-REF-057  | Audit log records when RLX bypass is exercised                     | High     | Security   |

**TC-REF-050: Client with RLX_AUTH_AMT_CHECK=true bypasses amount validation**

```text
Preconditions:
- Client "WDW-MOBILE" is configured with RLX_AUTH_AMT_CHECK=true in MariaDB
- Transaction TXN-003 has original amount $100.00

Request (from WDW-MOBILE client):
POST /api/v1/refunds/validate
X-Client-Id: WDW-MOBILE
{ "transactionId": "TXN-003", "amount": 250.00, "currency": "USD" }

Expected:
- HTTP 200 OK (amount validation bypassed)
- Body: { "valid": true, "bypassApplied": "RLX_AUTH_AMT_CHECK" }
- Audit log entry records bypass event with client ID and amount
```

**TC-REF-053: RLX flag does NOT bypass other validations**

```text
Preconditions:
- Client "WDW-MOBILE" has RLX_AUTH_AMT_CHECK=true

Request:
POST /api/v1/refunds/validate
X-Client-Id: WDW-MOBILE
{ "transactionId": "TXN-003", "amount": 250.00, "currency": "INVALID" }

Expected:
- HTTP 400 Bad Request
- RLX only relaxes amount checks — currency, format, auth still enforced
```

---

### 3.7 Rate limiting and abuse prevention

| ID          | Title                                                        | Priority | Type        |
|-------------|--------------------------------------------------------------|:--------:|-------------|
| TC-REF-060  | Exceed rate limit returns 429 Too Many Requests              | High     | Security    |
| TC-REF-061  | Rate limit applies per client/IP                             | High     | Security    |
| TC-REF-062  | Rate limit resets after window expires                       | Medium   | Functional  |
| TC-REF-063  | Rate limit response includes Retry-After header              | Medium   | Functional  |
| TC-REF-064  | Burst of identical requests within 1 second                  | High     | Performance |
| TC-REF-065  | Rate limit does not block legitimate high-volume clients     | High     | Functional  |

**TC-REF-060: Exceed rate limit returns 429**

```text
Preconditions:
- Rate limit configured at 100 requests/minute per client

Test:
- Send 101 requests within 60 seconds from same client

Expected:
- First 100 requests: HTTP 200 or 400 (based on payload validity)
- 101st request: HTTP 429 Too Many Requests
- Body: { "error": "RATE_LIMIT_EXCEEDED", "retryAfter": <seconds> }
- Retry-After header present
```

---

### 3.8 Performance under load

| ID          | Title                                                | Priority | Type        |
|-------------|------------------------------------------------------|:--------:|-------------|
| TC-REF-070  | P95 latency < 500ms at 200 RPS                      | Critical | Performance |
| TC-REF-071  | P99 latency < 1000ms at 200 RPS                     | Critical | Performance |
| TC-REF-072  | No errors at sustained 500 RPS for 10 minutes        | High     | Performance |
| TC-REF-073  | Graceful degradation at 2000 RPS (spike)             | High     | Performance |
| TC-REF-074  | Memory does not grow unbounded during load           | High     | Performance |
| TC-REF-075  | Connection pool utilization stays below 80%          | Critical | Performance |
| TC-REF-076  | No GC pauses > 200ms during load                    | Medium   | Performance |

**TC-REF-075: Connection pool utilization stays below 80%**

```text
Purpose: Guard against connection pool exhaustion cascade (known risk from
Payment Service BAPP0012692 incidents — see incident-response steering).

Test:
- Sustain 500 RPS for 10 minutes
- Monitor HikariCP/DynamoDB connection pool metrics

Expected:
- Pool utilization < 80% average
- No connection timeout errors
- No cascade to downstream services
```

---

### 3.9 Concurrent refund validation for same transaction

| ID          | Title                                                          | Priority | Type       |
|-------------|----------------------------------------------------------------|:--------:|------------|
| TC-REF-080  | Two parallel validations for same transaction both succeed     | High     | Functional |
| TC-REF-081  | No race condition on remaining refundable amount read          | Critical | Functional |
| TC-REF-082  | Validation remains consistent during concurrent partial refund | Critical | Functional |
| TC-REF-083  | No deadlocks under parallel load for same transaction          | Critical | Performance |

**TC-REF-081: No race condition on remaining refundable amount read**

```text
Preconditions:
- Transaction TXN-005: original $200.00, refunded $0.00

Test:
- Simultaneously send 10 validation requests each for $200.00
- All read the same "remaining refundable" state

Expected:
- All 10 return HTTP 200 with valid=true (validation is read-only, no state mutation)
- Refundable amount reported consistently across all responses
- No optimistic lock exceptions or inconsistent reads
```

---

### 3.10 Currency handling

| ID          | Title                                                   | Priority | Type       |
|-------------|---------------------------------------------------------|:--------:|------------|
| TC-REF-090  | Validate refund with USD (2 decimal places)             | Critical | Functional |
| TC-REF-091  | Validate refund with JPY (0 decimal places)             | High     | Functional |
| TC-REF-092  | Validate refund with EUR (2 decimal places)             | High     | Functional |
| TC-REF-093  | Reject currency mismatch with original transaction      | Critical | Functional |
| TC-REF-094  | Reject unsupported currency code                        | High     | Functional |
| TC-REF-095  | Reject invalid ISO 4217 currency code                   | Medium   | Functional |
| TC-REF-096  | Handle BHD (3 decimal places) correctly                 | Medium   | Edge Case  |
| TC-REF-097  | Amount precision matches currency minor units            | High     | Functional |

**TC-REF-093: Reject currency mismatch**

```text
Preconditions:
- Transaction TXN-006 was charged in USD

Request:
POST /api/v1/refunds/validate
{ "transactionId": "TXN-006", "amount": 50.00, "currency": "EUR" }

Expected:
- HTTP 400 Bad Request
- Error code: "CURRENCY_MISMATCH"
- Message indicates original currency was USD
```

---

### 3.11 Idempotency

| ID          | Title                                                            | Priority | Type       |
|-------------|------------------------------------------------------------------|:--------:|------------|
| TC-REF-100  | Identical request with same idempotency key returns same result  | High     | Functional |
| TC-REF-101  | Different payload with same idempotency key returns 409 Conflict | High     | Functional |
| TC-REF-102  | Request without idempotency key processes normally               | Medium   | Functional |
| TC-REF-103  | Idempotency key expires after configured TTL                     | Medium   | Functional |
| TC-REF-104  | Idempotency applies per-client (different clients, same key OK)  | Medium   | Functional |

**TC-REF-100: Identical request with same idempotency key returns same result**

```text
Request (sent twice with same key):
POST /api/v1/refunds/validate
Idempotency-Key: idem-key-abc-123
{ "transactionId": "TXN-001", "amount": 50.00, "currency": "USD" }

Expected (both calls):
- HTTP 200 OK
- Identical response body
- Second call does NOT re-execute validation logic (verify via metrics/logs)
```

---

### 3.12 Additional edge cases

| ID          | Title                                                   | Priority | Type      |
|-------------|---------------------------------------------------------|:--------:|-----------|
| TC-REF-110  | Transaction in PENDING status cannot be refunded        | High     | Edge Case |
| TC-REF-111  | Transaction in REFUNDED status (fully refunded) rejects | High     | Edge Case |
| TC-REF-112  | Transaction older than refund window rejects            | Medium   | Edge Case |
| TC-REF-113  | Very large decimal amount (boundary testing)            | Medium   | Edge Case |
| TC-REF-114  | Unicode characters in reason field                      | Low      | Edge Case |
| TC-REF-115  | Extremely long reason field (>10000 chars)              | Medium   | Edge Case |
| TC-REF-116  | SQL injection in transactionId field                    | Critical | Security  |
| TC-REF-117  | NoSQL injection in transactionId (DynamoDB context)     | Critical | Security  |
| TC-REF-118  | XSS payload in reason field                            | High     | Security  |

---

## 4. Test environment requirements

### Infrastructure

| Component       | Requirement                                                           |
|-----------------|-----------------------------------------------------------------------|
| Application     | Spring Boot service deployed to `latest` environment                  |
| DynamoDB        | LocalStack (unit/integration) or Latest DynamoDB table (E2E)          |
| MariaDB         | Testcontainers (unit/integration) or Latest RDS instance (E2E)        |
| Redis           | Embedded Redis (unit) or Latest ElastiCache (E2E) for rate limiting   |
| Auth provider   | Mocked OAuth2 server (unit/integration) or Keystone Latest (E2E)      |
| Load testing    | Dedicated `load` environment — isolated from dev traffic              |

### Test data

| Entity            | Details                                                         |
|-------------------|-----------------------------------------------------------------|
| Transactions      | Seed 50+ transactions across statuses (COMPLETED, PENDING, etc) |
| Partial refunds   | 10 transactions with existing partial refunds                   |
| Client configs    | WDW-MOBILE (RLX=true), DLR-WEB (RLX=false), unknown client     |
| Multi-currency    | Transactions in USD, EUR, GBP, JPY, BHD                         |
| Expired           | Transactions outside refund window                              |

### Tools

| Tool      | Purpose                                     |
|-----------|---------------------------------------------|
| JUnit 5   | Unit and integration tests                  |
| Mockito   | Mocking dependencies                        |
| Gatling    | Performance/load testing                    |
| WireMock  | External service simulation                 |
| LocalStack| DynamoDB local emulation                    |
| Testcontainers | MariaDB and Redis containers          |

---

## 5. Entry/exit criteria

### Entry criteria

- [ ] Code complete — endpoint implementation merged to `develop`
- [ ] Unit tests passing locally (developer-authored)
- [ ] API contract documented (OpenAPI/Swagger spec available)
- [ ] Test data seeded in `latest` environment
- [ ] DynamoDB table schema deployed
- [ ] MariaDB client configuration table includes RLX_AUTH_AMT_CHECK flag
- [ ] Auth scopes registered in Keystone
- [ ] Rate limiting configuration deployed
- [ ] No blocking P1/P2 defects in dependent services

### Exit criteria

- [ ] All Critical and High priority test cases pass
- [ ] No open P0/P1 defects
- [ ] Code coverage ≥ 80% (measured by JaCoCo)
- [ ] DPAY-14500 regression tests ALL pass (TC-REF-030 through TC-REF-036)
- [ ] Performance benchmarks met (P95 < 500ms at 200 RPS)
- [ ] Connection pool utilization < 80% under load
- [ ] Security test cases pass (no injection vulnerabilities)
- [ ] RLX_AUTH_AMT_CHECK bypass functions correctly for configured clients
- [ ] Test results documented and linked to Jira ticket

---

## 6. Risks and mitigations

| #  | Risk                                                                        | Likelihood | Impact   | Mitigation                                                                                        |
|:--:|-----------------------------------------------------------------------------|:----------:|:--------:|---------------------------------------------------------------------------------------------------|
| 1  | DPAY-14500 regression — endpoint returns 200 for failures                   |   Medium   | Critical | Dedicated regression suite (TC-REF-030–036). CI gate that fails build on any 200+error response.  |
| 2  | RLX_AUTH_AMT_CHECK misconfiguration allows unauthorized bypasses            |   Medium   |   High   | Audit logging on every bypass. Alert on bypass rate > threshold. Default to deny.                  |
| 3  | Connection pool exhaustion under load (known platform risk)                 |    High    | Critical | Load test with pool monitoring. Set alerts at 70% utilization. Test failover behavior.            |
| 4  | Race condition between validation and concurrent refund execution           |    Low     |   High   | Validate is read-only; verify no writes. Integration test concurrent access patterns.             |
| 5  | DynamoDB eventual consistency causes stale transaction reads                |   Medium   |  Medium  | Use strongly consistent reads for transaction lookup. Test with simulated stale data.             |
| 6  | Rate limiting too aggressive — blocks legitimate high-volume clients        |    Low     |  Medium  | Per-client configurable limits. Test with expected production traffic profiles.                   |
| 7  | Test environment data drift from production                                 |   Medium   |  Medium  | Automated test data seeding. Periodic sync of client configurations from prod.                    |
| 8  | Idempotency store (Redis) unavailability degrades endpoint                  |    Low     |  Medium  | Fallback behavior when Redis is down — process request normally. Test Redis failure scenario.     |
| 9  | Currency precision errors cause floating-point validation bugs              |    Low     |   High   | Use `BigDecimal` in Java — never `double`. Unit test all supported currency precisions.           |
| 10 | Auth token validation latency adds to endpoint P95                          |   Medium   |  Medium  | Cache token validation results. Include auth latency in performance budget.                       |

---

## Appendix A: Test execution schedule

| Phase               | Duration | Activities                                            |
|---------------------|:--------:|-------------------------------------------------------|
| Test design         |  3 days  | Write test cases, prepare test data, configure tools  |
| Unit test execution |  2 days  | Run unit + integration suites, fix failures           |
| E2E execution       |  2 days  | Deploy to latest, run smoke + functional suites       |
| Performance testing |  2 days  | Load, soak, and spike tests on `load` environment     |
| Regression/sign-off |  1 day   | Final regression pass, document results, sign-off     |

## Appendix B: HTTP status code contract

This table codifies the DPAY-14500 fix. Every team member reviewing this endpoint must verify this contract:

| Scenario                    | Correct Status | WRONG (legacy pattern) |
|-----------------------------|:--------------:|:----------------------:|
| Valid refund request        |    200 OK      |          —             |
| Validation failure (input)  |    400         |    200 + error body    |
| Business rule violation     |    400         |    200 + error body    |
| Transaction not found       |    404         |    200 + error body    |
| Authentication failure      |    401         |          —             |
| Authorization failure       |    403         |          —             |
| Rate limit exceeded         |    429         |          —             |
| Internal server error       |    500         |    200 + error body    |
| Idempotency conflict        |    409         |          —             |
