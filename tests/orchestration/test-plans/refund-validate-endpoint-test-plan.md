# Test Plan: POST /api/v1/refunds/validate — Refund Eligibility Validation

**Version:** 1.0
**Date:** 2026-07-26
**Service:** payment-services (Spring Boot / Java)
**Platform:** Disney Adaptive Payment Platform (DPAY)
**Author:** QA — Adaptive Payments Team

---

## Scope

### In scope

- POST `/api/v1/refunds/validate` endpoint behavior
- HTTP status code correctness (regression from DPAY-14500)
- Amount validation logic including `RLX_AUTH_AMT_CHECK` bypass
- Request/response contract validation
- Authentication and authorization enforcement
- Input validation and error handling
- Concurrency and idempotency behavior
- Performance under expected load
- Integration with downstream payment-session and config-services
- Security (PCI-DSS compliance for payment data)
- Multi-property support (WDW, DLR, DCL, DLP)

### Out of scope

- Refund processing/execution (separate endpoint)
- UI layer behavior (payment-controls-client)
- BFF layer transformation logic (tested separately)
- Payment gateway integration (mocked at this layer)
- Legacy endpoint deprecation timeline

---

## Test strategy

| Test type        | Responsibility | Environment | Automation priority |
|------------------|:--------------:|:-----------:|:-------------------:|
| Unit             |      Dev       |    Local    |        P0           |
| Integration      |    Dev + QA    |   Latest    |        P0           |
| Contract         |       QA       |   Latest    |        P0           |
| Regression       |       QA       |   Stage     |        P0           |
| Security         |    QA + Sec    |   Stage     |        P1           |
| Performance      |       QA       |    Load     |        P1           |
| E2E              |       QA       |   Stage     |        P2           |
| Exploratory      |       QA       |   Stage     |        N/A          |

### Unit tests

- Java/JUnit 5 tests for validation logic in isolation
- Mock downstream dependencies (payment-session, config-services)
- Cover all branching in amount validation, flag evaluation, and error mapping

### Integration tests

- Spring Boot `@WebMvcTest` or `@SpringBootTest` with test containers
- Real HTTP calls to the endpoint with mocked downstream services
- Verify HTTP status codes, headers, and response body structure

### Contract tests

- Schema validation against OpenAPI spec
- Verify all documented error codes are reachable
- Consumer-driven contract tests for BFF (payment-controls-api) consumers

### Regression tests (DPAY-14500 — CRITICAL)

- Dedicated regression suite verifying HTTP status codes for ALL failure scenarios
- Must confirm: validation failures return 4xx, never 200 with error body
- Run on every build — gate deployment if any test fails

### Security tests

- PCI-DSS data handling (no PAN/CVV in logs or responses)
- AuthN/AuthZ enforcement
- Input sanitization (injection prevention)
- Rate limiting verification

### Performance tests

- Response time SLA: p95 < 500ms, p99 < 1000ms
- Throughput: sustain 200 req/s without degradation
- Connection pool behavior under load

---

## Test environment

| Environment | Purpose                        | Data source               |
|-------------|--------------------------------|---------------------------|
| Local       | Unit + fast integration        | In-memory / H2            |
| Latest      | Full integration               | Shared dev DynamoDB/RDS   |
| Stage       | Regression + E2E + security    | Stage databases           |
| Load        | Performance                    | Synthetic load data       |

### Test data requirements

- Valid original transactions (various amounts: $1, $50, $500, $9999.99)
- Transactions across all properties (WDW, DLR, DCL, DLP)
- Clients configured WITH `RLX_AUTH_AMT_CHECK` flag
- Clients configured WITHOUT `RLX_AUTH_AMT_CHECK` flag
- Expired/cancelled/already-refunded transactions
- Multi-currency transactions (USD, EUR, GBP for DLP)

---

## Entry criteria

- Code complete for the endpoint
- Unit tests passing locally
- OpenAPI spec published and reviewed
- `RLX_AUTH_AMT_CHECK` flag configuration documented
- Latest environment healthy
- Test data seeded
- DPAY-14500 fix merged and verified at unit level

## Exit criteria

- All P0 (Critical) and P1 (High) test cases passed
- Zero open P0/P1 defects
- DPAY-14500 regression suite: 100% pass rate (no exceptions)
- HTTP status code correctness confirmed for all error scenarios
- Performance SLA met (p95 < 500ms)
- Security scan clean (no PCI-DSS violations)
- 90%+ code coverage on validation logic

---

## Test cases

### Category 1: Happy path — valid refund requests

**Automation priority: P0**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-001  | Validate refund for full original amount                 | Critical |
| TC-RF-002  | Validate partial refund (50% of original)                | Critical |
| TC-RF-003  | Validate minimum refund amount ($0.01)                   | High     |
| TC-RF-004  | Validate refund for WDW property transaction             | High     |
| TC-RF-005  | Validate refund for DLR property transaction             | High     |
| TC-RF-006  | Validate refund for DCL property transaction             | High     |
| TC-RF-007  | Validate refund for DLP property transaction (EUR)       | High     |
| TC-RF-008  | Validate refund with all optional fields populated       | Medium   |

#### TC-RF-001: Validate refund for full original amount

```text
Preconditions:
- Original transaction exists with amount $100.00
- Transaction is in refundable state
- Authenticated with valid service credentials

Test Steps:
1. POST /api/v1/refunds/validate with refundAmount = 100.00 and valid transactionId
2. Verify HTTP status code
3. Verify response body structure

Expected Result:
- HTTP 200 OK
- Response body: { "eligible": true, "maxRefundAmount": 100.00, ... }
- Response time < 500ms
```

---

### Category 2: Amount validation

**Automation priority: P0**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-010  | Reject refund exceeding original transaction amount      | Critical |
| TC-RF-011  | Reject refund with zero amount                           | Critical |
| TC-RF-012  | Reject refund with negative amount                       | Critical |
| TC-RF-013  | Validate refund at exact original amount boundary        | High     |
| TC-RF-014  | Reject refund exceeding remaining refundable amount      | High     |
| TC-RF-015  | Validate refund after prior partial refund               | High     |
| TC-RF-016  | Reject amount with more than 2 decimal places            | Medium   |
| TC-RF-017  | Reject amount exceeding max allowed (system limit)       | Medium   |

#### TC-RF-010: Reject refund exceeding original transaction amount

```text
Preconditions:
- Original transaction exists with amount $100.00
- No prior refunds on this transaction
- Authenticated with valid service credentials

Test Steps:
1. POST /api/v1/refunds/validate with refundAmount = 100.01
2. Verify HTTP status code is 400 (NOT 200)
3. Verify response body contains error details

Expected Result:
- HTTP 400 Bad Request
- Response body: { "error": "AMOUNT_EXCEEDS_ORIGINAL", "message": "..." }
- NO HTTP 200 with error in body (DPAY-14500 regression)
```

---

### Category 3: RLX_AUTH_AMT_CHECK bypass flag

**Automation priority: P0**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-020  | Bypass amount validation when RLX_AUTH_AMT_CHECK enabled | Critical |
| TC-RF-021  | Enforce amount validation when RLX_AUTH_AMT_CHECK absent | Critical |
| TC-RF-022  | Bypass allows refund exceeding original amount           | Critical |
| TC-RF-023  | Bypass does NOT skip other validations (auth, format)    | High     |
| TC-RF-024  | Flag evaluated per-client, not globally                  | High     |
| TC-RF-025  | Client with flag can still submit valid-amount refund    | Medium   |

#### TC-RF-020: Bypass amount validation when RLX_AUTH_AMT_CHECK enabled

```text
Preconditions:
- Client "MOBILE_APP_WDW" configured with RLX_AUTH_AMT_CHECK = true
- Original transaction amount = $100.00
- Authenticated as MOBILE_APP_WDW

Test Steps:
1. POST /api/v1/refunds/validate with refundAmount = 150.00 (exceeds original)
2. Verify HTTP status code
3. Verify response body indicates eligibility

Expected Result:
- HTTP 200 OK
- Response body: { "eligible": true, ... }
- Amount validation was bypassed due to flag
```

#### TC-RF-021: Enforce amount validation when RLX_AUTH_AMT_CHECK absent

```text
Preconditions:
- Client "WEB_CHECKOUT" does NOT have RLX_AUTH_AMT_CHECK flag
- Original transaction amount = $100.00
- Authenticated as WEB_CHECKOUT

Test Steps:
1. POST /api/v1/refunds/validate with refundAmount = 150.00 (exceeds original)
2. Verify HTTP status code is 400

Expected Result:
- HTTP 400 Bad Request
- Response body: { "error": "AMOUNT_EXCEEDS_ORIGINAL", ... }
- Amount validation enforced (no bypass)
```

---

### Category 4: HTTP status code correctness (DPAY-14500 regression)

**Automation priority: P0 — CRITICAL — DEPLOYMENT GATE**

> ⚠️ **REGRESSION RISK:** DPAY-14500 documented that the legacy endpoint returned HTTP 200
> for ALL responses, including validation failures (errors communicated only via
> `statusCode: 400510003` in the JSON body). The new V1 endpoint MUST use proper HTTP
> semantics. This test category is a hard deployment gate — any failure blocks release.

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-030  | Validation failure returns HTTP 400, not 200             | Critical |
| TC-RF-031  | Missing required field returns HTTP 400, not 200         | Critical |
| TC-RF-032  | Invalid transaction ID returns HTTP 404, not 200         | Critical |
| TC-RF-033  | Unauthorized request returns HTTP 401, not 200           | Critical |
| TC-RF-034  | Forbidden request returns HTTP 403, not 200              | Critical |
| TC-RF-035  | Downstream timeout returns HTTP 502/504, not 200         | Critical |
| TC-RF-036  | Successful validation returns HTTP 200                   | Critical |
| TC-RF-037  | No response EVER has HTTP 200 + error body pattern       | Critical |
| TC-RF-038  | Response Content-Type is application/json                 | High     |

#### TC-RF-037: No response EVER has HTTP 200 + error body pattern

```text
Preconditions:
- Comprehensive set of invalid/error inputs prepared
- Includes: missing fields, invalid amounts, expired transactions,
  unauthorized requests, malformed JSON

Test Steps:
1. Send 50+ distinct invalid/error requests to /api/v1/refunds/validate
2. For EVERY response with HTTP 200:
   - Parse response body
   - Assert body does NOT contain error indicators (statusCode != success,
     statusMessage == FAILURE, error field present)
3. For EVERY response with error body content:
   - Assert HTTP status code is NOT 200

Expected Result:
- Zero instances of HTTP 200 + error body pattern
- ALL errors use appropriate 4xx/5xx codes
- This is a HARD PASS/FAIL — no partial credit
```

---

### Category 5: Authentication and authorization

**Automation priority: P0**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-040  | Reject request with missing Authorization header         | Critical |
| TC-RF-041  | Reject request with expired token                        | Critical |
| TC-RF-042  | Reject request with invalid token signature              | Critical |
| TC-RF-043  | Reject request from unauthorized client                  | High     |
| TC-RF-044  | Accept request with valid service-to-service token       | Critical |
| TC-RF-045  | Accept request with valid user + service token           | High     |
| TC-RF-046  | Enforce property-level access (WDW client can't refund DLR) | Medium |

---

### Category 6: Input validation

**Automation priority: P0**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-050  | Reject missing transactionId                             | Critical |
| TC-RF-051  | Reject missing refundAmount                              | Critical |
| TC-RF-052  | Reject malformed JSON body                               | Critical |
| TC-RF-053  | Reject empty request body                                | High     |
| TC-RF-054  | Reject non-numeric refundAmount                          | High     |
| TC-RF-055  | Reject transactionId with SQL injection attempt          | High     |
| TC-RF-056  | Reject transactionId with XSS payload                   | High     |
| TC-RF-057  | Reject request with unsupported Content-Type             | Medium   |
| TC-RF-058  | Reject excessively large request body (>1MB)             | Medium   |
| TC-RF-059  | Handle unicode/special characters in reason field        | Low      |
| TC-RF-060  | Reject unknown/extra fields (strict mode) or ignore them | Low      |

---

### Category 7: Concurrency and idempotency

**Automation priority: P1**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-070  | Concurrent validation requests for same transaction      | High     |
| TC-RF-071  | Validation during active refund processing               | High     |
| TC-RF-072  | Rapid duplicate submissions return consistent results    | High     |
| TC-RF-073  | Race condition: transaction state changes mid-validation | Medium   |
| TC-RF-074  | Idempotent response for identical requests               | Medium   |

---

### Category 8: Performance

**Automation priority: P1**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-080  | Response time p95 < 500ms under normal load              | Critical |
| TC-RF-081  | Response time p99 < 1000ms under normal load             | High     |
| TC-RF-082  | Sustain 200 req/s for 5 minutes without degradation      | High     |
| TC-RF-083  | Graceful degradation under 2x expected load              | Medium   |
| TC-RF-084  | No connection pool exhaustion under sustained load       | High     |
| TC-RF-085  | Error responses are as fast as success responses         | Medium   |

---

### Category 9: Integration with downstream services

**Automation priority: P1**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-090  | Correctly fetches transaction from payment-session       | Critical |
| TC-RF-091  | Correctly reads client config from config-services       | Critical |
| TC-RF-092  | Handles payment-session unavailability gracefully        | High     |
| TC-RF-093  | Handles config-services unavailability gracefully        | High     |
| TC-RF-094  | Handles slow downstream response (timeout at 5s)        | High     |
| TC-RF-095  | Circuit breaker activates after repeated failures        | Medium   |
| TC-RF-096  | Downstream 500 does not expose internal details          | High     |

---

### Category 10: API contract validation

**Automation priority: P0**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-100  | Success response matches OpenAPI schema                  | Critical |
| TC-RF-101  | Error response matches OpenAPI schema                    | Critical |
| TC-RF-102  | All documented error codes are reachable                 | High     |
| TC-RF-103  | No undocumented fields in responses                      | Medium   |
| TC-RF-104  | Backward-compatible with BFF consumer expectations       | Critical |
| TC-RF-105  | Response headers include standard fields (X-Request-Id)  | Medium   |

#### Expected request schema

```json
{
  "transactionId": "string (required)",
  "refundAmount": "number (required, > 0)",
  "currency": "string (required, ISO 4217)",
  "reason": "string (optional)",
  "requestedBy": "string (required)",
  "property": "string (required, enum: WDW|DLR|DCL|DLP)",
  "clientId": "string (required)"
}
```

#### Expected success response (HTTP 200)

```json
{
  "eligible": true,
  "transactionId": "string",
  "maxRefundAmount": 100.00,
  "originalAmount": 100.00,
  "previousRefunds": 0.00,
  "validUntil": "2026-07-26T09:30:00Z"
}
```

#### Expected error response (HTTP 4xx)

```json
{
  "error": "AMOUNT_EXCEEDS_ORIGINAL",
  "message": "Refund amount $150.00 exceeds remaining refundable amount $100.00",
  "transactionId": "string",
  "timestamp": "2026-07-26T09:11:43Z",
  "traceId": "string"
}
```

---

### Category 11: Security (PCI-DSS context)

**Automation priority: P1**

| ID         | Title                                                    | Priority |
|------------|----------------------------------------------------------|:--------:|
| TC-RF-110  | No PAN/card number in request or response bodies         | Critical |
| TC-RF-111  | No CVV/CVC data in any payload                           | Critical |
| TC-RF-112  | Sensitive fields masked in application logs              | Critical |
| TC-RF-113  | TLS 1.2+ enforced (no plaintext HTTP)                    | Critical |
| TC-RF-114  | Error responses do not leak internal stack traces        | High     |
| TC-RF-115  | Error responses do not expose database details           | High     |
| TC-RF-116  | Rate limiting prevents brute-force transaction probing   | High     |
| TC-RF-117  | Request logging excludes sensitive payment data          | Critical |
| TC-RF-118  | Audit trail created for each validation attempt          | Medium   |

---

## Risks

| Risk                                                          | Likelihood | Impact   | Mitigation                                                      |
|---------------------------------------------------------------|:----------:|:--------:|----------------------------------------------------------------|
| DPAY-14500 regression (200 + error body pattern returns)      |   Medium   | Critical | Dedicated regression suite as deployment gate                   |
| RLX_AUTH_AMT_CHECK misconfiguration allows unintended bypass  |   Medium   |   High   | Test per-client flag isolation; audit config-services data      |
| Connection pool exhaustion cascade (known platform risk)      |    Low     | Critical | Load test with connection pool monitoring; circuit breakers     |
| Multi-property differences cause inconsistent behavior        |   Medium   |  Medium  | Test all 4 properties explicitly; parameterized test data       |
| Downstream service unavailability during validation           |   Medium   |   High   | Integration tests with fault injection; timeout + fallback      |
| PCI-DSS violation from logging payment data in errors         |    Low     | Critical | Security scan; log audit; no card data in request schema       |
| BFF consumers expect legacy 200 + error body format           |   Medium   |   High   | Contract tests; coordinate migration with payment-controls-api  |

---

## Schedule

| Phase              | Duration | Dates (Target)        |
|--------------------|:--------:|-----------------------|
| Test design        |  3 days  | Sprint planning       |
| Test data setup    |  2 days  | Parallel with design  |
| Unit test review   |  1 day   | After code complete   |
| Integration tests  |  3 days  | After deploy to Latest|
| Regression + E2E   |  2 days  | After Stage deploy    |
| Performance tests  |  2 days  | Load environment      |
| Security review    |  1 day   | Before Prod deploy    |

---

## Automation strategy

| Category                        | Framework / Tool     | Priority | Run frequency     |
|---------------------------------|----------------------|:--------:|-------------------|
| Unit (validation logic)         | JUnit 5 + Mockito   |    P0    | Every build       |
| Integration (HTTP)              | Spring Boot Test     |    P0    | Every build       |
| DPAY-14500 regression           | JUnit 5 + RestAssured|   P0    | Every build (gate)|
| Contract validation             | OpenAPI validator    |    P0    | Every build       |
| Security (static)               | OWASP ZAP / Snyk    |    P1    | Nightly           |
| Performance                     | Gatling / k6        |    P1    | Pre-release       |
| E2E (multi-service)             | Bruno / RestAssured  |    P2    | Pre-release       |

---

## Dependencies

- payment-session service available in test environments
- config-services with `RLX_AUTH_AMT_CHECK` flag test data
- Valid OAuth/JWT tokens for test service accounts
- OpenAPI spec published and finalized
- Test transaction data seeded across all properties
- Harness pipeline updated with regression gate step

---

## Appendix: DPAY-14500 context

**Summary:** Legacy refund validation endpoint (`/refunds/validate` pre-V1) returned HTTP 200 for ALL responses. Validation failures were communicated only via JSON body fields (`statusCode: 400510003`, `statusMessage: FAILURE`). This violated HTTP semantics and caused silent failures in consumers that checked HTTP status codes.

**Root cause:** Controller always returned `ResponseEntity.ok()` regardless of validation outcome.

**Fix requirement:** V1 endpoint MUST map validation failures to appropriate HTTP 4xx status codes:

| Scenario                    | Correct HTTP Status |
|-----------------------------|:-------------------:|
| Valid refund                |         200         |
| Amount exceeds original     |         400         |
| Missing required field      |         400         |
| Transaction not found       |         404         |
| Unauthorized                |         401         |
| Forbidden                   |         403         |
| Downstream failure          |       502/504       |
| Rate limited                |         429         |

**Regression test strategy:** TC-RF-030 through TC-RF-038 form a mandatory deployment gate. If ANY test in this category fails, the deployment pipeline MUST halt.
