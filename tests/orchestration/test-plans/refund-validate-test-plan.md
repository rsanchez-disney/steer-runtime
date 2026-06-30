# Test plan — POST /api/v1/refunds/validate

## Overview

| Attribute        | Value                                              |
|------------------|-----------------------------------------------------|
| Endpoint         | `POST /api/v1/refunds/validate`                    |
| Service          | Spring Boot (Java) microservice                    |
| Domain           | Payment validation — refund request pre-processing |
| Authentication   | Bearer token (OAuth2)                              |
| Date created     | 2026-06-30                                         |
| Author           | Test Planning Agent                                |

---

## 1. Scope

### In-scope

- Request payload validation (structure, types, required fields)
- Business rule validation (amount limits, duplicate detection, transaction state)
- Authentication and authorization enforcement
- HTTP response codes and error response contract
- Integration with transaction lookup (verify referenced transaction exists)
- Unit tests for validator and service logic
- API-level contract tests
- Performance baseline for validation throughput

### Out-of-scope

- Actual refund processing/execution (this endpoint only validates)
- Payment gateway integration
- Downstream ledger updates
- UI/frontend testing
- Load testing at scale (covered by separate performance plan)
- Database migration testing

---

## 2. Test strategy

| Layer              | Tool / Framework       | Focus                                                  |
|--------------------|------------------------|--------------------------------------------------------|
| Unit               | JUnit 5 + Mockito      | Validators, service logic, mappers                     |
| Integration        | Spring Boot Test + H2  | Controller → service → repository flow                 |
| API / Contract     | MockMvc / RestAssured  | HTTP contract, status codes, response shape            |
| Security           | Spring Security Test   | Auth enforcement, role-based access                    |
| Performance        | JMH / Gatling          | Baseline latency and throughput under concurrent load  |

### Test pyramid distribution

- Unit tests: ~60% (validators, business rules, mappers)
- Integration tests: ~25% (controller + service + persistence)
- API contract tests: ~15% (end-to-end HTTP validation)

---

## 3. Detailed test cases

### 3.1 Happy path / positive scenarios

| ID       | Title                                           | Priority | Type        | Preconditions                                             | Steps                                                                                                                                     | Expected result                                                                                           |
|----------|--------------------------------------------------|----------|-------------|-----------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------|
| HP-001   | Valid full refund request passes validation      | P0       | Integration | Valid Bearer token; original transaction exists and is settled | POST with valid `transactionRef`, `amount` equal to original, `reason: "customer_request"`, `currency: "USD"`                            | 200 OK; body contains `{ "valid": true, "errors": [] }`                                                  |
| HP-002   | Valid partial refund request passes validation   | P0       | Integration | Valid Bearer token; original transaction exists and is settled | POST with valid `transactionRef`, `amount` less than original, `reason: "partial_return"`, `currency: "USD"`                             | 200 OK; body contains `{ "valid": true, "errors": [] }`                                                  |
| HP-003   | Minimum allowed refund amount passes             | P1       | Unit        | Minimum amount threshold configured (e.g., $0.01)         | POST with `amount: 0.01`, valid transaction ref                                                                                          | 200 OK; validation passes                                                                                |
| HP-004   | Maximum allowed refund amount passes             | P1       | Unit        | Transaction amount is $10,000.00                          | POST with `amount: 10000.00` (full refund at max)                                                                                        | 200 OK; validation passes                                                                                |
| HP-005   | All supported reason codes accepted              | P1       | Unit        | Supported reasons: `customer_request`, `duplicate`, `fraud`, `partial_return`, `service_issue` | POST once per reason code with otherwise valid payload                                                                                    | 200 OK for each reason code                                                                              |
| HP-006   | Request with optional metadata field passes      | P2       | Integration | Valid token; valid transaction                            | POST with valid required fields plus optional `metadata: { "note": "customer called" }`                                                  | 200 OK; optional field accepted without error                                                            |

### 3.2 Input validation — missing fields, invalid formats, boundary values

| ID       | Title                                            | Priority | Type   | Preconditions     | Steps                                                          | Expected result                                                                                     |
|----------|--------------------------------------------------|----------|--------|-------------------|----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------|
| IV-001   | Missing `transactionRef` returns 400             | P0       | Unit   | Valid Bearer token | POST with body missing `transactionRef` field                  | 400 Bad Request; error body lists `transactionRef` as required                                      |
| IV-002   | Missing `amount` returns 400                     | P0       | Unit   | Valid Bearer token | POST with body missing `amount` field                          | 400 Bad Request; error body lists `amount` as required                                              |
| IV-003   | Missing `reason` returns 400                     | P0       | Unit   | Valid Bearer token | POST with body missing `reason` field                          | 400 Bad Request; error body lists `reason` as required                                              |
| IV-004   | Missing `currency` returns 400                   | P0       | Unit   | Valid Bearer token | POST with body missing `currency` field                        | 400 Bad Request; error body lists `currency` as required                                            |
| IV-005   | Null `amount` returns 400                        | P1       | Unit   | Valid Bearer token | POST with `"amount": null`                                     | 400 Bad Request; error indicates amount must not be null                                            |
| IV-006   | Negative `amount` returns 400                    | P0       | Unit   | Valid Bearer token | POST with `"amount": -5.00`                                    | 400 Bad Request; error indicates amount must be positive                                            |
| IV-007   | Zero `amount` returns 400                        | P0       | Unit   | Valid Bearer token | POST with `"amount": 0.00`                                     | 400 Bad Request; error indicates amount must be greater than zero                                   |
| IV-008   | Non-numeric `amount` returns 400                 | P1       | Unit   | Valid Bearer token | POST with `"amount": "abc"`                                    | 400 Bad Request; error indicates invalid type for amount                                            |
| IV-009   | Amount with excessive decimal places returns 400 | P1       | Unit   | Valid Bearer token | POST with `"amount": 10.999`                                   | 400 Bad Request; error indicates max 2 decimal places for USD                                       |
| IV-010   | Invalid `currency` code returns 400              | P1       | Unit   | Valid Bearer token | POST with `"currency": "XXX"`                                  | 400 Bad Request; error indicates unsupported currency                                               |
| IV-011   | Empty string `transactionRef` returns 400        | P1       | Unit   | Valid Bearer token | POST with `"transactionRef": ""`                               | 400 Bad Request; error indicates transactionRef must not be blank                                   |
| IV-012   | TransactionRef exceeding max length returns 400  | P2       | Unit   | Valid Bearer token | POST with `transactionRef` of 256+ characters                  | 400 Bad Request; error indicates max length exceeded                                                |
| IV-013   | Invalid `reason` code returns 400                | P1       | Unit   | Valid Bearer token | POST with `"reason": "invalid_reason"`                         | 400 Bad Request; error indicates unsupported reason code                                            |
| IV-014   | Empty request body returns 400                   | P0       | API    | Valid Bearer token | POST with empty body                                           | 400 Bad Request; error indicates request body is required                                           |
| IV-015   | Malformed JSON returns 400                       | P1       | API    | Valid Bearer token | POST with `Content-Type: application/json` and invalid JSON    | 400 Bad Request; error indicates malformed request body                                             |
| IV-016   | Wrong Content-Type header returns 415            | P2       | API    | Valid Bearer token | POST with `Content-Type: text/plain`                           | 415 Unsupported Media Type                                                                          |
| IV-017   | Extra unknown fields are ignored                 | P2       | Unit   | Valid Bearer token | POST with valid fields plus `"unknownField": "value"`          | 200 OK; unknown fields silently ignored (or 400 if strict mode)                                     |

### 3.3 Business rule validation

| ID       | Title                                                      | Priority | Type        | Preconditions                                                       | Steps                                                                      | Expected result                                                                                    |
|----------|------------------------------------------------------------|----------|-------------|---------------------------------------------------------------------|----------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------|
| BR-001   | Refund amount exceeding original transaction returns 422   | P0       | Integration | Original transaction amount is $50.00                               | POST with `"amount": 75.00`                                                | 422 Unprocessable Entity; error indicates refund exceeds original amount                           |
| BR-002   | Cumulative refunds exceeding original returns 422          | P0       | Integration | Original $100.00; previous refund of $80.00 already processed       | POST with `"amount": 30.00`                                                | 422 Unprocessable Entity; error indicates cumulative refunds exceed original                       |
| BR-003   | Duplicate refund request returns 409                       | P0       | Integration | Identical refund request submitted and pending/processed             | POST with same `transactionRef`, `amount`, and `reason` as existing refund | 409 Conflict; error indicates duplicate refund detected                                           |
| BR-004   | Refund for expired transaction returns 422                 | P1       | Integration | Transaction older than refund window (e.g., 180 days)               | POST with `transactionRef` pointing to expired transaction                 | 422 Unprocessable Entity; error indicates transaction outside refund window                        |
| BR-005   | Refund for voided transaction returns 422                  | P1       | Integration | Transaction status is `VOIDED`                                      | POST with `transactionRef` pointing to voided transaction                  | 422 Unprocessable Entity; error indicates transaction not eligible for refund                      |
| BR-006   | Refund for pending (unsettled) transaction returns 422     | P1       | Integration | Transaction status is `PENDING`                                     | POST with `transactionRef` pointing to unsettled transaction               | 422 Unprocessable Entity; error indicates transaction must be settled before refund                |
| BR-007   | Transaction not found returns 404                          | P0       | Integration | No transaction with given reference exists                          | POST with `"transactionRef": "TXN-NONEXISTENT-123"`                        | 404 Not Found; error indicates transaction reference not found                                    |
| BR-008   | Currency mismatch with original transaction returns 422    | P1       | Integration | Original transaction in USD                                         | POST with `"currency": "EUR"` for a USD transaction                        | 422 Unprocessable Entity; error indicates currency mismatch                                       |
| BR-009   | Refund for already fully refunded transaction returns 422  | P0       | Integration | Transaction has been 100% refunded                                  | POST with any amount for fully refunded transaction                        | 422 Unprocessable Entity; error indicates transaction already fully refunded                      |
| BR-010   | Refund amount below minimum threshold returns 422          | P2       | Unit        | Minimum refund amount configured (e.g., $0.01)                      | POST with `"amount": 0.001`                                                | 422 Unprocessable Entity; error indicates amount below minimum                                    |
| BR-011   | Refund for transaction in dispute returns 422              | P2       | Integration | Transaction status is `DISPUTED`                                    | POST with `transactionRef` pointing to disputed transaction                | 422 Unprocessable Entity; error indicates transaction under dispute                               |

### 3.4 Authentication and authorization

| ID       | Title                                            | Priority | Type     | Preconditions                        | Steps                                                      | Expected result                                                  |
|----------|--------------------------------------------------|----------|----------|--------------------------------------|------------------------------------------------------------|------------------------------------------------------------------|
| AU-001   | Missing Authorization header returns 401         | P0       | API      | No auth header                       | POST valid body without `Authorization` header             | 401 Unauthorized; `WWW-Authenticate` header present              |
| AU-002   | Invalid Bearer token returns 401                 | P0       | API      | Expired or malformed token           | POST with `Authorization: Bearer invalid-token-xyz`        | 401 Unauthorized                                                 |
| AU-003   | Expired Bearer token returns 401                 | P0       | API      | Token with past expiration           | POST with expired but structurally valid JWT               | 401 Unauthorized                                                 |
| AU-004   | Valid token without required role returns 403    | P1       | API      | Token with read-only role            | POST with token lacking `refund:validate` permission       | 403 Forbidden; error indicates insufficient permissions          |
| AU-005   | Valid token with correct role succeeds           | P0       | API      | Token with `refund:validate` role    | POST with valid payload and properly scoped token          | 200 OK (or appropriate validation result)                        |
| AU-006   | Token with wrong issuer returns 401              | P2       | API      | Token signed by untrusted issuer     | POST with token from different identity provider           | 401 Unauthorized                                                 |
| AU-007   | Malformed Authorization header returns 401       | P2       | API      | Header value is not `Bearer <token>` | POST with `Authorization: Basic dXNlcjpwYXNz`             | 401 Unauthorized                                                 |

### 3.5 Error handling and response codes

| ID       | Title                                                   | Priority | Type        | Preconditions                                    | Steps                                                           | Expected result                                                                              |
|----------|---------------------------------------------------------|----------|-------------|--------------------------------------------------|-----------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| EH-001   | Validation failure returns structured error response    | P0       | API         | Valid token; invalid payload                     | POST with multiple validation errors                            | 400; body has `{ "valid": false, "errors": [{ "field": "...", "code": "...", "message": "..." }] }` |
| EH-002   | Multiple validation errors returned together            | P1       | API         | Valid token                                      | POST with missing `amount`, invalid `reason`, empty `transactionRef` | 400; all three errors listed in `errors` array                                               |
| EH-003   | Internal service error returns 500                      | P1       | Integration | Database unavailable or downstream timeout       | POST valid request while dependency is down                     | 500 Internal Server Error; generic error message (no stack trace leaked)                      |
| EH-004   | Error response does not leak internal details           | P0       | API         | Force internal error                             | POST that triggers exception                                    | 500; response body contains error code and generic message, no class names or stack traces   |
| EH-005   | Timeout on transaction lookup returns 500               | P2       | Integration | Transaction service response delayed > threshold | POST valid request with slow dependency                         | 500 or 503; error indicates service temporarily unavailable                                  |
| EH-006   | Response Content-Type is application/json               | P1       | API         | Any request                                      | POST any payload                                                | Response `Content-Type: application/json`                                                    |
| EH-007   | Correlation ID propagated in error responses            | P2       | API         | Request includes `X-Correlation-ID` header       | POST invalid payload with correlation header                    | Error response includes same `X-Correlation-ID` in response headers                         |

### 3.6 Performance considerations

| ID       | Title                                              | Priority | Type        | Preconditions                        | Steps                                                           | Expected result                                            |
|----------|-----------------------------------------------------|----------|-------------|--------------------------------------|-----------------------------------------------------------------|------------------------------------------------------------|
| PF-001   | Validation responds within 200ms (p95)             | P1       | Performance | Service warmed up; normal load       | Send 100 valid requests sequentially                            | 95th percentile response time ≤ 200ms                     |
| PF-002   | Service handles 50 concurrent requests             | P2       | Performance | Service under normal conditions      | Send 50 concurrent validation requests                          | All return correct responses; no 5xx errors               |
| PF-003   | Invalid requests rejected quickly (< 50ms)         | P2       | Performance | Service warmed up                    | Send 100 requests with missing required fields                  | 95th percentile response time ≤ 50ms (no DB call needed)  |
| PF-004   | Service does not degrade under sustained load      | P2       | Performance | 5-minute sustained test              | Send steady 20 req/s for 5 minutes                              | No memory leaks; response times remain stable             |

---

## 4. Test environment requirements

| Requirement                | Details                                                           |
|----------------------------|-------------------------------------------------------------------|
| Java version               | Java 21 (matches production)                                     |
| Spring Boot version        | Match production version                                         |
| Database                   | H2 (in-memory) for unit/integration; MariaDB for staging         |
| Auth provider              | Mock OAuth2 server (WireMock or Spring Security test support)    |
| Transaction test data      | Seeded transactions in various states (settled, voided, pending) |
| Network                    | VPN or internal DNS for dependent services in staging            |
| CI/CD                      | Tests run on every PR via pipeline                               |
| Test isolation             | Each test uses independent data; no shared mutable state         |

---

## 5. Entry and exit criteria

### Entry criteria

- Endpoint implementation complete and compiling
- Database schema deployed to test environment
- Authentication mechanism integrated
- Test data seeded (transactions in various states)
- CI pipeline configured to run test suite

### Exit criteria

- All P0 tests passing (100%)
- All P1 tests passing (≥ 95%)
- P2 tests passing (≥ 80%)
- No critical or high-severity defects open
- Code coverage ≥ 85% for validation logic
- Performance baseline established and within thresholds
- Security tests confirm no auth bypass

---

## 6. Risks and mitigations

| Risk                                                    | Impact | Probability | Mitigation                                                                 |
|---------------------------------------------------------|--------|-------------|----------------------------------------------------------------------------|
| Transaction lookup service unavailable in test env      | High   | Medium      | Use WireMock stubs for integration tests; reserve E2E for staging          |
| Business rules change during development                | Medium | High        | Parameterize thresholds (refund window, min amount) in test config         |
| Auth token generation complexity                        | Low    | Medium      | Use Spring Security test annotations (`@WithMockUser`, `@MockBean`)        |
| Currency/locale edge cases not covered                  | Medium | Low         | Add data-driven tests for all supported currencies                         |
| Race conditions on duplicate detection                  | High   | Low         | Add concurrent duplicate submission test; verify idempotency               |
| Database state pollution between tests                  | Medium | Medium      | Use `@Transactional` rollback or per-test schema reset                     |
| Precision errors with decimal amounts                   | Medium | Medium      | Use `BigDecimal` in implementation; test boundary decimal values           |

---

## Appendix: expected request/response contract

### Request

```json
{
  "transactionRef": "TXN-2026-ABC123",
  "amount": 25.50,
  "currency": "USD",
  "reason": "customer_request",
  "metadata": {
    "note": "Customer requested via phone"
  }
}
```

### Response — valid

```json
{
  "valid": true,
  "errors": []
}
```

### Response — validation failure

```json
{
  "valid": false,
  "errors": [
    {
      "field": "amount",
      "code": "EXCEEDS_ORIGINAL",
      "message": "Refund amount exceeds original transaction amount of 20.00 USD"
    }
  ]
}
```

### Response — business rule violation (422)

```json
{
  "valid": false,
  "errors": [
    {
      "field": "transactionRef",
      "code": "TRANSACTION_EXPIRED",
      "message": "Transaction is outside the 180-day refund window"
    }
  ]
}
```
