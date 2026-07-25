# Test Plan: POST /api/v1/refunds/validate

## Overview

| Field          | Value                                                              |
|----------------|--------------------------------------------------------------------|
| Endpoint       | `POST /api/v1/refunds/validate`                                    |
| Project        | DPAY (Spring Boot)                                                 |
| Author         | test_planner_agent                                                 |
| Date           | 2026-07-25                                                         |
| Related defect | DPAY-14500                                                         |
| Status         | Draft                                                              |

## Background and motivation

Root cause analysis of DPAY-14500 revealed that `SharedPayment.java` unconditionally returns `Response.ok()` (HTTP 200) regardless of business validation outcomes. Validation failures are communicated **only** via the JSON response body (`statusCode: 400510003`, `statusMessage: FAILURE`). This violates HTTP semantics and makes it impossible for clients to rely on standard status codes for error handling.

Additionally, the `RLX_AUTH_AMT_CHECK` feature flag bypasses amount validation entirely for configured clients, creating a secondary risk vector that requires explicit coverage.

This test plan ensures:

1. Correct HTTP status codes are returned for validation failures (400/422, not 200)
2. The JSON error body structure is consistent and correct
3. The feature flag behaves correctly in both states
4. DPAY-14500 cannot regress

---

## Scope

### In scope

- HTTP status code correctness for all validation outcomes
- JSON response body structure and content validation
- `RLX_AUTH_AMT_CHECK` feature flag behavior (enabled/disabled)
- Refund amount boundary validation
- Standard input validation (missing fields, invalid types)
- Authentication and authorization
- Content-type negotiation
- Regression coverage for DPAY-14500
- Performance baseline for the validate endpoint

### Out of scope

- Actual refund execution (this is the *validate* endpoint only)
- Upstream payment gateway interactions
- UI integration
- Load testing at scale (covered separately)

---

## Test environment

| Component       | Details                                                  |
|-----------------|----------------------------------------------------------|
| Runtime         | Spring Boot (JDK 17+)                                   |
| Test framework  | JUnit 5 + MockMvc (unit), RestAssured (integration)     |
| Mocking         | Mockito for service layer, WireMock for external deps   |
| Feature flags   | Toggled via test profile or `@DynamicPropertySource`     |
| CI              | Run on every PR; integration tests gated on deploy       |
| Data            | In-memory H2 or testcontainers for integration tests     |

---

## Entry criteria

- Code complete for endpoint implementation
- Unit tests for `RefundTransactionValidator` passing
- Test environment accessible with valid auth tokens
- Feature flag infrastructure operational

## Exit criteria

- All critical and high-priority test cases pass
- No P0/P1 defects open
- HTTP status code regression tests pass (DPAY-14500 fix verified)
- Feature flag toggle tests pass in both states
- 90%+ branch coverage on validation logic

---

## Test cases

### 1. Happy path

| ID         | Title                                               | Priority | Type       |
|------------|-----------------------------------------------------|----------|------------|
| TC-VAL-001 | Valid refund amount under original transaction limit | Critical | Functional |
| TC-VAL-002 | Valid refund with all required fields present        | Critical | Functional |
| TC-VAL-003 | Valid partial refund (amount < original)             | High     | Functional |
| TC-VAL-004 | Valid full refund (amount == original)               | High     | Functional |

#### TC-VAL-001: Valid refund amount under original transaction limit

**Preconditions:**

- Authenticated client with valid bearer token
- Original transaction exists with amount $100.00
- `RLX_AUTH_AMT_CHECK` is DISABLED for this client

**Request:**

```json
POST /api/v1/refunds/validate
Content-Type: application/json
Authorization: Bearer {valid_token}

{
  "transactionId": "TXN-12345",
  "refundAmount": 50.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected result:**

- HTTP status: `200 OK`
- Body:

```json
{
  "statusCode": 200,
  "statusMessage": "SUCCESS",
  "data": {
    "valid": true,
    "transactionId": "TXN-12345",
    "refundAmount": 50.00
  }
}
```

---

### 2. HTTP status code correctness (DPAY-14500 regression)

| ID         | Title                                                                 | Priority | Type       |
|------------|-----------------------------------------------------------------------|----------|------------|
| TC-REG-001 | Over-limit refund returns HTTP 422, not 200                           | Critical | Regression |
| TC-REG-002 | Missing required field returns HTTP 400, not 200                      | Critical | Regression |
| TC-REG-003 | Invalid transaction ID returns HTTP 422, not 200                      | Critical | Regression |
| TC-REG-004 | Response body still contains error details alongside correct HTTP code | Critical | Regression |
| TC-REG-005 | SharedPayment does NOT override validation HTTP status to 200         | Critical | Regression |

#### TC-REG-001: Over-limit refund returns HTTP 422, not 200

**Preconditions:**

- Original transaction amount: $100.00
- `RLX_AUTH_AMT_CHECK` is DISABLED

**Request:**

```json
POST /api/v1/refunds/validate
Content-Type: application/json
Authorization: Bearer {valid_token}

{
  "transactionId": "TXN-12345",
  "refundAmount": 150.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected result:**

- HTTP status: `422 Unprocessable Entity` (NOT 200)
- Body:

```json
{
  "statusCode": 400510003,
  "statusMessage": "FAILURE",
  "errors": [
    {
      "field": "refundAmount",
      "message": "Refund amount exceeds original transaction amount"
    }
  ]
}
```

**Regression note:** Prior to DPAY-14500 fix, this returned HTTP 200 with error only in body.

#### TC-REG-005: SharedPayment does NOT override validation HTTP status to 200

**Preconditions:**

- Any request that triggers a validation failure

**Test steps:**

1. Send a request with `refundAmount` exceeding the original transaction
2. Capture the raw HTTP response status code
3. Verify the response status is NOT 200
4. Verify the response body contains `statusCode: 400510003`

**Expected result:**

- HTTP status: 4xx (400 or 422 depending on failure type)
- The `SharedPayment.java` path does NOT flatten the status to 200

**Implementation note:** This test should directly assert on the HTTP transport layer to ensure no middleware/framework layer is swallowing the status code.

---

### 3. JSON body error structure

| ID         | Title                                                    | Priority | Type       |
|------------|----------------------------------------------------------|----------|------------|
| TC-ERR-001 | Error response contains statusCode field                 | Critical | Contract   |
| TC-ERR-002 | Error response contains statusMessage field              | Critical | Contract   |
| TC-ERR-003 | Error response contains errors array with field details  | High     | Contract   |
| TC-ERR-004 | Success response contains statusCode 200                 | High     | Contract   |
| TC-ERR-005 | Multiple validation failures return all errors in array  | Medium   | Contract   |

#### TC-ERR-001: Error response contains statusCode field

**Request:** Any invalid request (e.g., missing `transactionId`)

**Expected result:**

- Response body is valid JSON
- Contains top-level `statusCode` field (numeric)
- Value matches the specific error code for the failure type
- Known codes:
  - `400510003` — business validation failure (amount exceeded)
  - `400510001` — missing required field
  - `400510002` — invalid field format

#### TC-ERR-005: Multiple validation failures return all errors in array

**Request:**

```json
{
  "transactionId": "",
  "refundAmount": -5.00,
  "currency": "INVALID"
}
```

**Expected result:**

- HTTP status: `400 Bad Request`
- Body `errors` array contains entries for each invalid field
- At minimum: `transactionId`, `refundAmount`, `currency`

---

### 4. RLX_AUTH_AMT_CHECK feature flag

| ID         | Title                                                              | Priority | Type         |
|------------|--------------------------------------------------------------------|----------|--------------|
| TC-FLG-001 | Flag DISABLED: over-limit refund is rejected                       | Critical | Feature Flag |
| TC-FLG-002 | Flag ENABLED: over-limit refund bypasses amount validation         | Critical | Feature Flag |
| TC-FLG-003 | Flag ENABLED: other validations still enforced (missing fields)    | High     | Feature Flag |
| TC-FLG-004 | Flag ENABLED for client A, DISABLED for client B — isolated        | High     | Feature Flag |
| TC-FLG-005 | Flag toggle mid-session applies immediately                        | Medium   | Feature Flag |
| TC-FLG-006 | Flag ENABLED: refund at exactly original amount passes             | Medium   | Feature Flag |
| TC-FLG-007 | Flag ENABLED: refund 10x original amount still passes (no ceiling) | Medium   | Feature Flag |

#### TC-FLG-001: Flag DISABLED — over-limit refund is rejected

**Preconditions:**

- `RLX_AUTH_AMT_CHECK` = `false` for the requesting client
- Original transaction amount: $100.00

**Request:**

```json
{
  "transactionId": "TXN-12345",
  "refundAmount": 100.01,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected result:**

- HTTP status: `422 Unprocessable Entity`
- Body: `statusCode: 400510003`, `statusMessage: "FAILURE"`
- Error message references amount exceeding limit

#### TC-FLG-002: Flag ENABLED — over-limit refund bypasses amount validation

**Preconditions:**

- `RLX_AUTH_AMT_CHECK` = `true` for the requesting client
- Original transaction amount: $100.00

**Request:**

```json
{
  "transactionId": "TXN-12345",
  "refundAmount": 500.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected result:**

- HTTP status: `200 OK`
- Body: `statusCode: 200`, `statusMessage: "SUCCESS"`, `valid: true`
- Amount validation is completely skipped

#### TC-FLG-003: Flag ENABLED — other validations still enforced

**Preconditions:**

- `RLX_AUTH_AMT_CHECK` = `true` for the requesting client

**Request:**

```json
{
  "refundAmount": 500.00,
  "currency": "USD"
}
```

**Expected result:**

- HTTP status: `400 Bad Request`
- Missing `transactionId` still causes validation failure
- The flag only bypasses *amount* validation, not all validation

#### TC-FLG-004: Flag isolation between clients

**Test steps:**

1. Send over-limit refund as Client A (`RLX_AUTH_AMT_CHECK` = `true`) → expect 200
2. Send identical over-limit refund as Client B (`RLX_AUTH_AMT_CHECK` = `false`) → expect 422

**Expected result:**

- Flag state is client-specific, not global
- Each client gets the correct behavior for their flag configuration

---

### 5. Amount validation boundaries

| ID         | Title                                                  | Priority | Type     |
|------------|--------------------------------------------------------|----------|----------|
| TC-BND-001 | Refund amount = 0.00 (rejected)                        | High     | Boundary |
| TC-BND-002 | Refund amount = -1.00 (rejected)                       | High     | Boundary |
| TC-BND-003 | Refund amount = 0.01 (minimum valid)                   | High     | Boundary |
| TC-BND-004 | Refund amount = original amount exactly (accepted)     | High     | Boundary |
| TC-BND-005 | Refund amount = original + 0.01 (rejected)             | Critical | Boundary |
| TC-BND-006 | Refund amount = original - 0.01 (accepted)             | High     | Boundary |
| TC-BND-007 | Refund amount with excessive decimal places (e.g., 3+) | Medium   | Boundary |
| TC-BND-008 | Refund amount = MAX_DOUBLE / overflow value            | Medium   | Boundary |
| TC-BND-009 | Refund amount = null                                   | High     | Boundary |
| TC-BND-010 | Refund amount as string "fifty"                        | Medium   | Boundary |

#### TC-BND-001: Refund amount = 0.00

**Request:**

```json
{
  "transactionId": "TXN-12345",
  "refundAmount": 0.00,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected result:**

- HTTP status: `422 Unprocessable Entity`
- Error: refund amount must be greater than zero

#### TC-BND-005: Refund amount = original + 0.01 (boundary violation)

**Preconditions:**

- Original transaction: $100.00
- `RLX_AUTH_AMT_CHECK` = `false`

**Request:**

```json
{
  "transactionId": "TXN-12345",
  "refundAmount": 100.01,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected result:**

- HTTP status: `422 Unprocessable Entity`
- Body: `statusCode: 400510003`
- Triggers `RefundTransactionValidator.validateRefundAmount()` rejection

#### TC-BND-008: Refund amount overflow

**Request:**

```json
{
  "transactionId": "TXN-12345",
  "refundAmount": 99999999999999.99,
  "currency": "USD",
  "reason": "CUSTOMER_REQUEST"
}
```

**Expected result:**

- HTTP status: `400 Bad Request` or `422 Unprocessable Entity`
- Does not cause server error (500)
- Graceful handling of extreme values

---

### 6. Standard API validation

| ID         | Title                                            | Priority | Type       |
|------------|--------------------------------------------------|----------|------------|
| TC-INP-001 | Missing transactionId returns 400                | High     | Validation |
| TC-INP-002 | Missing refundAmount returns 400                 | High     | Validation |
| TC-INP-003 | Missing currency returns 400                     | High     | Validation |
| TC-INP-004 | Invalid currency code (e.g., "XXX") returns 422  | Medium   | Validation |
| TC-INP-005 | Empty request body returns 400                   | High     | Validation |
| TC-INP-006 | Malformed JSON returns 400                       | High     | Validation |
| TC-INP-007 | Wrong Content-Type header returns 415            | Medium   | Validation |
| TC-INP-008 | Missing Authorization header returns 401         | Critical | Security   |
| TC-INP-009 | Expired token returns 401                        | Critical | Security   |
| TC-INP-010 | Insufficient scope/permissions returns 403       | High     | Security   |
| TC-INP-011 | SQL injection in transactionId handled safely    | High     | Security   |
| TC-INP-012 | XSS payload in reason field sanitized            | Medium   | Security   |
| TC-INP-013 | Extra unknown fields are ignored (no 500)        | Low      | Validation |

#### TC-INP-006: Malformed JSON returns 400

**Request:**

```text
POST /api/v1/refunds/validate
Content-Type: application/json
Authorization: Bearer {valid_token}

{invalid json content here
```

**Expected result:**

- HTTP status: `400 Bad Request`
- Body contains parseable error message
- Does NOT return 200 with error in body only

#### TC-INP-007: Wrong Content-Type header returns 415

**Request:**

```text
POST /api/v1/refunds/validate
Content-Type: text/plain
Authorization: Bearer {valid_token}

{"transactionId": "TXN-12345", "refundAmount": 50.00}
```

**Expected result:**

- HTTP status: `415 Unsupported Media Type`

---

### 7. Integration and contract tests

| ID         | Title                                                              | Priority | Type        |
|------------|--------------------------------------------------------------------|----------|-------------|
| TC-INT-001 | End-to-end valid refund validate returns 200 from deployed service | Critical | Integration |
| TC-INT-002 | End-to-end invalid refund returns 4xx from deployed service        | Critical | Integration |
| TC-INT-003 | Response schema matches OpenAPI contract                           | High     | Contract    |
| TC-INT-004 | Error response schema matches OpenAPI contract                     | High     | Contract    |
| TC-INT-005 | HTTP status codes match OpenAPI-defined responses                  | Critical | Contract    |
| TC-INT-006 | No middleware/filter rewrites 4xx to 200 in deployed env           | Critical | Integration |

#### TC-INT-006: No middleware/filter rewrites 4xx to 200

**Purpose:** Validates that no infrastructure layer (Spring filters, API gateway, load balancer) intercepts and flattens HTTP status codes.

**Test steps:**

1. Deploy the service to test environment
2. Send a request that should fail validation (over-limit amount)
3. Capture HTTP status at the client level (curl/RestAssured)
4. Assert status is 4xx

**Expected result:**

- Raw HTTP status at the network layer is 4xx
- No proxy/gateway rewrites the status to 200
- This is the primary integration-level regression test for DPAY-14500

---

### 8. Performance

| ID         | Title                                              | Priority | Type        |
|------------|----------------------------------------------------|----------|-------------|
| TC-PRF-001 | Valid request responds within 500ms (p95)           | Medium   | Performance |
| TC-PRF-002 | Invalid request responds within 200ms (p95)         | Medium   | Performance |
| TC-PRF-003 | 100 concurrent valid requests — no degradation      | Low      | Performance |
| TC-PRF-004 | Feature flag lookup does not add >10ms latency      | Low      | Performance |

---

## Regression test suite (DPAY-14500 specific)

These tests MUST run on every PR and deployment. They form the permanent regression gate.

| ID         | Assertion                                                               | Level       |
|------------|-------------------------------------------------------------------------|-------------|
| TC-REG-001 | Over-limit refund → HTTP 422 (not 200)                                  | Unit + Int  |
| TC-REG-002 | Missing required field → HTTP 400 (not 200)                             | Unit + Int  |
| TC-REG-003 | Invalid transaction → HTTP 422 (not 200)                                | Unit + Int  |
| TC-REG-004 | Error body still contains statusCode + statusMessage                    | Unit        |
| TC-REG-005 | SharedPayment path does not flatten status                              | Unit        |
| TC-FLG-001 | Flag disabled: over-limit rejected with 422                             | Unit        |
| TC-FLG-002 | Flag enabled: over-limit accepted with 200                              | Unit        |
| TC-BND-005 | Boundary: original + 0.01 rejected                                      | Unit        |
| TC-INT-006 | Deployed service returns 4xx for validation failures (not 200)          | Integration |

---

## Risk assessment

| Risk                                                    | Likelihood | Impact   | Mitigation                                          |
|---------------------------------------------------------|------------|----------|-----------------------------------------------------|
| SharedPayment.java reverts to returning 200 for errors  | Medium     | Critical | TC-REG-001 through TC-REG-005 as CI gate            |
| RLX_AUTH_AMT_CHECK flag misconfigured per-client        | Medium     | High     | TC-FLG-004 client isolation test                    |
| API gateway rewrites status codes                       | Low        | Critical | TC-INT-006 integration test against deployed env    |
| New validation added but returns 200 on failure         | Medium     | High     | Contract tests (TC-INT-003/004/005) catch drift     |
| Feature flag removed but bypass logic remains           | Low        | Medium   | TC-FLG-001 ensures enforcement when flag is off     |

---

## Test execution schedule

| Phase            | Tests                        | Trigger                     |
|------------------|------------------------------|-----------------------------|
| Development      | TC-VAL, TC-REG, TC-BND       | Every commit (unit)         |
| Pull request     | All unit + contract tests    | PR CI pipeline              |
| Deploy to latest | TC-INT, TC-PRF               | Post-deploy smoke           |
| Sprint cycle     | Full suite                   | Sprint regression run       |
| Release          | Full suite + performance     | Release candidate gate      |

---

## Automation notes

### Unit test implementation (MockMvc)

```java
@Test
void overLimitRefund_returns422_notOk() {
    mockMvc.perform(post("/api/v1/refunds/validate")
            .contentType(MediaType.APPLICATION_JSON)
            .header("Authorization", "Bearer " + validToken)
            .content("""
                {
                  "transactionId": "TXN-12345",
                  "refundAmount": 150.00,
                  "currency": "USD",
                  "reason": "CUSTOMER_REQUEST"
                }
                """))
        .andExpect(status().isUnprocessableEntity())  // NOT status().isOk()
        .andExpect(jsonPath("$.statusCode").value(400510003))
        .andExpect(jsonPath("$.statusMessage").value("FAILURE"));
}
```

### Integration test implementation (RestAssured)

```java
@Test
void deployedService_overLimitRefund_returns422() {
    given()
        .baseUri(deployedServiceUrl)
        .contentType(ContentType.JSON)
        .header("Authorization", "Bearer " + validToken)
        .body(overLimitRefundPayload)
    .when()
        .post("/api/v1/refunds/validate")
    .then()
        .statusCode(422)  // Critical: must NOT be 200
        .body("statusCode", equalTo(400510003))
        .body("statusMessage", equalTo("FAILURE"));
}
```

---

## Dependencies and blockers

- DPAY-14500 fix must be merged before integration tests can pass
- Feature flag infrastructure must support per-client configuration
- OpenAPI spec must be updated to document 400/422 responses
- Auth token generation available in test environment
