# Test Plan: POST /api/v1/refunds/validate

| Field            | Value                                              |
|------------------|-----------------------------------------------------|
| Service          | DPAY (Disney Payments) — Spring Boot (Java)         |
| Endpoint         | `POST /api/v1/refunds/validate`                     |
| Author           | test-plan agent                                     |
| Created          | 2026-07-03                                          |
| Related Bug      | DPAY-14500 (HTTP 200 on validation failure)         |
| Review Status    | Draft                                               |

---

## Objective

Validate that the refund validation endpoint:

1. Returns correct HTTP status codes (400/422) on validation failures — never HTTP 200 with an error body.
2. Enforces `RefundTransactionValidator.validateRefundAmount()` when `RLX_AUTH_AMT_CHECK` is disabled.
3. Bypasses amount validation when `RLX_AUTH_AMT_CHECK` is enabled for a configured client.
4. Returns a well-structured error response with `statusCode` and `statusMessage` fields.

---

## Regression context — DPAY-14500

| Aspect       | Detail                                                                                         |
|--------------|------------------------------------------------------------------------------------------------|
| Root cause   | `SharedPayment.java` unconditionally returned `Response.ok()` regardless of validation result  |
| Symptom      | HTTP 200 returned with `statusCode: 400510003`, `statusMessage: FAILURE` in body               |
| Fix          | Controller now maps validation failures to HTTP 400/422 before serializing the error body       |
| Risk         | Any refactoring of the response-building path could reintroduce the bug                        |

---

## Test environment prerequisites

- Spring Boot service running (local or Latest environment)
- Valid OAuth2/JWT token with `refund:validate` scope
- Test transaction IDs with known auth amounts in the test database
- `RLX_AUTH_AMT_CHECK` flag togglable per client in config (feature flag service or DB)
- Downstream payment gateway stub/mock available

---

## 1. Functional tests — happy path

| Test ID     | Priority | Description                                                  | Preconditions                                          | Request                                                                                                       | Expected Result                                                                                              |
|-------------|:--------:|--------------------------------------------------------------|--------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------|
| FUN-HP-001  |    P0    | Valid full refund within auth amount                         | Transaction exists, amount ≤ auth amount               | `{ "transactionId": "TXN-001", "refundAmount": 50.00, "currency": "USD" }`                                   | HTTP 200, body `{ "valid": true, "statusCode": "000000000", "statusMessage": "SUCCESS" }`                    |
| FUN-HP-002  |    P0    | Valid partial refund within auth amount                      | Transaction exists, partial amount < auth amount       | `{ "transactionId": "TXN-002", "refundAmount": 25.00, "currency": "USD" }`                                   | HTTP 200, body `{ "valid": true, "statusCode": "000000000", "statusMessage": "SUCCESS" }`                    |
| FUN-HP-003  |    P1    | Valid refund with all optional fields populated              | Transaction exists                                     | Full payload with `reason`, `requestedBy`, `metadata`                                                         | HTTP 200, valid response with all echoed fields                                                              |
| FUN-HP-004  |    P1    | Valid refund for zero-amount (fee-only refund if supported)  | Transaction exists, zero-amount allowed by config      | `{ "transactionId": "TXN-003", "refundAmount": 0.00, "currency": "USD" }`                                    | HTTP 200 or HTTP 422 depending on business rules — document actual behavior                                  |

---

## 2. Functional tests — negative / failure paths

| Test ID     | Priority | Description                                                         | Preconditions                            | Request                                                                              | Expected Result                                                                                               |
|-------------|:--------:|---------------------------------------------------------------------|------------------------------------------|--------------------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------|
| FUN-NEG-001 |    P0    | Refund amount exceeds original auth amount                          | Auth amount = 100.00, `RLX_AUTH_AMT_CHECK` OFF | `{ "transactionId": "TXN-004", "refundAmount": 150.00, "currency": "USD" }`         | **HTTP 400**, body `{ "statusCode": "400510003", "statusMessage": "FAILURE", "errors": [...] }`              |
| FUN-NEG-002 |    P0    | Transaction ID does not exist                                       | No such transaction in DB                | `{ "transactionId": "TXN-INVALID", "refundAmount": 10.00, "currency": "USD" }`      | HTTP 404 or HTTP 422, meaningful error message                                                                |
| FUN-NEG-003 |    P0    | Transaction already fully refunded                                  | Previous full refund already processed   | `{ "transactionId": "TXN-005", "refundAmount": 50.00, "currency": "USD" }`          | HTTP 422, `statusMessage` indicates already refunded                                                          |
| FUN-NEG-004 |    P1    | Cumulative partial refunds exceed auth amount                       | Prior refunds sum to 90.00, auth = 100   | `{ "transactionId": "TXN-006", "refundAmount": 20.00, "currency": "USD" }`          | HTTP 400, over-limit error                                                                                    |
| FUN-NEG-005 |    P1    | Currency mismatch with original transaction                         | Original txn in USD                      | `{ "transactionId": "TXN-007", "refundAmount": 50.00, "currency": "EUR" }`          | HTTP 422, currency mismatch error                                                                             |
| FUN-NEG-006 |    P2    | Transaction in non-refundable state (e.g., voided or pending)       | Transaction status = VOIDED              | `{ "transactionId": "TXN-008", "refundAmount": 10.00, "currency": "USD" }`          | HTTP 422, transaction state error                                                                             |

---

## 3. Validation tests — field-level

| Test ID     | Priority | Description                        | Request Mutation                                | Expected Result                                               |
|-------------|:--------:|------------------------------------|-------------------------------------------------|---------------------------------------------------------------|
| VAL-001     |    P0    | Missing `transactionId`            | Omit `transactionId` field                      | HTTP 400, field-level error for `transactionId`               |
| VAL-002     |    P0    | Missing `refundAmount`             | Omit `refundAmount` field                       | HTTP 400, field-level error for `refundAmount`                |
| VAL-003     |    P0    | Missing `currency`                 | Omit `currency` field                           | HTTP 400, field-level error for `currency`                    |
| VAL-004     |    P0    | Negative refund amount             | `"refundAmount": -10.00`                        | HTTP 400, amount must be non-negative                         |
| VAL-005     |    P1    | Non-numeric refund amount          | `"refundAmount": "abc"`                         | HTTP 400, type validation error                               |
| VAL-006     |    P1    | Invalid currency code              | `"currency": "XXX"`                             | HTTP 400 or 422, unsupported currency                         |
| VAL-007     |    P1    | Empty request body                 | `{}`                                            | HTTP 400, multiple field errors                               |
| VAL-008     |    P2    | Extremely long `transactionId`     | 500-char string                                 | HTTP 400, length validation                                   |
| VAL-009     |    P2    | `refundAmount` with excess decimal | `"refundAmount": 10.999`                        | HTTP 400 or rounded — document behavior                       |
| VAL-010     |    P2    | Null values for required fields    | `"transactionId": null`                         | HTTP 400, null validation error                               |

---

## 4. Business rule tests — RLX_AUTH_AMT_CHECK flag

| Test ID     | Priority | Description                                                                  | Preconditions                                                | Request                                                                          | Expected Result                                                                  |
|-------------|:--------:|------------------------------------------------------------------------------|--------------------------------------------------------------|----------------------------------------------------------------------------------|----------------------------------------------------------------------------------|
| BIZ-RLX-001 |    P0    | Amount exceeds auth — flag ENABLED for client → validation bypassed          | Client configured with `RLX_AUTH_AMT_CHECK = true`           | `{ "transactionId": "TXN-009", "refundAmount": 999.00, "currency": "USD" }`     | HTTP 200, `valid: true` — amount check skipped                                   |
| BIZ-RLX-002 |    P0    | Amount exceeds auth — flag DISABLED for client → validation enforced         | Client configured with `RLX_AUTH_AMT_CHECK = false`          | `{ "transactionId": "TXN-009", "refundAmount": 999.00, "currency": "USD" }`     | HTTP 400, over-limit error from `validateRefundAmount()`                         |
| BIZ-RLX-003 |    P0    | Amount within auth — flag DISABLED → passes normally                         | Client with flag OFF, amount ≤ auth                          | `{ "transactionId": "TXN-010", "refundAmount": 10.00, "currency": "USD" }`      | HTTP 200, `valid: true`                                                          |
| BIZ-RLX-004 |    P1    | Flag not configured for client (missing) → defaults to enforced              | No flag entry for client                                     | Over-limit amount                                                                | HTTP 400, over-limit error (safe default)                                        |
| BIZ-RLX-005 |    P1    | Flag toggled mid-request (race condition) — verify consistent behavior       | Flag flipped during test window                              | Over-limit amount                                                                | Consistent result (no partial enforcement)                                       |
| BIZ-RLX-006 |    P2    | Flag enabled but other validations still run (txn existence, currency, etc.) | Flag ON, invalid txn ID                                      | `{ "transactionId": "INVALID", "refundAmount": 999.00, "currency": "USD" }`     | HTTP 404/422 — only amount check is bypassed, not all validation                 |

---

## 5. HTTP status code regression tests (DPAY-14500)

| Test ID     | Priority | Description                                                                       | Assertion                                                                                     |
|-------------|:--------:|-----------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------|
| REG-001     |    P0    | Over-limit refund returns HTTP 400, NOT HTTP 200                                  | `response.status == 400` AND `body.statusCode == "400510003"`                                 |
| REG-002     |    P0    | Missing required field returns HTTP 400, NOT HTTP 200                             | `response.status == 400` AND `body.statusMessage != "SUCCESS"`                                |
| REG-003     |    P0    | Invalid transaction returns HTTP 4xx, NOT HTTP 200                                | `response.status >= 400 && response.status < 500`                                             |
| REG-004     |    P0    | Successful validation returns HTTP 200 WITH `statusMessage: "SUCCESS"`            | `response.status == 200` AND `body.statusMessage == "SUCCESS"` (confirm true positive)        |
| REG-005     |    P0    | No 200 response ever contains `statusMessage: "FAILURE"`                          | For ALL test cases: `if response.status == 200 then body.statusMessage != "FAILURE"`          |
| REG-006     |    P1    | Error body always contains both `statusCode` and `statusMessage`                  | All 4xx responses have both fields present and non-null                                       |
| REG-007     |    P1    | HTTP status and body status are always consistent (no contradictions)             | Never `200 + FAILURE` or `400 + SUCCESS`                                                      |

---

## 6. Security tests

| Test ID     | Priority | Description                                          | Preconditions             | Expected Result                                         |
|-------------|:--------:|------------------------------------------------------|---------------------------|---------------------------------------------------------|
| SEC-001     |    P0    | No auth token — request rejected                     | Omit Authorization header | HTTP 401 Unauthorized                                   |
| SEC-002     |    P0    | Expired token — request rejected                     | Token past expiry         | HTTP 401 Unauthorized                                   |
| SEC-003     |    P0    | Token missing `refund:validate` scope                | Valid token, wrong scope  | HTTP 403 Forbidden                                      |
| SEC-004     |    P1    | Token for different client cannot validate other txns | Client A token, Client B txn | HTTP 403 or HTTP 404 (no info leakage)               |
| SEC-005     |    P1    | SQL injection in `transactionId`                     | `"transactionId": "'; DROP TABLE--"` | HTTP 400, no DB error leak                     |
| SEC-006     |    P1    | XSS payload in string fields                         | `<script>` in reason field | Sanitized/rejected, no reflection in response          |
| SEC-007     |    P2    | Oversized payload (body > 1MB)                       | Large JSON body            | HTTP 413 or HTTP 400, request rejected before parsing   |
| SEC-008     |    P2    | Rate limiting enforced                               | 100+ requests in 1 second  | HTTP 429 after threshold                                |

---

## 7. Integration tests

| Test ID     | Priority | Description                                                    | Dependencies                | Expected Result                                                     |
|-------------|:--------:|----------------------------------------------------------------|-----------------------------|---------------------------------------------------------------------|
| INT-001     |    P0    | Valid request reaches downstream payment gateway for txn lookup | Payment gateway mock/stub   | Gateway called with correct txn ID, response used for validation    |
| INT-002     |    P1    | Gateway timeout — graceful error returned                      | Gateway configured with 30s delay | HTTP 504 or HTTP 500 with timeout message                     |
| INT-003     |    P1    | Gateway returns 500 — service returns proper error             | Gateway returns 500         | HTTP 502 or 500, no raw gateway error leaked                        |
| INT-004     |    P1    | Database unavailable — service returns proper error            | DB connection severed       | HTTP 503, retry-after header if applicable                          |
| INT-005     |    P2    | Feature flag service unavailable — defaults to safe behavior   | Flag service down           | `RLX_AUTH_AMT_CHECK` defaults to OFF (enforce validation)           |

---

## 8. Edge cases and boundary conditions

| Test ID     | Priority | Description                                                | Input                                                | Expected Result                                          |
|-------------|:--------:|------------------------------------------------------------|----------------------------------------------------|----------------------------------------------------------|
| EDGE-001    |    P1    | Refund amount exactly equal to auth amount                 | `refundAmount == authAmount` (e.g., both 100.00)   | HTTP 200, valid (boundary inclusive)                     |
| EDGE-002    |    P1    | Refund amount is $0.01 over auth amount                    | `authAmount = 100.00`, `refundAmount = 100.01`     | HTTP 400, over-limit                                     |
| EDGE-003    |    P1    | Refund amount $0.01 (minimum possible)                     | `refundAmount = 0.01`                              | HTTP 200 if txn exists and has sufficient auth           |
| EDGE-004    |    P2    | Maximum representable amount (e.g., 999999999.99)          | Very large refund amount                           | HTTP 400 over-limit or HTTP 422 max-amount exceeded      |
| EDGE-005    |    P2    | Concurrent validation requests for same transaction        | Two parallel requests for same txn                 | Both return consistent results, no double-counting       |
| EDGE-006    |    P2    | Unicode/special characters in optional fields              | Emoji in `reason` field                            | Accepted or rejected gracefully, no 500                  |
| EDGE-007    |    P2    | Idempotent validation — same request twice returns same    | Identical request sent twice                       | Same HTTP status and body both times                     |
| EDGE-008    |    P3    | Integer amount (no decimals)                               | `refundAmount: 50` (no `.00`)                      | Accepted, treated as 50.00                               |

---

## 9. Performance considerations

| Test ID     | Priority | Description                                    | Threshold                  | Notes                                                    |
|-------------|:--------:|------------------------------------------------|----------------------------|----------------------------------------------------------|
| PERF-001    |    P1    | Response time under normal load                | p95 < 500ms               | Single valid request                                     |
| PERF-002    |    P1    | Response time under validation failure path    | p95 < 300ms               | Failures should be faster (no downstream call)           |
| PERF-003    |    P2    | Throughput at steady state                     | ≥ 200 req/sec             | Sustained for 60 seconds                                 |
| PERF-004    |    P2    | No memory leak under repeated calls            | Heap stable over 10 min   | Monitor with `-XX:+HeapDumpOnOutOfMemoryError`           |
| PERF-005    |    P3    | Graceful degradation under 5x normal load      | No 5xx errors, latency ≤ 2s | Circuit breakers engage before OOM                     |

---

## 10. Error response structure validation

All error responses (HTTP 4xx) must conform to this schema:

```json
{
  "statusCode": "string (9-digit code)",
  "statusMessage": "FAILURE",
  "errors": [
    {
      "field": "string (optional)",
      "code": "string",
      "message": "string (human-readable)"
    }
  ],
  "timestamp": "ISO-8601 datetime",
  "path": "/api/v1/refunds/validate"
}
```

| Test ID     | Priority | Assertion                                                        |
|-------------|:--------:|------------------------------------------------------------------|
| ERR-001     |    P0    | All 4xx responses contain `statusCode` field                     |
| ERR-002     |    P0    | All 4xx responses contain `statusMessage` = `"FAILURE"`          |
| ERR-003     |    P1    | `errors` array is present and non-empty for validation failures  |
| ERR-004     |    P1    | `timestamp` is valid ISO-8601                                    |
| ERR-005     |    P2    | `path` matches the requested endpoint                            |
| ERR-006     |    P2    | No stack traces or internal class names in error responses        |

---

## Test execution strategy

### Automation

- Unit tests: JUnit 5 + Mockito for `RefundTransactionValidator` and controller layer
- Integration tests: `@SpringBootTest` with `@AutoConfigureMockMvc` or TestRestTemplate
- Contract tests: Spring Cloud Contract or Pact for downstream gateway
- Regression suite: Tag DPAY-14500 tests with `@Tag("regression-14500")` for CI gating

### CI pipeline gates

- REG-001 through REG-007 must pass on every PR — block merge on failure
- All P0 tests run in CI on every commit
- P1/P2 tests run nightly or on release branches
- Performance tests run weekly or before release

### Manual testing (if required)

- SEC-008 (rate limiting) may need infrastructure-level validation
- PERF-005 (degradation) requires load testing tooling (Gatling/k6)

---

## Traceability matrix

| Requirement                          | Test IDs                                           |
|--------------------------------------|-----------------------------------------------------|
| Correct HTTP status on failure       | REG-001, REG-002, REG-003, REG-005, REG-007        |
| RLX_AUTH_AMT_CHECK bypass            | BIZ-RLX-001, BIZ-RLX-003, BIZ-RLX-006             |
| RLX_AUTH_AMT_CHECK enforcement       | BIZ-RLX-002, BIZ-RLX-004                           |
| validateRefundAmount() logic         | FUN-NEG-001, FUN-NEG-004, EDGE-001, EDGE-002       |
| Error response structure             | ERR-001 through ERR-006                             |
| Authentication/authorization         | SEC-001 through SEC-004                             |
| Input sanitization                   | SEC-005, SEC-006, VAL-005, VAL-008                  |
| Downstream resilience                | INT-002, INT-003, INT-004, INT-005                  |
| DPAY-14500 non-regression            | REG-001 through REG-007                             |
