# Test Plan: POST /api/v1/refunds/validate

## Overview

This test plan covers the validation endpoint for refund requests in the payment microservice. The endpoint accepts a refund request payload, validates it against business rules, downstream service state, and returns a validation result (approved/rejected with reasons) without actually processing the refund.

---

## 1. Scope

### In scope

- Request payload validation (schema, types, required fields)
- Business rule validation (refund amount limits, eligibility windows, duplicate detection)
- Currency handling and formatting validation
- Idempotency key behavior
- Authentication and authorization checks
- Downstream service integration (order service, payment gateway status)
- Audit logging of validation requests
- Error response structure and HTTP status codes
- Performance under expected and peak load
- Security (injection, PII handling, transport)

### Out of scope

- Actual refund processing (handled by POST /api/v1/refunds)
- Payment gateway webhook handling
- Refund settlement and reconciliation
- UI/frontend integration
- Batch refund operations
- Notification/email delivery after refund

---

## 2. Test strategy

| Type        | Approach                                                                 | Tools                        |
|-------------|--------------------------------------------------------------------------|------------------------------|
| Unit        | Test service layer, validators, mappers in isolation with mocked deps    | JUnit 5, Mockito             |
| Integration | Test controller + service + repository with embedded DB and WireMock     | Spring Boot Test, WireMock   |
| API/Contract| Validate request/response schemas against OpenAPI spec                   | Spring Cloud Contract, Pact  |
| E2E         | Full stack validation against staging environment                        | Bruno, REST Assured          |
| Performance | Load and stress tests against isolated perf environment                  | Gatling, k6                  |
| Security    | Auth bypass, injection, header manipulation, PII leakage                 | OWASP ZAP, manual pen test   |

---

## 3. Functional test cases — happy path

### TC-RFV-001: Validate a valid full refund request

```
Test ID: TC-RFV-001
Title: Validate full refund - valid request
Priority: Critical
Type: Functional / Happy Path

Preconditions:
- Authenticated user with REFUND_VALIDATOR role
- Order ORD-12345 exists with status COMPLETED
- Original payment of $100.00 USD was successful
- No prior refunds exist for this order

Request:
POST /api/v1/refunds/validate
Headers:
  Content-Type: application/json
  Authorization: Bearer {valid_token}
  Idempotency-Key: idem-001-unique
Body:
{
  "orderId": "ORD-12345",
  "transactionId": "TXN-98765",
  "amount": 100.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST",
  "requestedBy": "agent-007"
}

Expected Response:
Status: 200 OK
Body:
{
  "valid": true,
  "orderId": "ORD-12345",
  "transactionId": "TXN-98765",
  "validatedAmount": 100.00,
  "currency": "USD",
  "validationId": "<uuid>",
  "errors": []
}

Validations:
✓ Status code is 200
✓ valid is true
✓ errors array is empty
✓ validationId is a UUID
✓ Response time < 500ms
✓ Audit log entry created
```

### TC-RFV-002: Validate a valid partial refund request

```
Test ID: TC-RFV-002
Title: Validate partial refund - valid request
Priority: Critical
Type: Functional / Happy Path

Preconditions:
- Authenticated user with REFUND_VALIDATOR role
- Order ORD-22222 exists with status COMPLETED
- Original payment of $250.00 USD was successful
- No prior refunds exist for this order

Request:
POST /api/v1/refunds/validate
Headers:
  Content-Type: application/json
  Authorization: Bearer {valid_token}
  Idempotency-Key: idem-002-unique
Body:
{
  "orderId": "ORD-22222",
  "transactionId": "TXN-55555",
  "amount": 75.50,
  "currency": "USD",
  "reason": "ITEM_DAMAGED",
  "requestedBy": "agent-008"
}

Expected Response:
Status: 200 OK
Body:
{
  "valid": true,
  "orderId": "ORD-22222",
  "transactionId": "TXN-55555",
  "validatedAmount": 75.50,
  "currency": "USD",
  "validationId": "<uuid>",
  "errors": []
}

Validations:
✓ Status code is 200
✓ valid is true
✓ validatedAmount matches requested amount
✓ Response time < 500ms
```

### TC-RFV-003: Validate refund with idempotency key returns cached result

```
Test ID: TC-RFV-003
Title: Idempotent request returns cached validation result
Priority: High
Type: Functional / Happy Path

Preconditions:
- Previous validation request with Idempotency-Key "idem-001-unique" succeeded
- Same payload submitted again

Request:
POST /api/v1/refunds/validate
Headers:
  Content-Type: application/json
  Authorization: Bearer {valid_token}
  Idempotency-Key: idem-001-unique
Body:
{
  "orderId": "ORD-12345",
  "transactionId": "TXN-98765",
  "amount": 100.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST",
  "requestedBy": "agent-007"
}

Expected Response:
Status: 200 OK
Body: (identical to first response including same validationId)

Validations:
✓ Status code is 200
✓ validationId matches previous response
✓ No duplicate audit log entry created
✓ Response time < 200ms (cache hit)
```
