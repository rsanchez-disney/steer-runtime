# Test Plan: POST /api/v1/refunds/validate

## Document info

| Field       | Value                                      |
|-------------|--------------------------------------------|
| Service     | wdpr-config-services (Spring Boot / Java)  |
| Endpoint    | `POST /api/v1/refunds/validate`            |
| Domain      | Payment refunds                            |
| Author      | QA Team                                    |
| Created     | 2026-07-22                                 |
| Status      | Draft                                      |

---

## Scope

### In scope

- Request payload validation (schema, types, required fields)
- Business rule validation (eligibility checks, amount limits, time windows)
- Authentication and authorization enforcement
- Error response structure and HTTP status codes
- Performance under expected and peak load
- Security hardening (injection, rate limiting, input sanitization)
- Downstream service failure handling (transaction lookup, fraud checks)
- Idempotency behavior for duplicate requests

### Out of scope

- Actual refund processing/execution (separate endpoint)
- Payment gateway integration (mocked for validation tests)
- UI/frontend integration (covered by E2E suite separately)
- Database migration testing
- Third-party fraud provider internal logic

---

## Test strategy

| Type        | Approach                                                                 | Owner     |
|-------------|--------------------------------------------------------------------------|-----------|
| Unit        | JUnit 5 + Mockito for service/helper logic, validation rules, mappers    | Developer |
| Integration | Spring Boot Test with embedded context, WireMock for downstream services | Developer |
| E2E         | Full environment deployment, real HTTP calls, staging data                | QA        |
| Performance | Gatling scripts targeting staging; baseline + stress + soak              | QA        |
| Security    | OWASP ZAP scan, manual injection tests, auth boundary tests              | Security  |

### Test environment

- **Unit/Integration**: Local + CI (GitHub Actions)
- **E2E**: Staging (`https://payment-controls-stage.wdprapps.disney.com`)
- **Performance**: Load environment (`https://payment-controls-load.wdprapps.disney.com`)

### Test data strategy

- Unit tests use builders/factories for deterministic data
- Integration tests use WireMock stubs for downstream responses
- E2E tests use seeded staging transactions (read-only validation, no side effects)

---

## Functional test cases — happy path

### TC-RV-001: Validate eligible refund with valid payload

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-001                                                          |
| **Title**        | Validate eligible refund with valid payload                        |
| **Priority**     | Critical                                                           |
| **Type**         | Functional                                                         |
| **Preconditions**| Authenticated user with refund permissions; original transaction exists |

**Test steps:**

1. Send `POST /api/v1/refunds/validate` with valid JSON payload
2. Include valid `transactionId`, `amount`, `reason`, and `currency`
3. Verify response status and body

**Expected result:**

- HTTP 200 OK
- Response body contains `{ "eligible": true, "validationErrors": [] }`

**Test data:**

```json
{
  "transactionId": "TXN-20260101-ABC123",
  "amount": 25.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST",
  "requestedBy": "agent@disney.com"
}
```

---

### TC-RV-002: Validate partial refund within allowed amount

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-002                                                          |
| **Title**        | Validate partial refund within allowed amount                      |
| **Priority**     | Critical                                                           |
| **Type**         | Functional                                                         |
| **Preconditions**| Original transaction of $100.00 exists and is fully paid           |

**Test steps:**

1. Send validation request with `amount: 50.00` against a $100.00 transaction
2. Verify response indicates eligibility

**Expected result:**

- HTTP 200 OK
- `{ "eligible": true, "remainingRefundable": 50.00 }`

**Test data:**

```json
{
  "transactionId": "TXN-20260101-PARTIAL",
  "amount": 50.00,
  "currency": "USD",
  "reason": "PARTIAL_RETURN"
}
```

---

### TC-RV-003: Validate full refund for eligible transaction

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-003                                                          |
| **Title**        | Validate full refund for eligible transaction                      |
| **Priority**     | High                                                               |
| **Type**         | Functional                                                         |
| **Preconditions**| Transaction exists with no prior refunds                           |

**Test steps:**

1. Send validation request with amount equal to original transaction total
2. Verify full refund eligibility

**Expected result:**

- HTTP 200 OK
- `{ "eligible": true, "remainingRefundable": 0.00 }`

---

## Functional test cases — validation rules

### TC-RV-010: Reject refund exceeding original transaction amount

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-010                                                          |
| **Title**        | Reject refund exceeding original transaction amount                |
| **Priority**     | Critical                                                           |
| **Type**         | Functional                                                         |
| **Preconditions**| Original transaction total is $100.00                              |

**Test steps:**

1. Send validation request with `amount: 150.00`
2. Verify rejection with appropriate error

**Expected result:**

- HTTP 200 OK
- `{ "eligible": false, "validationErrors": ["AMOUNT_EXCEEDS_ORIGINAL"] }`

---

### TC-RV-011: Reject refund for already fully refunded transaction

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-011                                                          |
| **Title**        | Reject refund for already fully refunded transaction               |
| **Priority**     | Critical                                                           |
| **Type**         | Functional                                                         |
| **Preconditions**| Transaction has been fully refunded previously                     |

**Test steps:**

1. Send validation request for a fully-refunded transaction
2. Verify ineligibility

**Expected result:**

- HTTP 200 OK
- `{ "eligible": false, "validationErrors": ["ALREADY_FULLY_REFUNDED"] }`

---

### TC-RV-012: Reject refund outside allowed time window

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-012                                                          |
| **Title**        | Reject refund outside allowed time window                          |
| **Priority**     | High                                                               |
| **Type**         | Functional                                                         |
| **Preconditions**| Transaction is older than the refund policy window (e.g., 90 days) |

**Test steps:**

1. Send validation request for a transaction from 120 days ago
2. Verify time-window rejection

**Expected result:**

- HTTP 200 OK
- `{ "eligible": false, "validationErrors": ["REFUND_WINDOW_EXPIRED"] }`

---

### TC-RV-013: Reject refund for cancelled/voided transaction

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-013                                                          |
| **Title**        | Reject refund for cancelled or voided transaction                  |
| **Priority**     | High                                                               |
| **Type**         | Functional                                                         |
| **Preconditions**| Transaction status is CANCELLED or VOIDED                          |

**Test steps:**

1. Send validation request for a voided transaction
2. Verify rejection

**Expected result:**

- HTTP 200 OK
- `{ "eligible": false, "validationErrors": ["TRANSACTION_NOT_ELIGIBLE"] }`

---

### TC-RV-014: Reject refund for pending/incomplete transaction

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-014                                                          |
| **Title**        | Reject refund for pending or incomplete transaction                |
| **Priority**     | High                                                               |
| **Type**         | Functional                                                         |
| **Preconditions**| Transaction status is PENDING                                      |

**Test steps:**

1. Send validation request for a pending transaction
2. Verify rejection

**Expected result:**

- HTTP 200 OK
- `{ "eligible": false, "validationErrors": ["TRANSACTION_NOT_SETTLED"] }`


---

## Negative test cases — invalid inputs

### TC-RV-020: Missing required field — transactionId

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-020                                                          |
| **Title**        | Missing required field — transactionId                             |
| **Priority**     | Critical                                                           |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send request without `transactionId` field
2. Verify 400 response

**Expected result:**

- HTTP 400 Bad Request
- `{ "error": "VALIDATION_ERROR", "details": [{"field": "transactionId", "message": "must not be null"}] }`

---

### TC-RV-021: Missing required field — amount

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-021                                                          |
| **Title**        | Missing required field — amount                                    |
| **Priority**     | Critical                                                           |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send request without `amount` field
2. Verify 400 response

**Expected result:**

- HTTP 400 Bad Request
- `{ "error": "VALIDATION_ERROR", "details": [{"field": "amount", "message": "must not be null"}] }`

---

### TC-RV-022: Invalid amount — negative value

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-022                                                          |
| **Title**        | Invalid amount — negative value                                    |
| **Priority**     | High                                                               |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send request with `amount: -10.00`
2. Verify rejection

**Expected result:**

- HTTP 400 Bad Request
- `{ "error": "VALIDATION_ERROR", "details": [{"field": "amount", "message": "must be greater than 0"}] }`

---

### TC-RV-023: Invalid amount — zero value

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-023                                                          |
| **Title**        | Invalid amount — zero value                                        |
| **Priority**     | High                                                               |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send request with `amount: 0.00`
2. Verify rejection

**Expected result:**

- HTTP 400 Bad Request
- `{ "error": "VALIDATION_ERROR", "details": [{"field": "amount", "message": "must be greater than 0"}] }`

---

### TC-RV-024: Invalid currency code

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-024                                                          |
| **Title**        | Invalid currency code                                              |
| **Priority**     | Medium                                                             |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send request with `currency: "INVALID"`
2. Verify rejection

**Expected result:**

- HTTP 400 Bad Request
- `{ "error": "VALIDATION_ERROR", "details": [{"field": "currency", "message": "must be a valid ISO 4217 code"}] }`

---

### TC-RV-025: Invalid reason code

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-025                                                          |
| **Title**        | Invalid reason code                                                |
| **Priority**     | Medium                                                             |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send request with `reason: "NOT_A_VALID_REASON"`
2. Verify rejection

**Expected result:**

- HTTP 400 Bad Request
- `{ "error": "VALIDATION_ERROR", "details": [{"field": "reason", "message": "must be one of [CUSTOMER_REQUEST, DUPLICATE_CHARGE, PARTIAL_RETURN, DEFECTIVE_PRODUCT, SERVICE_FAILURE]"}] }`

---

### TC-RV-026: Non-existent transaction ID

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-026                                                          |
| **Title**        | Non-existent transaction ID                                        |
| **Priority**     | Critical                                                           |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send request with `transactionId: "TXN-NONEXISTENT-999"`
2. Verify 404 response

**Expected result:**

- HTTP 404 Not Found
- `{ "error": "TRANSACTION_NOT_FOUND", "message": "No transaction found with ID TXN-NONEXISTENT-999" }`

---

### TC-RV-027: Malformed JSON payload

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-027                                                          |
| **Title**        | Malformed JSON payload                                             |
| **Priority**     | High                                                               |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send request with invalid JSON body: `{broken json`
2. Verify 400 response

**Expected result:**

- HTTP 400 Bad Request
- `{ "error": "MALFORMED_REQUEST", "message": "Unable to parse request body" }`

---

### TC-RV-028: Empty request body

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-028                                                          |
| **Title**        | Empty request body                                                 |
| **Priority**     | High                                                               |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send `POST` request with empty body
2. Verify 400 response

**Expected result:**

- HTTP 400 Bad Request
- `{ "error": "MALFORMED_REQUEST", "message": "Request body is required" }`

---

### TC-RV-029: Wrong Content-Type header

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-029                                                          |
| **Title**        | Wrong Content-Type header                                          |
| **Priority**     | Medium                                                             |
| **Type**         | Negative                                                           |
| **Preconditions**| Authenticated user                                                 |

**Test steps:**

1. Send request with `Content-Type: text/plain` and valid JSON body
2. Verify 415 response

**Expected result:**

- HTTP 415 Unsupported Media Type

---

## Negative test cases — unauthorized access

### TC-RV-030: Request without authentication token

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-030                                                          |
| **Title**        | Request without authentication token                               |
| **Priority**     | Critical                                                           |
| **Type**         | Security                                                           |
| **Preconditions**| No auth token provided                                             |

**Test steps:**

1. Send valid payload without `Authorization` header
2. Verify 401 response

**Expected result:**

- HTTP 401 Unauthorized
- `{ "error": "UNAUTHORIZED", "message": "Authentication required" }`

---

### TC-RV-031: Request with expired token

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-031                                                          |
| **Title**        | Request with expired token                                         |
| **Priority**     | Critical                                                           |
| **Type**         | Security                                                           |
| **Preconditions**| Token expired 1 hour ago                                           |

**Test steps:**

1. Send valid payload with an expired JWT token
2. Verify 401 response

**Expected result:**

- HTTP 401 Unauthorized
- `{ "error": "TOKEN_EXPIRED", "message": "Authentication token has expired" }`

---

### TC-RV-032: Request with insufficient permissions

| Field            | Value                                                              |
|------------------|--------------------------------------------------------------------|
| **Test ID**      | TC-RV-032                                                          |
| **Title**        | Request with insufficient permissions                              |
| **Priority**     | Critical                                                           |
| **Type**         | Security                                                           |
| **Preconditions**| User authenticated but lacks `refund:validate` permission          |

**Test steps:**

1. Authenticate as a user without refund permissions
2. Send valid payload
3. Verify 403 response

**Expected result:**

- HTTP 403 Forbidden
- `{ "error": "FORBIDDEN", "message": "Insufficient permissions for refund validation" }`
