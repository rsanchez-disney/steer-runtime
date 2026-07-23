# Test Plan: POST /api/v1/refunds/validate

**Service:** Spring Boot (Java) — Payment Domain
**Endpoint:** `POST /api/v1/refunds/validate`
**Purpose:** Validates refund requests before they are processed
**Author:** QA Team
**Date:** 2026-07-22
**Status:** Draft

---

## 1. Scope

### In scope

- Request payload validation (field presence, types, formats)
- Business rule enforcement (amount limits, time windows, state checks)
- Authentication and authorization checks
- Duplicate refund detection
- Integration with transaction lookup service
- Integration with payment gateway validation
- Performance under expected and peak load
- Error response contract validation

### Out of scope

- Actual refund execution (handled by `/api/v1/refunds/process`)
- Payment gateway settlement logic
- Notification/email triggers
- UI integration testing
- Database migration testing
- Third-party payment provider internal logic

---

## 2. Test strategy

### Unit tests

- Controller layer: request deserialization, validation annotations, response mapping
- Service layer: business rule logic, amount calculations, time window checks
- Repository layer: mocked DB interactions for transaction lookup
- Framework: JUnit 5 + Mockito
- Coverage target: 90%+ line coverage on service layer

### Integration tests

- Full Spring context with `@SpringBootTest`
- Embedded H2 or Testcontainers (PostgreSQL) for transaction store
- WireMock for downstream payment gateway stubs
- Validate end-to-end request → response within the service boundary
- Framework: Spring Boot Test + Testcontainers + WireMock

### End-to-end tests

- Deploy to staging environment
- Real HTTP calls via RestAssured or Bruno collection
- Validate against real (sandboxed) payment gateway
- Verify observability (logs, metrics, traces)

### Performance tests

- Tool: Gatling or k6
- Baseline: 200 req/s sustained for 5 minutes
- Stress: ramp to 1000 req/s, observe degradation
- Response time P95 < 300ms under normal load
- No errors under expected load (200 req/s)

---

## 3. Functional test cases — happy path

### TC-RFV-001: Validate full refund request — success

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-001                                                           |
| **Title**     | Validate full refund for a valid transaction                         |
| **Priority**  | Critical                                                             |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-20260501-001` exists with amount $100.00 USD, status `COMPLETED`
- No prior refund exists for this transaction
- Transaction is within the 90-day refund window

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-001",
  "refundAmount": 100.00,
  "currency": "USD",
  "reason": "Customer requested cancellation",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `200 OK`

```json
{
  "valid": true,
  "transactionId": "TXN-20260501-001",
  "refundAmount": 100.00,
  "currency": "USD",
  "refundType": "FULL",
  "eligibility": {
    "eligible": true,
    "remainingRefundableAmount": 0.00
  },
  "validationId": "VAL-uuid-here",
  "expiresAt": "2026-07-22T19:26:00Z"
}
```

**Validations:**
- Status code is 200
- `valid` is `true`
- `refundType` is `FULL`
- `eligibility.eligible` is `true`
- `validationId` is a non-empty UUID
- `expiresAt` is in the future

---

### TC-RFV-002: Validate partial refund request — success

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-002                                                           |
| **Title**     | Validate partial refund for a valid transaction                      |
| **Priority**  | Critical                                                             |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-20260501-002` exists with amount $250.00 USD, status `COMPLETED`
- No prior refund exists for this transaction
- Transaction is within the 90-day refund window

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-002",
  "refundAmount": 75.50,
  "currency": "USD",
  "reason": "Partial service not rendered",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `200 OK`

```json
{
  "valid": true,
  "transactionId": "TXN-20260501-002",
  "refundAmount": 75.50,
  "currency": "USD",
  "refundType": "PARTIAL",
  "eligibility": {
    "eligible": true,
    "remainingRefundableAmount": 174.50
  },
  "validationId": "VAL-uuid-here",
  "expiresAt": "2026-07-22T19:26:00Z"
}
```

**Validations:**
- Status code is 200
- `valid` is `true`
- `refundType` is `PARTIAL`
- `remainingRefundableAmount` equals original amount minus refund amount
- Response time < 500ms

---

### TC-RFV-003: Validate partial refund after prior partial refund — success

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-003                                                           |
| **Title**     | Validate second partial refund with remaining balance                |
| **Priority**  | High                                                                 |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-20260501-003` exists with amount $200.00 USD, status `COMPLETED`
- A prior partial refund of $80.00 was already processed
- Transaction is within the 90-day refund window

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-003",
  "refundAmount": 50.00,
  "currency": "USD",
  "reason": "Additional item returned",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `200 OK`

```json
{
  "valid": true,
  "transactionId": "TXN-20260501-003",
  "refundAmount": 50.00,
  "currency": "USD",
  "refundType": "PARTIAL",
  "eligibility": {
    "eligible": true,
    "remainingRefundableAmount": 70.00
  },
  "validationId": "VAL-uuid-here",
  "expiresAt": "2026-07-22T19:26:00Z"
}
```

**Validations:**
- Status code is 200
- `remainingRefundableAmount` = 200.00 - 80.00 (prior) - 50.00 (current) = 70.00
- `refundType` is `PARTIAL`


---

## 4. Functional test cases — business rule validation

### TC-RFV-004: Refund amount exceeds original transaction amount

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-004                                                           |
| **Title**     | Reject refund exceeding original transaction amount                  |
| **Priority**  | Critical                                                             |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-20260501-004` exists with amount $100.00 USD, status `COMPLETED`

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-004",
  "refundAmount": 150.00,
  "currency": "USD",
  "reason": "Customer dispute",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `422 Unprocessable Entity`

```json
{
  "valid": false,
  "error": "AMOUNT_EXCEEDS_TRANSACTION",
  "message": "Refund amount $150.00 exceeds original transaction amount $100.00",
  "details": {
    "originalAmount": 100.00,
    "requestedAmount": 150.00,
    "maxRefundableAmount": 100.00
  }
}
```

**Validations:**
- Status code is 422
- `valid` is `false`
- `error` is `AMOUNT_EXCEEDS_TRANSACTION`
- `details.maxRefundableAmount` equals original amount

---

### TC-RFV-005: Refund amount exceeds remaining refundable balance

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-005                                                           |
| **Title**     | Reject refund exceeding remaining balance after prior refunds        |
| **Priority**  | Critical                                                             |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-20260501-005` exists with amount $200.00 USD
- Prior refund of $180.00 already processed

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-005",
  "refundAmount": 50.00,
  "currency": "USD",
  "reason": "Remaining balance refund",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `422 Unprocessable Entity`

```json
{
  "valid": false,
  "error": "AMOUNT_EXCEEDS_REMAINING",
  "message": "Refund amount $50.00 exceeds remaining refundable amount $20.00",
  "details": {
    "originalAmount": 200.00,
    "priorRefunds": 180.00,
    "remainingRefundable": 20.00,
    "requestedAmount": 50.00
  }
}
```

**Validations:**
- Status code is 422
- `error` is `AMOUNT_EXCEEDS_REMAINING`
- `details.remainingRefundable` = 200.00 - 180.00

---

### TC-RFV-006: Transaction not in refundable state

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-006                                                           |
| **Title**     | Reject refund for transaction in non-refundable state                |
| **Priority**  | Critical                                                             |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-20260501-006` exists with status `PENDING` (not yet settled)

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-006",
  "refundAmount": 50.00,
  "currency": "USD",
  "reason": "Cancel pending order",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `422 Unprocessable Entity`

```json
{
  "valid": false,
  "error": "TRANSACTION_NOT_REFUNDABLE",
  "message": "Transaction TXN-20260501-006 is in state PENDING and cannot be refunded",
  "details": {
    "currentState": "PENDING",
    "refundableStates": ["COMPLETED", "SETTLED"]
  }
}
```

**Validations:**
- Status code is 422
- `error` is `TRANSACTION_NOT_REFUNDABLE`
- `details.currentState` reflects actual transaction state

---

### TC-RFV-007: Currency mismatch with original transaction

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-007                                                           |
| **Title**     | Reject refund with currency different from original transaction      |
| **Priority**  | High                                                                 |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-20260501-007` exists with amount $100.00 USD

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-007",
  "refundAmount": 100.00,
  "currency": "EUR",
  "reason": "Currency mismatch test",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `422 Unprocessable Entity`

```json
{
  "valid": false,
  "error": "CURRENCY_MISMATCH",
  "message": "Requested currency EUR does not match transaction currency USD",
  "details": {
    "transactionCurrency": "USD",
    "requestedCurrency": "EUR"
  }
}
```

**Validations:**
- Status code is 422
- `error` is `CURRENCY_MISMATCH`

---

### TC-RFV-008: Duplicate refund detection

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-008                                                           |
| **Title**     | Detect and reject duplicate full refund request                      |
| **Priority**  | Critical                                                             |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-20260501-008` exists with amount $100.00 USD, status `COMPLETED`
- A full refund of $100.00 has already been processed for this transaction

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-008",
  "refundAmount": 100.00,
  "currency": "USD",
  "reason": "Duplicate request",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `409 Conflict`

```json
{
  "valid": false,
  "error": "DUPLICATE_REFUND",
  "message": "A full refund has already been processed for transaction TXN-20260501-008",
  "details": {
    "existingRefundId": "RFD-20260501-001",
    "existingRefundAmount": 100.00,
    "processedAt": "2026-05-15T10:30:00Z"
  }
}
```

**Validations:**
- Status code is 409
- `error` is `DUPLICATE_REFUND`
- `details.existingRefundId` is present

---

### TC-RFV-009: Refund outside eligibility time window

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-009                                                           |
| **Title**     | Reject refund request beyond 90-day eligibility window               |
| **Priority**  | High                                                                 |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-20260101-001` was completed on 2026-01-01 (over 90 days ago)

**Request payload:**

```json
{
  "transactionId": "TXN-20260101-001",
  "refundAmount": 50.00,
  "currency": "USD",
  "reason": "Late return",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `422 Unprocessable Entity`

```json
{
  "valid": false,
  "error": "REFUND_WINDOW_EXPIRED",
  "message": "Refund eligibility window of 90 days has expired for transaction TXN-20260101-001",
  "details": {
    "transactionDate": "2026-01-01T12:00:00Z",
    "windowDays": 90,
    "expiredAt": "2026-04-01T12:00:00Z"
  }
}
```

**Validations:**
- Status code is 422
- `error` is `REFUND_WINDOW_EXPIRED`
- `details.windowDays` is 90

---

### TC-RFV-010: Transaction does not exist

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-010                                                           |
| **Title**     | Reject refund for non-existent transaction                           |
| **Priority**  | Critical                                                             |
| **Type**      | Functional                                                           |

**Preconditions:**
- Transaction `TXN-NONEXISTENT-999` does not exist in the system

**Request payload:**

```json
{
  "transactionId": "TXN-NONEXISTENT-999",
  "refundAmount": 50.00,
  "currency": "USD",
  "reason": "Test missing transaction",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `404 Not Found`

```json
{
  "valid": false,
  "error": "TRANSACTION_NOT_FOUND",
  "message": "Transaction TXN-NONEXISTENT-999 not found"
}
```

**Validations:**
- Status code is 404
- `error` is `TRANSACTION_NOT_FOUND`
- No sensitive data leaked in response

---

## 5. Negative test cases — invalid inputs

### TC-RFV-011: Missing required field — transactionId

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-011                                                           |
| **Title**     | Reject request with missing transactionId                            |
| **Priority**  | High                                                                 |
| **Type**      | Functional                                                           |

**Preconditions:** None

**Request payload:**

```json
{
  "refundAmount": 50.00,
  "currency": "USD",
  "reason": "Missing txn id",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `400 Bad Request`

```json
{
  "valid": false,
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fieldErrors": [
    {
      "field": "transactionId",
      "message": "Transaction ID is required"
    }
  ]
}
```

**Validations:**
- Status code is 400
- `fieldErrors` contains entry for `transactionId`

---

### TC-RFV-012: Missing required field — refundAmount

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-012                                                           |
| **Title**     | Reject request with missing refundAmount                             |
| **Priority**  | High                                                                 |
| **Type**      | Functional                                                           |

**Preconditions:** None

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-001",
  "currency": "USD",
  "reason": "Missing amount",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `400 Bad Request`

```json
{
  "valid": false,
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fieldErrors": [
    {
      "field": "refundAmount",
      "message": "Refund amount is required"
    }
  ]
}
```

**Validations:**
- Status code is 400
- `fieldErrors` contains entry for `refundAmount`

---

### TC-RFV-013: Missing required field — reason

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-013                                                           |
| **Title**     | Reject request with missing refund reason                            |
| **Priority**  | High                                                                 |
| **Type**      | Functional                                                           |

**Preconditions:** None

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-001",
  "refundAmount": 50.00,
  "currency": "USD",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `400 Bad Request`

```json
{
  "valid": false,
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fieldErrors": [
    {
      "field": "reason",
      "message": "Refund reason is required"
    }
  ]
}
```

**Validations:**
- Status code is 400
- `fieldErrors` contains entry for `reason`

---

### TC-RFV-014: Negative refund amount

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-014                                                           |
| **Title**     | Reject request with negative refund amount                           |
| **Priority**  | High                                                                 |
| **Type**      | Functional                                                           |

**Preconditions:** None

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-001",
  "refundAmount": -25.00,
  "currency": "USD",
  "reason": "Negative amount test",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `400 Bad Request`

```json
{
  "valid": false,
  "error": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "fieldErrors": [
    {
      "field": "refundAmount",
      "message": "Refund amount must be greater than zero"
    }
  ]
}
```

**Validations:**
- Status code is 400
- Error message indicates amount must be positive

---

### TC-RFV-015: Zero refund amount

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-015                                                           |
| **Title**     | Reject request with zero refund amount                               |
| **Priority**  | Medium                                                               |
| **Type**      | Functional                                                           |

**Preconditions:** None

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-001",
  "refundAmount": 0.00,
  "currency": "USD",
  "reason": "Zero amount test",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `400 Bad Request`

```json
{
  "valid": false,
  "error": "VALIDATION_ERROR",
  "fieldErrors": [
    {
      "field": "refundAmount",
      "message": "Refund amount must be greater than zero"
    }
  ]
}
```

**Validations:**
- Status code is 400

---

### TC-RFV-016: Invalid currency code

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-016                                                           |
| **Title**     | Reject request with invalid ISO 4217 currency code                   |
| **Priority**  | Medium                                                               |
| **Type**      | Functional                                                           |

**Preconditions:** None

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-001",
  "refundAmount": 50.00,
  "currency": "INVALID",
  "reason": "Bad currency test",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `400 Bad Request`

```json
{
  "valid": false,
  "error": "VALIDATION_ERROR",
  "fieldErrors": [
    {
      "field": "currency",
      "message": "Invalid ISO 4217 currency code"
    }
  ]
}
```

**Validations:**
- Status code is 400
- `fieldErrors` references `currency` field

---

### TC-RFV-017: Malformed JSON body

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-017                                                           |
| **Title**     | Reject malformed JSON request body                                   |
| **Priority**  | Medium                                                               |
| **Type**      | Functional                                                           |

**Preconditions:** None

**Request payload:**

```text
{ "transactionId": "TXN-001", "refundAmount": }
```

**Expected response:** `400 Bad Request`

```json
{
  "valid": false,
  "error": "MALFORMED_REQUEST",
  "message": "Unable to parse request body"
}
```

**Validations:**
- Status code is 400
- No stack trace or internal details exposed

---

### TC-RFV-018: Empty request body

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-018                                                           |
| **Title**     | Reject empty request body                                            |
| **Priority**  | Medium                                                               |
| **Type**      | Functional                                                           |

**Preconditions:** None

**Request payload:** *(empty)*

**Expected response:** `400 Bad Request`

```json
{
  "valid": false,
  "error": "MALFORMED_REQUEST",
  "message": "Request body is required"
}
```

**Validations:**
- Status code is 400

---

### TC-RFV-019: Refund amount with excessive decimal places

| Field         | Value                                                                |
|---------------|----------------------------------------------------------------------|
| **Test ID**   | TC-RFV-019                                                           |
| **Title**     | Reject refund amount with more than 2 decimal places                 |
| **Priority**  | Medium                                                               |
| **Type**      | Functional                                                           |

**Preconditions:** None

**Request payload:**

```json
{
  "transactionId": "TXN-20260501-001",
  "refundAmount": 50.999,
  "currency": "USD",
  "reason": "Precision test",
  "requestedBy": "agent-12345"
}
```

**Expected response:** `400 Bad Request`

```json
{
  "valid": false,
  "error": "VALIDATION_ERROR",
  "fieldErrors": [
    {
      "field": "refundAmount",
      "message": "Refund amount must not exceed 2 decimal places"
    }
  ]
}
```

**Validations:**
- Status code is 400
