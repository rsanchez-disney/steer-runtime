# Test Plan: POST /api/v1/refunds/validate

**Document ID:** TP-DPAY-REFUND-VALIDATE-001
**Version:** 1.0
**Created:** 2026-08-01
**Author:** QA Engineering — Adaptive Payments Team
**Related Tickets:** DPAY-14500 (HTTP status code regression)
**Service:** payment-services (Spring Boot / Java)
**Endpoint:** `POST /api/v1/refunds/validate`

---

## Scope

### In scope

- Functional validation of refund request payloads
- HTTP status code correctness (regression coverage for DPAY-14500)
- Authentication and authorization enforcement
- Input validation and injection prevention
- PCI-DSS compliance for payment data handling
- `RLX_AUTH_AMT_CHECK` flag bypass behavior
- Performance under expected and peak load
- Integration with downstream payment gateway and transaction services
- Multi-property support (WDW, DLR, DCL, DLP)
- Partial refund, over-limit, duplicate, and expired transaction scenarios

### Out of scope

- Refund execution (this endpoint only validates — does not process)
- UI/frontend integration (covered by payment-sheet test plans)
- Mobile SDK integration (separate test cycle)
- Database schema migrations
- Harness pipeline configuration testing
- Load balancer and CDN behavior

---

## Test strategy

| Type            | Approach                                                                 | Environment |
|-----------------|--------------------------------------------------------------------------|-------------|
| Unit            | JUnit 5 + Mockito — service/helper logic, validation rules              | Local       |
| Integration     | Spring Boot Test + WireMock — downstream service interactions            | Latest      |
| Contract        | Consumer-driven contracts — verify API response shape                    | Latest      |
| Regression      | Explicit DPAY-14500 scenarios — HTTP status code assertions              | Latest      |
| Security        | OWASP-aligned injection tests, auth header validation, PCI-DSS checks   | Stage       |
| Performance     | k6 / Gatling — latency SLAs, throughput, connection pool behavior        | Stage       |
| Smoke           | Health check + single happy-path call post-deployment                    | All         |
| Exploratory     | Manual edge case discovery — multi-property, unusual amounts             | Stage       |

---

## Test cases

### 1. Functional — happy path

| ID             | Title                                                    | Priority | Type       |
|----------------|----------------------------------------------------------|----------|------------|
| TC-RFV-001     | Validate full refund with valid transaction ID           | Critical | Functional |
| TC-RFV-002     | Validate partial refund with amount < original           | Critical | Functional |
| TC-RFV-003     | Validate refund for WDW property                         | High     | Functional |
| TC-RFV-004     | Validate refund for DLR property                         | High     | Functional |
| TC-RFV-005     | Validate refund for DCL property                         | High     | Functional |
| TC-RFV-006     | Validate refund for DLP property (EUR currency)          | High     | Functional |
| TC-RFV-007     | Validate refund with all optional fields populated       | Medium   | Functional |
| TC-RFV-008     | Validate refund with minimum required fields only        | High     | Functional |

#### TC-RFV-001: Validate full refund with valid transaction ID

**Preconditions:**

- Valid OAuth token with `refund:validate` scope
- Transaction `TXN-12345` exists with status `CAPTURED`, amount $150.00 USD

**Test steps:**

1. Send `POST /api/v1/refunds/validate` with body:
   ```json
   {
     "transactionId": "TXN-12345",
     "refundAmount": 150.00,
     "currency": "USD",
     "reason": "GUEST_REQUEST",
     "propertyCode": "WDW"
   }
   ```
2. Verify HTTP status code is `200 OK`
3. Verify response body contains `"valid": true`
4. Verify response body contains `"eligibleAmount": 150.00`

**Expected result:**

- HTTP 200
- Response: `{ "valid": true, "eligibleAmount": 150.00, "transactionId": "TXN-12345" }`

---

### 2. Functional — validation rules and boundary conditions

| ID             | Title                                                          | Priority | Type       |
|----------------|----------------------------------------------------------------|----------|------------|
| TC-RFV-010     | Reject refund amount of $0.00                                  | High     | Validation |
| TC-RFV-011     | Reject negative refund amount                                  | High     | Validation |
| TC-RFV-012     | Reject refund amount exceeding original transaction            | Critical | Validation |
| TC-RFV-013     | Reject refund for non-existent transaction ID                  | Critical | Validation |
| TC-RFV-014     | Reject refund for already-fully-refunded transaction           | Critical | Validation |
| TC-RFV-015     | Reject refund with missing transactionId field                 | High     | Validation |
| TC-RFV-016     | Reject refund with missing refundAmount field                  | High     | Validation |
| TC-RFV-017     | Reject refund with unsupported currency code                   | Medium   | Validation |
| TC-RFV-018     | Reject refund with invalid propertyCode                        | Medium   | Validation |
| TC-RFV-019     | Accept refund amount at exactly remaining refundable balance   | High     | Boundary   |
| TC-RFV-020     | Reject refund amount $0.01 over remaining balance              | High     | Boundary   |
| TC-RFV-021     | Validate minimum refund amount ($0.01)                         | Medium   | Boundary   |
| TC-RFV-022     | Validate maximum single refund amount (system limit)           | Medium   | Boundary   |
| TC-RFV-023     | Reject refund with amount having > 2 decimal places            | Medium   | Validation |

#### TC-RFV-012: Reject refund amount exceeding original transaction

**Preconditions:**

- Transaction `TXN-99001` exists with original amount $75.00 USD, no prior refunds

**Test steps:**

1. Send `POST /api/v1/refunds/validate` with `refundAmount: 75.01`
2. Verify HTTP status code is `422 Unprocessable Entity`
3. Verify response contains error code and human-readable message

**Expected result:**

- HTTP 422
- Response: `{ "valid": false, "errorCode": "REFUND_EXCEEDS_ORIGINAL", "message": "Refund amount exceeds refundable balance" }`

---

### 3. Error handling — HTTP status codes (DPAY-14500 regression)

| ID             | Title                                                              | Priority | Type       |
|----------------|--------------------------------------------------------------------|----------|------------|
| TC-RFV-030     | Return 400 for malformed JSON body                                 | Critical | Regression |
| TC-RFV-031     | Return 401 for missing auth token                                  | Critical | Regression |
| TC-RFV-032     | Return 403 for token without refund scope                          | Critical | Regression |
| TC-RFV-033     | Return 404 for non-existent transaction                            | Critical | Regression |
| TC-RFV-034     | Return 409 for transaction with pending refund in progress         | High     | Regression |
| TC-RFV-035     | Return 422 for business validation failures                        | Critical | Regression |
| TC-RFV-036     | Return 429 for rate-limited client                                 | Medium   | Regression |
| TC-RFV-037     | Return 503 when downstream payment gateway is unavailable          | High     | Regression |
| TC-RFV-038     | NEVER return 200 with error in body (DPAY-14500 anti-pattern)      | Critical | Regression |
| TC-RFV-039     | Verify error response body always includes errorCode and message   | High     | Regression |
| TC-RFV-040     | Verify statusCode field is NOT present in success responses        | High     | Regression |

#### TC-RFV-038: NEVER return 200 with error in body (DPAY-14500 anti-pattern)

**Preconditions:**

- Multiple invalid request payloads prepared (missing fields, over-limit amounts, expired transactions)

**Test steps:**

1. Send 10+ variations of invalid requests
2. For each response with HTTP 200, inspect body for `statusCode`, `statusMessage`, or `"valid": false`
3. Assert: NO response with HTTP 200 should contain error indicators

**Expected result:**

- Zero responses return HTTP 200 with error content
- All error conditions produce HTTP 4xx or 5xx status codes

---

### 4. Security tests

| ID             | Title                                                            | Priority | Type     |
|----------------|------------------------------------------------------------------|----------|----------|
| TC-RFV-050     | Reject request without Authorization header                      | Critical | Security |
| TC-RFV-051     | Reject request with expired OAuth token                          | Critical | Security |
| TC-RFV-052     | Reject request with token from wrong audience                    | High     | Security |
| TC-RFV-053     | Reject SQL injection in transactionId field                      | Critical | Security |
| TC-RFV-054     | Reject XSS payload in reason field                               | High     | Security |
| TC-RFV-055     | Reject oversized request body (> 1MB)                            | Medium   | Security |
| TC-RFV-056     | Verify no PAN/card number in request or response                 | Critical | Security |
| TC-RFV-057     | Verify no CVV/CVC data accepted in request body                  | Critical | Security |
| TC-RFV-058     | Verify sensitive fields are masked in application logs            | Critical | Security |
| TC-RFV-059     | Verify TLS 1.2+ enforced on endpoint                             | High     | Security |
| TC-RFV-060     | Verify response headers include security headers (no-sniff, etc) | Medium   | Security |
| TC-RFV-061     | Reject request with Content-Type other than application/json     | Medium   | Security |

#### TC-RFV-056: Verify no PAN/card number in request or response

**Preconditions:**

- PCI-DSS compliance requirement — endpoint must never accept or return full card numbers

**Test steps:**

1. Send request with `"cardNumber": "4111111111111111"` as extra field
2. Verify the field is ignored (not echoed in response)
3. Verify application logs do not contain the card number
4. Verify the endpoint does not require card number for validation

**Expected result:**

- Card number is never present in response body or logs
- Validation works using transactionId reference only (tokenized)

---

### 5. Performance tests

| ID             | Title                                                      | Priority | Type        |
|----------------|------------------------------------------------------------|----------|-------------|
| TC-RFV-070     | Response time < 500ms at P95 under normal load (50 RPS)    | Critical | Performance |
| TC-RFV-071     | Response time < 1000ms at P99 under normal load            | High     | Performance |
| TC-RFV-072     | Sustain 200 RPS for 5 minutes without errors               | High     | Performance |
| TC-RFV-073     | No connection pool exhaustion at 300 RPS sustained         | Critical | Performance |
| TC-RFV-074     | Graceful degradation at 500 RPS (no cascading failures)    | High     | Performance |
| TC-RFV-075     | Memory usage stable (no leaks) over 30-minute soak test    | Medium   | Performance |
| TC-RFV-076     | Response time under cold-start (first request after deploy)| Medium   | Performance |

#### TC-RFV-073: No connection pool exhaustion at 300 RPS sustained

**Preconditions:**

- Stage environment with production-equivalent connection pool configuration
- Monitoring active on connection pool metrics

**Test steps:**

1. Ramp to 300 RPS over 60 seconds
2. Sustain for 10 minutes
3. Monitor active connections, pool wait time, and queue depth
4. Verify no HTTP 503 responses caused by pool exhaustion

**Expected result:**

- Connection pool utilization stays below 80%
- No cascade failures to downstream services (see incident pattern in workspace context)
- Error rate < 0.1%

---

### 6. Integration tests

| ID             | Title                                                             | Priority | Type        |
|----------------|-------------------------------------------------------------------|----------|-------------|
| TC-RFV-080     | Validate transaction lookup via transaction-service               | Critical | Integration |
| TC-RFV-081     | Handle transaction-service timeout (> 5s) gracefully              | High     | Integration |
| TC-RFV-082     | Handle transaction-service 500 response                           | High     | Integration |
| TC-RFV-083     | Validate refund eligibility via payment-gateway                   | Critical | Integration |
| TC-RFV-084     | Handle payment-gateway circuit breaker open state                 | High     | Integration |
| TC-RFV-085     | Verify audit event published to Kafka on successful validation    | Medium   | Integration |
| TC-RFV-086     | Verify audit event published to Kafka on rejected validation      | Medium   | Integration |
| TC-RFV-087     | Validate multi-property routing (WDW vs DLR gateway config)       | High     | Integration |

#### TC-RFV-081: Handle transaction-service timeout gracefully

**Preconditions:**

- WireMock configured to delay transaction-service response by 6 seconds

**Test steps:**

1. Send valid refund validation request
2. Verify endpoint returns within configured timeout (5s + buffer)
3. Verify HTTP status code is `504 Gateway Timeout` or `503 Service Unavailable`
4. Verify error response includes actionable message

**Expected result:**

- HTTP 504 or 503 (NOT HTTP 200 with error in body)
- Response within 6 seconds (does not hang)
- Error message: `"Transaction service unavailable. Please retry."`

---

### 7. RLX_AUTH_AMT_CHECK bypass flag

| ID             | Title                                                                     | Priority | Type     |
|----------------|---------------------------------------------------------------------------|----------|----------|
| TC-RFV-090     | With flag ON: amount validation is bypassed for configured client         | Critical | Feature  |
| TC-RFV-091     | With flag ON: other validations still enforced (auth, transaction exists) | Critical | Feature  |
| TC-RFV-092     | With flag OFF: amount validation enforced normally                        | Critical | Feature  |
| TC-RFV-093     | Flag only applies to clients in the configured allowlist                  | Critical | Security |
| TC-RFV-094     | Non-allowlisted client with flag header is rejected/ignored               | High     | Security |
| TC-RFV-095     | Over-limit refund succeeds validation when flag ON for allowed client     | High     | Feature  |
| TC-RFV-096     | Flag behavior is auditable (logged when bypass is triggered)              | Medium   | Feature  |

#### TC-RFV-090: Amount validation bypassed for configured client

**Preconditions:**

- Client `RELAXED_CLIENT_001` is in the `RLX_AUTH_AMT_CHECK` allowlist
- Transaction `TXN-88001` has original amount $100.00

**Test steps:**

1. Authenticate as `RELAXED_CLIENT_001`
2. Send refund validation with `refundAmount: 500.00` (exceeds original by 5x)
3. Verify HTTP 200 with `"valid": true`
4. Verify audit log records bypass activation

**Expected result:**

- HTTP 200 — validation passes despite amount exceeding original
- Audit log entry: `"RLX_AUTH_AMT_CHECK bypass activated for client RELAXED_CLIENT_001"`

#### TC-RFV-093: Flag only applies to allowlisted clients

**Preconditions:**

- Client `STANDARD_CLIENT_002` is NOT in the allowlist
- Same transaction and over-limit amount as TC-RFV-090

**Test steps:**

1. Authenticate as `STANDARD_CLIENT_002`
2. Send refund validation with `refundAmount: 500.00` (exceeds original)
3. Verify HTTP 422 with `"valid": false`

**Expected result:**

- HTTP 422 — amount validation enforced normally
- No bypass logged

---

### 8. Edge cases — refund-specific scenarios

| ID             | Title                                                                | Priority | Type     |
|----------------|----------------------------------------------------------------------|----------|----------|
| TC-RFV-100     | Partial refund: validate when 50% already refunded                   | Critical | Edge     |
| TC-RFV-101     | Partial refund: validate remaining $0.01 (minimum residual)          | High     | Edge     |
| TC-RFV-102     | Duplicate validation: same request sent twice in rapid succession    | High     | Edge     |
| TC-RFV-103     | Expired transaction: refund window closed (> 90 days)                | Critical | Edge     |
| TC-RFV-104     | Voided transaction: refund not applicable                            | High     | Edge     |
| TC-RFV-105     | Transaction in PENDING state (not yet captured)                      | High     | Edge     |
| TC-RFV-106     | Multi-currency: refund in different currency than original           | Medium   | Edge     |
| TC-RFV-107     | Transaction with chargeback already filed                            | High     | Edge     |
| TC-RFV-108     | Concurrent validation requests for same transaction                  | High     | Edge     |
| TC-RFV-109     | Transaction from decommissioned payment method                       | Medium   | Edge     |
| TC-RFV-110     | Refund for zero-dollar authorization (pre-auth only)                 | Medium   | Edge     |
| TC-RFV-111     | International transaction with FX rate changes since capture         | Medium   | Edge     |

#### TC-RFV-103: Expired transaction — refund window closed

**Preconditions:**

- Transaction `TXN-OLD-001` was captured 91 days ago
- System refund window configured at 90 days

**Test steps:**

1. Send refund validation for `TXN-OLD-001`
2. Verify HTTP 422
3. Verify error code indicates expiration

**Expected result:**

- HTTP 422
- Response: `{ "valid": false, "errorCode": "REFUND_WINDOW_EXPIRED", "message": "Transaction exceeds refund eligibility window (90 days)" }`

#### TC-RFV-108: Concurrent validation requests for same transaction

**Preconditions:**

- Transaction `TXN-CONC-001` with $200.00 remaining refundable

**Test steps:**

1. Send 5 concurrent validation requests for $200.00 each
2. Verify all return HTTP 200 with `"valid": true` (validation is idempotent — does not reserve funds)
3. Verify no race condition causes 500 errors

**Expected result:**

- All 5 return HTTP 200 (validation is read-only, non-locking)
- No 500 errors, no data corruption

---

## Entry criteria

- [ ] Code complete and merged to `develop` branch
- [ ] Unit tests passing (> 80% coverage on new code)
- [ ] Endpoint deployed to Latest environment via Harness auto-deploy
- [ ] Swagger/OpenAPI spec published and reviewed
- [ ] Downstream service stubs (WireMock) configured for integration tests
- [ ] Test data provisioned in Latest environment
- [ ] DPAY-14500 fix confirmed in code review (no HTTP 200 + error body pattern)

## Exit criteria

- [ ] All Critical priority test cases passing
- [ ] All High priority test cases passing (with documented exceptions if any)
- [ ] Zero P0/P1 defects open
- [ ] DPAY-14500 regression tests all pass (TC-RFV-030 through TC-RFV-040)
- [ ] Performance SLAs met (P95 < 500ms, P99 < 1000ms)
- [ ] Security scan clean (no Critical/High findings)
- [ ] RLX_AUTH_AMT_CHECK bypass behavior validated for both allowed and denied clients
- [ ] Connection pool stability confirmed (no exhaustion under 300 RPS)
- [ ] Test results documented in qTest under appropriate test cycle

---

## Risks and mitigations

| Risk                                                         | Probability | Impact   | Mitigation                                                              |
|--------------------------------------------------------------|:-----------:|----------|-------------------------------------------------------------------------|
| DPAY-14500 regression reintroduced in future changes         |    Medium   | Critical | Permanent regression suite in CI; block merge if TC-RFV-038 fails       |
| RLX_AUTH_AMT_CHECK allowlist misconfigured in prod           |    Medium   | High     | Config-as-code review; smoke test validates flag on every deploy         |
| Connection pool exhaustion under peak holiday load           |    High     | Critical | Load test at 2x expected peak; monitor pool metrics in Splunk           |
| Downstream transaction-service latency spikes                |    Medium   | High     | Circuit breaker configured; timeout tests validate graceful degradation  |
| Multi-property routing sends refund to wrong gateway         |    Low      | Critical | Integration tests per property; config validation in deployment smoke   |
| PCI-DSS audit finding on logged data                         |    Low      | Critical | Automated log scanning for PAN patterns; security review gate           |
| Rate limiting misconfigured — blocks legitimate traffic      |    Medium   | Medium   | Staged rollout; rate limit tuning in Stage before Prod                   |

---

## Environment requirements

| Environment | Purpose                                    | Data                                      | Access                        |
|-------------|--------------------------------------------|--------------------------------------------|-------------------------------|
| Local       | Unit tests, developer verification         | Mocked — no external dependencies          | Developer machine             |
| Latest      | Integration tests, regression suite        | Synthetic test data, WireMock stubs         | Auto-deployed on merge        |
| Stage       | Performance, security, E2E                 | Production-like data (anonymized)           | Manual deploy, 1 approval     |
| Prod        | Smoke tests only (post-deploy verification)| Live data — read-only validation            | Manual deploy, 2 approvals    |

### Stage environment specifics

- Connection pool config must match production baseline
- Payment gateway connected to sandbox/test mode
- Splunk monitoring active for error rate alerts
- k6/Gatling runners provisioned with sufficient capacity for 500 RPS tests

---

## Test execution schedule

| Phase              | Duration | Environment | Owner            |
|--------------------|----------|-------------|------------------|
| Unit tests         | Ongoing  | Local/CI    | Developers       |
| Integration tests  | 2 days   | Latest      | QA Engineering   |
| Regression suite   | 1 day    | Latest      | QA Engineering   |
| Security tests     | 2 days   | Stage       | QA + AppSec      |
| Performance tests  | 2 days   | Stage       | QA + SRE         |
| Exploratory        | 1 day    | Stage       | QA Engineering   |
| Prod smoke         | 1 hour   | Prod        | QA + On-call dev |

---

## Traceability

| Requirement / Ticket | Test Cases Covering                        |
|----------------------|--------------------------------------------|
| DPAY-14500           | TC-RFV-030 through TC-RFV-040             |
| RLX_AUTH_AMT_CHECK   | TC-RFV-090 through TC-RFV-096             |
| PCI-DSS              | TC-RFV-056 through TC-RFV-059             |
| Multi-property       | TC-RFV-003 through TC-RFV-006, TC-RFV-087 |
| Performance SLA      | TC-RFV-070 through TC-RFV-076             |
