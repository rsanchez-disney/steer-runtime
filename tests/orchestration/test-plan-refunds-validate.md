# Test Plan: POST /api/v1/refunds/validate

**Document Version:** 1.0
**Created:** 2026-07-24
**Framework:** Spring Boot (Java)
**Endpoint:** `POST /api/v1/refunds/validate`
**Purpose:** Validates refund requests before they are processed

---

## Scope

### In scope

- Request payload validation (required fields, data types, formats)
- Business rule validation (amount limits, eligibility, currency)
- Authentication and authorization checks
- Duplicate request prevention and idempotency
- Error response structure and HTTP status codes
- Integration with transaction lookup service
- Performance under expected load

### Out of scope

- Actual refund processing (handled by downstream service)
- Payment gateway integration (separate endpoint)
- UI/frontend validation (client-side)
- Database migration testing
- Infrastructure/deployment testing

---

## Strategy

| Test type        | Approach                                                     | Responsibility |
|------------------|--------------------------------------------------------------|----------------|
| Unit             | JUnit 5 + Mockito for controller/service layer isolation     | Developer      |
| Integration      | Spring Boot Test with `@WebMvcTest` and `MockMvc`            | Developer + QA |
| Contract         | Spring Cloud Contract or Pact for consumer-driven contracts  | QA             |
| Security         | OWASP ZAP scan + manual injection tests                      | Security + QA  |
| Performance      | JMeter/Gatling load tests against staging                    | QA             |
| End-to-end       | Full stack with real transaction service dependency           | QA             |

### Test data strategy

- Use test transaction fixtures with known states (valid, refunded, expired)
- Generate edge-case amounts programmatically (boundary values)
- Use parameterized tests for currency and amount combinations

---

## Entry criteria

- Code complete and merged to feature branch
- Unit tests passing locally
- Transaction lookup service available in test environment
- Authentication service available (or mocked for unit/integration)
- Test data seeded in staging database

## Exit criteria

- All critical and high priority tests passing
- No P0/P1 defects open
- Code coverage ≥ 80% for validation logic
- Performance benchmarks met (p95 < 200ms, throughput > 500 RPS)
- Security scan clean (no critical/high findings)

---

## Risks

| Risk                                              | Impact | Mitigation                                         |
|---------------------------------------------------|--------|----------------------------------------------------|
| Transaction service unavailable in test env        | High   | Use WireMock stubs for isolation                   |
| Race conditions on duplicate detection             | High   | Add concurrency tests with parallel requests       |
| Currency conversion edge cases                     | Medium | Maintain comprehensive currency fixture set        |
| Token expiration during long test runs             | Low    | Auto-refresh tokens in test framework              |
| Floating point precision on amount comparisons     | High   | Verify `BigDecimal` usage in implementation        |

---

## Request/response contract

### Request

```json
POST /api/v1/refunds/validate
Headers:
  Content-Type: application/json
  Authorization: Bearer {token}
  X-Idempotency-Key: {uuid}

Body:
{
  "transactionId": "TXN-20260101-ABC123",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST",
  "requestedBy": "agent@example.com"
}
```

### Success response

```json
Status: 200 OK
{
  "valid": true,
  "transactionId": "TXN-20260101-ABC123",
  "maxRefundableAmount": 99.99,
  "originalAmount": 99.99,
  "currency": "USD",
  "eligibility": {
    "eligible": true,
    "restrictions": []
  }
}
```

### Validation failure response

```json
Status: 422 Unprocessable Entity
{
  "valid": false,
  "errors": [
    {
      "field": "amount",
      "code": "EXCEEDS_ORIGINAL",
      "message": "Refund amount exceeds original transaction amount"
    }
  ]
}
```

---

## Test cases

### 1. Functional tests — happy path

---

**Test ID:** TC-RFV-001
**Title:** Validate refund — full refund on eligible transaction
**Priority:** Critical
**Type:** Functional

Preconditions:

- User authenticated with `refund:validate` permission
- Transaction `TXN-20260101-ABC123` exists with amount $99.99 USD
- Transaction has not been previously refunded

Test Steps:

1. Send POST to `/api/v1/refunds/validate`
1. Include valid Bearer token in Authorization header
1. Include body: `{"transactionId": "TXN-20260101-ABC123", "amount": 99.99, "currency": "USD", "reason": "CUSTOMER_REQUEST", "requestedBy": "agent@example.com"}`
1. Verify response

Expected Result:

- Status code: 200 OK
- `valid` is `true`
- `maxRefundableAmount` equals `99.99`
- `eligibility.eligible` is `true`
- Response time < 200ms

---

**Test ID:** TC-RFV-002
**Title:** Validate refund — partial refund on eligible transaction
**Priority:** Critical
**Type:** Functional

Preconditions:

- Transaction `TXN-20260101-ABC123` exists with amount $99.99 USD
- No prior refunds on this transaction

Test Steps:

1. Send POST with `amount: 25.00` (partial refund)
1. Verify response

Expected Result:

- Status code: 200 OK
- `valid` is `true`
- `maxRefundableAmount` equals `99.99`
- Response contains original amount for reference

---

**Test ID:** TC-RFV-003
**Title:** Validate refund — partial refund after previous partial refund
**Priority:** High
**Type:** Functional

Preconditions:

- Transaction `TXN-20260201-DEF456` original amount $200.00
- Previous refund of $50.00 already processed

Test Steps:

1. Send POST with `amount: 100.00`
1. Verify response

Expected Result:

- Status code: 200 OK
- `valid` is `true`
- `maxRefundableAmount` equals `150.00` (200 - 50)

---

**Test ID:** TC-RFV-004
**Title:** Validate refund — minimum refund amount ($0.01)
**Priority:** Medium
**Type:** Functional

Preconditions:

- Eligible transaction exists

Test Steps:

1. Send POST with `amount: 0.01`
1. Verify response

Expected Result:

- Status code: 200 OK
- `valid` is `true`

---

**Test ID:** TC-RFV-005
**Title:** Validate refund — all valid reason codes accepted
**Priority:** High
**Type:** Functional

Preconditions:

- Eligible transaction exists

Test Steps:

1. Send POST with `reason: "CUSTOMER_REQUEST"` — verify 200
1. Send POST with `reason: "DUPLICATE_CHARGE"` — verify 200
1. Send POST with `reason: "PRODUCT_DEFECTIVE"` — verify 200
1. Send POST with `reason: "SERVICE_NOT_RENDERED"` — verify 200
1. Send POST with `reason: "FRAUD"` — verify 200

Expected Result:

- All requests return 200 OK with `valid: true`

---

### 2. Functional tests — business rule validation

---

**Test ID:** TC-RFV-010
**Title:** Reject refund — amount exceeds original transaction
**Priority:** Critical
**Type:** Functional

Preconditions:

- Transaction `TXN-20260101-ABC123` has original amount $99.99

Test Steps:

1. Send POST with `amount: 100.00`
1. Verify response

Expected Result:

- Status code: 422 Unprocessable Entity
- `valid` is `false`
- Error code: `EXCEEDS_ORIGINAL`
- Error field: `amount`
- Error message references the maximum refundable amount

---

**Test ID:** TC-RFV-011
**Title:** Reject refund — amount exceeds remaining refundable balance
**Priority:** Critical
**Type:** Functional

Preconditions:

- Transaction original amount $200.00
- Previous refund of $150.00 processed

Test Steps:

1. Send POST with `amount: 75.00` (exceeds remaining $50.00)
1. Verify response

Expected Result:

- Status code: 422
- Error code: `EXCEEDS_REMAINING_BALANCE`
- Response includes `maxRefundableAmount: 50.00`

---

**Test ID:** TC-RFV-012
**Title:** Reject refund — transaction already fully refunded
**Priority:** Critical
**Type:** Functional

Preconditions:

- Transaction `TXN-REFUNDED-001` has been fully refunded

Test Steps:

1. Send POST with any amount for this transaction
1. Verify response

Expected Result:

- Status code: 422
- Error code: `ALREADY_REFUNDED`
- `eligibility.eligible` is `false`

---

**Test ID:** TC-RFV-013
**Title:** Reject refund — transaction expired (beyond refund window)
**Priority:** High
**Type:** Functional

Preconditions:

- Transaction `TXN-EXPIRED-001` is older than 365 days

Test Steps:

1. Send POST for expired transaction
1. Verify response

Expected Result:

- Status code: 422
- Error code: `TRANSACTION_EXPIRED`
- `eligibility.restrictions` includes expiration details

---

**Test ID:** TC-RFV-014
**Title:** Reject refund — transaction not found
**Priority:** Critical
**Type:** Functional

Preconditions:

- Transaction ID does not exist in system

Test Steps:

1. Send POST with `transactionId: "TXN-NONEXISTENT-999"`
1. Verify response

Expected Result:

- Status code: 404 Not Found
- Error code: `TRANSACTION_NOT_FOUND`

---

**Test ID:** TC-RFV-015
**Title:** Reject refund — transaction in pending/processing state
**Priority:** High
**Type:** Functional

Preconditions:

- Transaction `TXN-PENDING-001` is in `PROCESSING` state

Test Steps:

1. Send POST for pending transaction
1. Verify response

Expected Result:

- Status code: 422
- Error code: `TRANSACTION_NOT_SETTLED`
- Message indicates transaction must be settled before refund

---

**Test ID:** TC-RFV-016
**Title:** Reject refund — currency mismatch
**Priority:** High
**Type:** Functional

Preconditions:

- Transaction `TXN-20260101-ABC123` is in USD

Test Steps:

1. Send POST with `currency: "EUR"` for a USD transaction
1. Verify response

Expected Result:

- Status code: 422
- Error code: `CURRENCY_MISMATCH`
- Message includes expected currency

---

### 3. Negative tests — invalid inputs and malformed requests

---

**Test ID:** TC-RFV-020
**Title:** Reject request — missing required field: transactionId
**Priority:** Critical
**Type:** Negative

Preconditions:

- User authenticated

Test Steps:

1. Send POST with body missing `transactionId` field
1. Verify response

Expected Result:

- Status code: 400 Bad Request
- Error code: `FIELD_REQUIRED`
- Error field: `transactionId`

---

**Test ID:** TC-RFV-021
**Title:** Reject request — missing required field: amount
**Priority:** Critical
**Type:** Negative

Preconditions:

- User authenticated

Test Steps:

1. Send POST with body missing `amount` field
1. Verify response

Expected Result:

- Status code: 400
- Error code: `FIELD_REQUIRED`
- Error field: `amount`

---

**Test ID:** TC-RFV-022
**Title:** Reject request — missing required field: currency
**Priority:** High
**Type:** Negative

Test Steps:

1. Send POST with body missing `currency` field
1. Verify response

Expected Result:

- Status code: 400
- Error code: `FIELD_REQUIRED`
- Error field: `currency`

---

**Test ID:** TC-RFV-023
**Title:** Reject request — missing required field: reason
**Priority:** High
**Type:** Negative

Test Steps:

1. Send POST with body missing `reason` field
1. Verify response

Expected Result:

- Status code: 400
- Error code: `FIELD_REQUIRED`
- Error field: `reason`

---

**Test ID:** TC-RFV-024
**Title:** Reject request — negative amount
**Priority:** Critical
**Type:** Negative

Test Steps:

1. Send POST with `amount: -10.00`
1. Verify response

Expected Result:

- Status code: 400
- Error code: `INVALID_AMOUNT`
- Message: amount must be positive

---

**Test ID:** TC-RFV-025
**Title:** Reject request — zero amount
**Priority:** High
**Type:** Negative

Test Steps:

1. Send POST with `amount: 0`
1. Verify response

Expected Result:

- Status code: 400
- Error code: `INVALID_AMOUNT`
- Message: amount must be greater than zero

---

**Test ID:** TC-RFV-026
**Title:** Reject request — amount with excessive decimal places
**Priority:** Medium
**Type:** Negative

Test Steps:

1. Send POST with `amount: 10.999` (3 decimal places)
1. Verify response

Expected Result:

- Status code: 400
- Error code: `INVALID_AMOUNT_PRECISION`
- Message: amount cannot exceed 2 decimal places

---

**Test ID:** TC-RFV-027
**Title:** Reject request — amount as string type
**Priority:** Medium
**Type:** Negative

Test Steps:

1. Send POST with `"amount": "fifty"`
1. Verify response

Expected Result:

- Status code: 400
- Error code: `INVALID_TYPE`
- Error field: `amount`

---

**Test ID:** TC-RFV-028
**Title:** Reject request — invalid currency code
**Priority:** High
**Type:** Negative

Test Steps:

1. Send POST with `currency: "XXX"` (not ISO 4217)
1. Send POST with `currency: "US"` (too short)
1. Send POST with `currency: "USDX"` (too long)
1. Verify all responses

Expected Result:

- Status code: 400 for each
- Error code: `INVALID_CURRENCY`

---

**Test ID:** TC-RFV-029
**Title:** Reject request — invalid reason code
**Priority:** Medium
**Type:** Negative

Test Steps:

1. Send POST with `reason: "BECAUSE_I_SAID_SO"`
1. Verify response

Expected Result:

- Status code: 400
- Error code: `INVALID_REASON`
- Message lists valid reason codes

---

**Test ID:** TC-RFV-030
**Title:** Reject request — empty request body
**Priority:** High
**Type:** Negative

Test Steps:

1. Send POST with empty body `{}`
1. Verify response

Expected Result:

- Status code: 400
- Multiple validation errors returned for all required fields

---

**Test ID:** TC-RFV-031
**Title:** Reject request — malformed JSON body
**Priority:** Medium
**Type:** Negative

Test Steps:

1. Send POST with body: `{invalid json`
1. Verify response

Expected Result:

- Status code: 400
- Error code: `MALFORMED_REQUEST`

---

**Test ID:** TC-RFV-032
**Title:** Reject request — wrong Content-Type header
**Priority:** Medium
**Type:** Negative

Test Steps:

1. Send POST with `Content-Type: text/plain` and valid JSON body
1. Verify response

Expected Result:

- Status code: 415 Unsupported Media Type

---

**Test ID:** TC-RFV-033
**Title:** Reject request — excessively large payload
**Priority:** Medium
**Type:** Negative

Test Steps:

1. Send POST with body > 1MB (padded with extra fields)
1. Verify response

Expected Result:

- Status code: 413 Payload Too Large (or 400)
- Connection not held open

---

**Test ID:** TC-RFV-034
**Title:** Reject request — transactionId with special characters
**Priority:** Medium
**Type:** Negative

Test Steps:

1. Send POST with `transactionId: "<script>alert('xss')</script>"`
1. Send POST with `transactionId: "'; DROP TABLE transactions;--"`
1. Verify responses

Expected Result:

- Status code: 400
- Error code: `INVALID_FORMAT`
- No error details leak internal implementation

---

**Test ID:** TC-RFV-035
**Title:** Reject request — extremely large amount value
**Priority:** Medium
**Type:** Negative

Test Steps:

1. Send POST with `amount: 99999999999999.99`
1. Verify response

Expected Result:

- Status code: 400
- Error code: `INVALID_AMOUNT`
- No integer overflow or unexpected behavior

---
