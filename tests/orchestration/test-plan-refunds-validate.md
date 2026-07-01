# Test Plan: POST /api/v1/refunds/validate

**Service:** Spring Boot (Java)
**Endpoint:** `POST /api/v1/refunds/validate`
**Purpose:** Validates refund requests before processing
**Date:** 2026-06-27
**Author:** test_planner_agent

---

## 1. Scope

### In scope

- Request payload validation (schema, types, required fields)
- Business rule validation (amounts, limits, eligibility)
- Authentication and authorization checks
- Response format and status codes
- Error message accuracy
- Rate limiting behavior
- Performance under load
- Integration with downstream validation services

### Out of scope

- Actual refund processing/execution
- Payment gateway interactions (handled by downstream services)
- Database write operations (this endpoint is read/validate only)
- UI/frontend validation
- Notification/email triggers

---

## 2. Test strategy

| Layer       | Tool/Framework          | Purpose                                           |
|-------------|-------------------------|---------------------------------------------------|
| Unit        | JUnit 5 + Mockito       | Service logic, validators, mappers                |
| Integration | SpringBootTest + MockMvc | Controller, filters, serialization, DB read       |
| E2E         | Bruno / REST Assured    | Full stack validation against running service     |
| Performance | k6 / Gatling            | Throughput, latency, concurrency                  |
| Security    | OWASP ZAP + manual      | Injection, auth bypass, header manipulation       |

---

## 3. Functional test cases — positive scenarios

### TC-POS-001: Valid credit card refund request

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 200 OK

{
  "valid": true,
  "orderId": "ORD-2026-001234",
  "eligibleAmount": 49.99,
  "message": "Refund request is valid"
}
```

**Validations:**

- Status code is 200
- `valid` field is `true`
- `eligibleAmount` matches requested amount
- Response time < 500ms

---

### TC-POS-002: Valid partial refund

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 15.00,
  "currency": "USD",
  "reason": "PARTIAL_RETURN"
}
```

**Expected Response:**

```json
HTTP 200 OK

{
  "valid": true,
  "orderId": "ORD-2026-001234",
  "eligibleAmount": 15.00,
  "message": "Refund request is valid"
}
```

**Validations:**

- Status code is 200
- `valid` is `true`
- Partial amount accepted when less than original transaction

---

### TC-POS-003: Valid debit card refund

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-005678",
  "transactionId": "TXN-11111",
  "paymentMethod": "DEBIT_CARD",
  "amount": 25.50,
  "currency": "USD",
  "reason": "DEFECTIVE_PRODUCT"
}
```

**Expected Response:**

```json
HTTP 200 OK

{
  "valid": true,
  "orderId": "ORD-2026-005678",
  "eligibleAmount": 25.50,
  "message": "Refund request is valid"
}
```

**Validations:**

- Status code is 200
- Debit card payment method accepted

---

### TC-POS-004: Valid PayPal refund

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-009999",
  "transactionId": "TXN-22222",
  "paymentMethod": "PAYPAL",
  "amount": 100.00,
  "currency": "EUR",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 200 OK

{
  "valid": true,
  "orderId": "ORD-2026-009999",
  "eligibleAmount": 100.00,
  "message": "Refund request is valid"
}
```

**Validations:**

- Status code is 200
- EUR currency accepted
- PayPal payment method accepted

---

### TC-POS-005: Valid gift card refund

**Priority:** Medium

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-003333",
  "transactionId": "TXN-33333",
  "paymentMethod": "GIFT_CARD",
  "amount": 75.00,
  "currency": "USD",
  "reason": "ORDER_CANCELLED"
}
```

**Expected Response:**

```json
HTTP 200 OK

{
  "valid": true,
  "orderId": "ORD-2026-003333",
  "eligibleAmount": 75.00,
  "message": "Refund request is valid"
}
```

**Validations:**

- Status code is 200
- Gift card refund validated correctly

---

### TC-POS-006: Valid multi-currency refund (GBP)

**Priority:** Medium

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-004444",
  "transactionId": "TXN-44444",
  "paymentMethod": "CREDIT_CARD",
  "amount": 200.00,
  "currency": "GBP",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 200 OK

{
  "valid": true,
  "orderId": "ORD-2026-004444",
  "eligibleAmount": 200.00,
  "message": "Refund request is valid"
}
```

**Validations:**

- Status code is 200
- GBP currency handled correctly

---

## 4. Functional test cases — negative scenarios

### TC-NEG-001: Missing required field (orderId)

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 400 Bad Request

{
  "valid": false,
  "errors": [
    {
      "field": "orderId",
      "message": "orderId is required"
    }
  ]
}
```

**Validations:**

- Status code is 400
- Error identifies missing field by name
- `valid` is `false`

---

### TC-NEG-002: Missing required field (amount)

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 400 Bad Request

{
  "valid": false,
  "errors": [
    {
      "field": "amount",
      "message": "amount is required"
    }
  ]
}
```

**Validations:**

- Status code is 400
- Error message references `amount`

---

### TC-NEG-003: Negative refund amount

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": -10.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 400 Bad Request

{
  "valid": false,
  "errors": [
    {
      "field": "amount",
      "message": "amount must be greater than zero"
    }
  ]
}
```

**Validations:**

- Status code is 400
- Negative amounts rejected

---

### TC-NEG-004: Amount exceeds original transaction

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 999999.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 422 Unprocessable Entity

{
  "valid": false,
  "errors": [
    {
      "field": "amount",
      "message": "Refund amount exceeds original transaction amount"
    }
  ]
}
```

**Validations:**

- Status code is 422
- Clear message about exceeding limit

---

### TC-NEG-005: Already fully refunded order

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-REFUNDED",
  "transactionId": "TXN-REFUNDED",
  "paymentMethod": "CREDIT_CARD",
  "amount": 10.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 422 Unprocessable Entity

{
  "valid": false,
  "errors": [
    {
      "field": "orderId",
      "message": "Order has already been fully refunded"
    }
  ]
}
```

**Validations:**

- Status code is 422
- Indicates order already refunded

---

### TC-NEG-006: Expired transaction (past refund window)

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2024-EXPIRED",
  "transactionId": "TXN-EXPIRED",
  "paymentMethod": "CREDIT_CARD",
  "amount": 50.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 422 Unprocessable Entity

{
  "valid": false,
  "errors": [
    {
      "field": "transactionId",
      "message": "Transaction is past the eligible refund window"
    }
  ]
}
```

**Validations:**

- Status code is 422
- Expired transaction rejected with clear message

---

### TC-NEG-007: Invalid payment method

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "BITCOIN",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 400 Bad Request

{
  "valid": false,
  "errors": [
    {
      "field": "paymentMethod",
      "message": "Unsupported payment method: BITCOIN"
    }
  ]
}
```

**Validations:**

- Status code is 400
- Unsupported payment method rejected

---

### TC-NEG-008: Invalid currency code

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "INVALID",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 400 Bad Request

{
  "valid": false,
  "errors": [
    {
      "field": "currency",
      "message": "Invalid ISO 4217 currency code"
    }
  ]
}
```

**Validations:**

- Status code is 400
- Invalid currency rejected

---

### TC-NEG-009: Exceeds daily refund limit for merchant

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-LIMIT",
  "transactionId": "TXN-LIMIT",
  "paymentMethod": "CREDIT_CARD",
  "amount": 5000.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 422 Unprocessable Entity

{
  "valid": false,
  "errors": [
    {
      "field": "amount",
      "message": "Refund would exceed daily refund limit"
    }
  ]
}
```

**Validations:**

- Status code is 422
- Limit enforcement communicated clearly

---

### TC-NEG-010: Empty request body

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{}
```

**Expected Response:**

```json
HTTP 400 Bad Request

{
  "valid": false,
  "errors": [
    {"field": "orderId", "message": "orderId is required"},
    {"field": "transactionId", "message": "transactionId is required"},
    {"field": "paymentMethod", "message": "paymentMethod is required"},
    {"field": "amount", "message": "amount is required"},
    {"field": "currency", "message": "currency is required"}
  ]
}
```

**Validations:**

- Status code is 400
- All missing required fields reported

---

## 5. Security test cases

### TC-SEC-001: Missing authorization header

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 401 Unauthorized

{
  "error": "Authentication required"
}
```

**Validations:**

- Status code is 401
- No data leakage in error response
- Response does not reveal internal details

---

### TC-SEC-002: Expired JWT token

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <expired_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 401 Unauthorized

{
  "error": "Token expired"
}
```

**Validations:**

- Status code is 401
- Expired token rejected

---

### TC-SEC-003: Insufficient permissions (read-only role)

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <readonly_user_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 403 Forbidden

{
  "error": "Insufficient permissions to validate refunds"
}
```

**Validations:**

- Status code is 403
- Role-based access enforced

---

### TC-SEC-004: SQL injection in orderId

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026'; DROP TABLE orders; --",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 400 Bad Request

{
  "valid": false,
  "errors": [
    {
      "field": "orderId",
      "message": "Invalid orderId format"
    }
  ]
}
```

**Validations:**

- Status code is 400 (not 500)
- No SQL execution occurs
- Input sanitized/rejected at validation layer

---

### TC-SEC-005: XSS in reason field

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <valid_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "USD",
  "reason": "<script>alert('xss')</script>"
}
```

**Expected Response:**

```json
HTTP 400 Bad Request

{
  "valid": false,
  "errors": [
    {
      "field": "reason",
      "message": "Invalid reason value"
    }
  ]
}
```

**Validations:**

- Status code is 400
- Script content not reflected unescaped
- Input rejected or sanitized

---

### TC-SEC-006: Rate limiting enforcement

**Priority:** High

**Request:**

```text
POST /api/v1/refunds/validate (repeated 100+ times in 10 seconds)
Authorization: Bearer <valid_token>
```

**Expected Response:**

```json
HTTP 429 Too Many Requests

{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}
```

**Validations:**

- Status code is 429 after threshold
- `Retry-After` header present
- Subsequent valid requests succeed after cooldown

---

### TC-SEC-007: Malformed JWT token

**Priority:** High

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer not.a.valid.jwt.token
Content-Type: application/json

{
  "orderId": "ORD-2026-001234",
  "transactionId": "TXN-98765",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 401 Unauthorized

{
  "error": "Invalid token"
}
```

**Validations:**

- Status code is 401
- No stack trace or internal info exposed

---

### TC-SEC-008: Cross-tenant access (user A validates user B's order)

**Priority:** Critical

**Request:**

```json
POST /api/v1/refunds/validate
Authorization: Bearer <user_a_token>
Content-Type: application/json

{
  "orderId": "ORD-2026-USER-B-ORDER",
  "transactionId": "TXN-USER-B",
  "paymentMethod": "CREDIT_CARD",
  "amount": 49.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected Response:**

```json
HTTP 403 Forbidden

{
  "error": "Not authorized to access this order"
}
```

**Validations:**

- Status code is 403
- Tenant isolation enforced
- No data leakage about other tenant's order
