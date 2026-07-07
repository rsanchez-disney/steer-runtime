# Test Plan: POST /api/v1/refunds/validate

**Project:** app-payment-controls
**Service:** gcp-admin-services (Java 21, Spring Boot)
**Endpoint:** `POST /api/v1/refunds/validate`
**Author:** Test Planning Agent
**Date:** 2026-07-05
**Version:** 1.0

---

## Assumptions

Since the full API specification is not available, the following assumptions are made:

1. **Request body** contains: `transactionId` (string), `refundAmount` (decimal), `currency` (string, ISO 4217), `reason` (string), `requestedBy` (string), and optionally `originalPaymentMethod` (object) and `metadata` (map)
2. **Validation rules** include: amount must be positive, amount must not exceed original transaction amount, transaction must exist, transaction must be in a refundable state, currency must match original transaction
3. **Response** returns a validation result object with `valid` (boolean), `validationErrors` (array), and `refundEligibility` (object with remaining refundable amount)
4. **Authentication** is via Bearer token (Keystone JWT) in the `Authorization` header
5. **Authorization** requires appropriate role (e.g., `refund_operator` or `refund_admin`)
6. **Rate limiting** may be applied to prevent abuse
7. **Idempotency** — validation is read-only and does not mutate state
8. **PCI-DSS** — no raw card numbers are accepted or returned; only tokenized references
9. **Maximum refund amount** is capped at the original transaction amount (partial refunds allowed)
10. **Transaction states** that allow refunds: `COMPLETED`, `SETTLED`; states that block refunds: `PENDING`, `REFUNDED`, `CANCELLED`, `DISPUTED`

---

## Entry criteria

- Service builds and starts successfully on the test environment
- MariaDB RDS is accessible and seeded with test data
- Keystone authentication service is available (or mocked for unit tests)
- Endpoint is deployed and reachable at `/api/v1/refunds/validate`
- Test data includes transactions in various states and amounts
- CI pipeline is green on the feature branch

## Exit criteria

- All Critical and High priority test cases pass
- No open Critical or High severity defects
- Code coverage for the endpoint ≥ 80% (unit + integration)
- Security scan (SAST/DAST) shows no Critical findings
- Performance baseline established and meets SLA (p95 < 500ms)
- Test results documented and reviewed

---

## Test environment requirements

| Component              | Requirement                                                  |
|------------------------|--------------------------------------------------------------|
| Java version           | 21 (matching production)                                     |
| Spring Boot            | Current project version                                      |
| Database               | MariaDB RDS (Latest environment)                             |
| Auth service           | Keystone (stage: `api.keystone-stg.disney.com`)              |
| Local port             | 8080                                                         |
| VPN                    | Required for internal DNS resolution                         |
| Test data              | Pre-seeded transactions in various states and amounts        |
| Load testing tool      | JMeter or Gatling                                            |
| Security scanning      | OWASP ZAP or Burp Suite                                      |

---

## Risk assessment

| Risk                                       | Likelihood | Impact   | Mitigation                                              |
|--------------------------------------------|:----------:|:--------:|---------------------------------------------------------|
| Keystone unavailability in test env        |   Medium   |   High   | Mock auth for unit tests; retry logic for integration   |
| MariaDB connection pool exhaustion         |    Low     |   High   | Load test with realistic concurrency; monitor pool      |
| PCI data leakage in logs/responses         |    Low     | Critical | Verify no PAN/CVV in any response or log output        |
| Race condition on concurrent validations   |    Low     |  Medium  | Validation is read-only; verify no side effects         |
| Incomplete validation rules                |   Medium   |  Medium  | Collaborate with product to confirm business rules      |
| Downstream service timeout                 |   Medium   |   High   | Verify timeout handling and circuit breaker behavior    |

---


## Test cases

### 1. Functional — positive test cases

| Test ID | Title                                      | Priority | Type       |
|---------|--------------------------------------------|:--------:|------------|
| FP-001  | Validate full refund for completed txn     | Critical | Functional |
| FP-002  | Validate partial refund for completed txn  | Critical | Functional |
| FP-003  | Validate refund for settled transaction    |   High   | Functional |
| FP-004  | Validate minimum refund amount (0.01)      |   High   | Functional |
| FP-005  | Validate refund with all optional fields   |  Medium  | Functional |
| FP-006  | Validate refund with different currencies  |   High   | Functional |
| FP-007  | Validate multiple partial refunds in seq   |   High   | Functional |

---

#### FP-001: Validate full refund for completed transaction

- **Priority:** Critical
- **Type:** Functional
- **Preconditions:** Transaction `TXN-001` exists with status `COMPLETED`, amount `100.00 USD`
- **Test steps:**
  1. Send `POST /api/v1/refunds/validate` with valid Bearer token
  2. Request body: `{"transactionId": "TXN-001", "refundAmount": 100.00, "currency": "USD", "reason": "Customer request", "requestedBy": "agent@disney.com"}`
  3. Verify response status and body
- **Expected result:** HTTP 200, `{"valid": true, "validationErrors": [], "refundEligibility": {"remainingRefundable": 0.00, "originalAmount": 100.00, "alreadyRefunded": 0.00}}`
- **Test data:** Transaction in COMPLETED state, no prior refunds

---

#### FP-002: Validate partial refund for completed transaction

- **Priority:** Critical
- **Type:** Functional
- **Preconditions:** Transaction `TXN-002` exists with status `COMPLETED`, amount `250.00 USD`
- **Test steps:**
  1. Send `POST /api/v1/refunds/validate` with valid Bearer token
  2. Request body: `{"transactionId": "TXN-002", "refundAmount": 75.50, "currency": "USD", "reason": "Partial return", "requestedBy": "agent@disney.com"}`
  3. Verify response status and body
- **Expected result:** HTTP 200, `{"valid": true, "validationErrors": [], "refundEligibility": {"remainingRefundable": 174.50, "originalAmount": 250.00, "alreadyRefunded": 0.00}}`
- **Test data:** Transaction in COMPLETED state, no prior refunds

---

#### FP-003: Validate refund for settled transaction

- **Priority:** High
- **Type:** Functional
- **Preconditions:** Transaction `TXN-003` exists with status `SETTLED`, amount `500.00 USD`
- **Test steps:**
  1. Send `POST /api/v1/refunds/validate` with valid Bearer token
  2. Request body: `{"transactionId": "TXN-003", "refundAmount": 500.00, "currency": "USD", "reason": "Order cancelled", "requestedBy": "agent@disney.com"}`
  3. Verify response
- **Expected result:** HTTP 200, `{"valid": true, "validationErrors": [], "refundEligibility": {"remainingRefundable": 0.00, "originalAmount": 500.00, "alreadyRefunded": 0.00}}`
- **Test data:** Transaction in SETTLED state

---

#### FP-004: Validate minimum refund amount (0.01)

- **Priority:** High
- **Type:** Functional
- **Preconditions:** Transaction `TXN-004` exists with status `COMPLETED`, amount `50.00 USD`
- **Test steps:**
  1. Send `POST /api/v1/refunds/validate` with `refundAmount: 0.01`
  2. Verify response
- **Expected result:** HTTP 200, `{"valid": true, ...}`
- **Test data:** Minimum currency unit refund

---

#### FP-005: Validate refund with all optional fields populated

- **Priority:** Medium
- **Type:** Functional
- **Preconditions:** Transaction `TXN-005` exists with status `COMPLETED`, amount `200.00 USD`
- **Test steps:**
  1. Send request with all optional fields: `metadata`, `originalPaymentMethod` (tokenized)
  2. Verify response accepts and processes correctly
- **Expected result:** HTTP 200, valid response with no errors
- **Test data:** `{"transactionId": "TXN-005", "refundAmount": 50.00, "currency": "USD", "reason": "Guest complaint", "requestedBy": "supervisor@disney.com", "metadata": {"caseId": "CASE-123"}, "originalPaymentMethod": {"token": "tok_visa_4242"}}`

---

#### FP-006: Validate refund with different currencies

- **Priority:** High
- **Type:** Functional
- **Preconditions:** Transactions exist in EUR, GBP, JPY currencies
- **Test steps:**
  1. Validate refund for EUR transaction with EUR amount
  2. Validate refund for GBP transaction with GBP amount
  3. Validate refund for JPY transaction with JPY amount (no decimals)
- **Expected result:** HTTP 200 for each, currency-appropriate validation
- **Test data:** `{"transactionId": "TXN-EUR-001", "refundAmount": 45.00, "currency": "EUR", ...}`

---

#### FP-007: Validate sequential partial refunds

- **Priority:** High
- **Type:** Functional
- **Preconditions:** Transaction `TXN-007` has amount `300.00 USD`, prior refund of `100.00` already processed
- **Test steps:**
  1. Validate refund of `150.00` against the same transaction
  2. Verify remaining refundable amount accounts for prior refunds
- **Expected result:** HTTP 200, `{"valid": true, "refundEligibility": {"remainingRefundable": 50.00, "originalAmount": 300.00, "alreadyRefunded": 100.00}}`
- **Test data:** Transaction with existing partial refund history

---

