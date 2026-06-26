# Test plan: POST /api/v1/refunds/validate

**Service:** Config Services (Spring Boot Java backend)
**Endpoint:** `POST /api/v1/refunds/validate`
**Domain:** Payment refund validation
**Author:** test_planner_agent
**Date:** 2026-06-25
**Version:** 1.0

---

## Scope

### In scope

- Request payload schema validation
- Refund amount validation (positive, within original transaction bounds)
- Transaction reference existence and lookup
- Refund eligibility rules (time window, transaction status, duplicate detection)
- Authentication and authorization enforcement
- HTTP status codes and error response contracts
- Performance under expected and peak load
- Integration with transaction data store (DynamoDB/MariaDB)

### Out of scope

- Actual refund processing/execution (separate endpoint)
- Payment gateway interactions
- UI/frontend integration
- Notification/email triggers
- Reporting and audit log verification

---

## Test strategy

| Layer       | Framework          | Coverage target | Focus                                                  |
|-------------|--------------------|:---------------:|--------------------------------------------------------|
| Unit        | JUnit 5 + Mockito  |      90%        | Service logic, validators, eligibility rules           |
| Integration | Spring Boot Test   |      80%        | Controller → service → repository, DB interactions     |
| E2E         | REST Assured       |      70%        | Full request lifecycle with auth, real DB              |
| Performance | Gatling / JMeter   |       —         | Throughput, latency percentiles, error rate under load |

---

## Test environment requirements

- Java 17+ runtime
- Spring Boot test context with embedded H2 or Testcontainers (MariaDB)
- Seeded transaction data (valid, expired, already-refunded, partially-refunded)
- Mock authentication provider (JWT issuer) for unit/integration
- Real auth token source for E2E
- Network access to dependent services (if any) or WireMock stubs
- CI pipeline integration (GitHub Actions / Harness)

---

## Functional test cases

### Happy path

| ID     | Scenario                                    | Input                                                                 | Expected status | Expected response                          |
|--------|---------------------------------------------|-----------------------------------------------------------------------|:---------------:|--------------------------------------------|
| HP-001 | Valid full refund                            | Amount = original amount, valid txn ref, within time window            |       200       | `{ "eligible": true, "reason": null }`     |
| HP-002 | Valid partial refund                         | Amount < original amount, valid txn ref, within time window            |       200       | `{ "eligible": true, "reason": null }`     |
| HP-003 | Valid refund at minimum amount               | Amount = 0.01, valid txn ref                                           |       200       | `{ "eligible": true, "reason": null }`     |
| HP-004 | Valid refund on last day of eligibility      | Amount valid, txn ref valid, request on day 90 of 90-day window        |       200       | `{ "eligible": true, "reason": null }`     |

### Validation errors

| ID     | Scenario                                    | Input                                                                 | Expected status | Expected response                                              |
|--------|---------------------------------------------|-----------------------------------------------------------------------|:---------------:|----------------------------------------------------------------|
| VE-001 | Missing refund amount                       | No `amount` field                                                     |       400       | `{ "error": "VALIDATION_ERROR", "field": "amount" }`          |
| VE-002 | Negative refund amount                      | `amount: -10.00`                                                      |       400       | `{ "error": "VALIDATION_ERROR", "field": "amount" }`          |
| VE-003 | Zero refund amount                          | `amount: 0`                                                           |       400       | `{ "error": "VALIDATION_ERROR", "field": "amount" }`          |
| VE-004 | Amount exceeds original transaction         | `amount: 500.00` when original = 100.00                               |       422       | `{ "eligible": false, "reason": "EXCEEDS_ORIGINAL" }`         |
| VE-005 | Missing transaction reference               | No `transactionRef` field                                             |       400       | `{ "error": "VALIDATION_ERROR", "field": "transactionRef" }`  |
| VE-006 | Transaction reference not found             | `transactionRef: "TXN-NONEXISTENT"`                                   |       404       | `{ "error": "TRANSACTION_NOT_FOUND" }`                         |
| VE-007 | Malformed request body (invalid JSON)       | Non-JSON body                                                         |       400       | `{ "error": "MALFORMED_REQUEST" }`                             |
| VE-008 | Empty request body                          | Empty body                                                            |       400       | `{ "error": "MALFORMED_REQUEST" }`                             |
| VE-009 | Amount with excessive decimal places        | `amount: 10.999`                                                      |       400       | `{ "error": "VALIDATION_ERROR", "field": "amount" }`          |
| VE-010 | Amount exceeds remaining refundable balance | Partial refund already applied, new amount exceeds remainder          |       422       | `{ "eligible": false, "reason": "EXCEEDS_REMAINING" }`        |

### Edge cases

| ID     | Scenario                                    | Input                                                                 | Expected status | Expected response                                              |
|--------|---------------------------------------------|-----------------------------------------------------------------------|:---------------:|----------------------------------------------------------------|
| EC-001 | Refund outside eligibility window           | Valid txn older than 90 days                                          |       422       | `{ "eligible": false, "reason": "WINDOW_EXPIRED" }`           |
| EC-002 | Duplicate refund request (already refunded) | Txn already fully refunded                                            |       422       | `{ "eligible": false, "reason": "ALREADY_REFUNDED" }`         |
| EC-003 | Transaction in pending/processing state     | Txn status = PENDING                                                  |       422       | `{ "eligible": false, "reason": "INVALID_TXN_STATUS" }`       |
| EC-004 | Transaction was voided                      | Txn status = VOIDED                                                   |       422       | `{ "eligible": false, "reason": "INVALID_TXN_STATUS" }`       |
| EC-005 | Concurrent duplicate validation requests    | Same txn ref submitted simultaneously                                 |       200       | Both return consistent eligibility result (idempotent read)    |
| EC-006 | Very large refund amount (boundary)         | `amount: 999999999.99`                                                |       422       | `{ "eligible": false, "reason": "EXCEEDS_ORIGINAL" }`         |
| EC-007 | Special characters in transaction reference | `transactionRef: "TXN-<script>alert(1)</script>"`                     |       400       | `{ "error": "VALIDATION_ERROR", "field": "transactionRef" }`  |
| EC-008 | Extremely long transaction reference        | 1000+ character string                                                |       400       | `{ "error": "VALIDATION_ERROR", "field": "transactionRef" }`  |
| EC-009 | Currency mismatch                           | Refund currency differs from original transaction currency            |       422       | `{ "eligible": false, "reason": "CURRENCY_MISMATCH" }`        |

### Security

| ID     | Scenario                                    | Input                                                                 | Expected status | Expected response                                  |
|--------|---------------------------------------------|-----------------------------------------------------------------------|:---------------:|----------------------------------------------------|
| SC-001 | No authentication token                     | Request without Authorization header                                  |       401       | `{ "error": "UNAUTHORIZED" }`                      |
| SC-002 | Expired JWT token                           | Expired Bearer token                                                  |       401       | `{ "error": "UNAUTHORIZED" }`                      |
| SC-003 | Invalid JWT signature                       | Tampered Bearer token                                                 |       401       | `{ "error": "UNAUTHORIZED" }`                      |
| SC-004 | Insufficient permissions                    | Valid token but missing `refunds:validate` scope                      |       403       | `{ "error": "FORBIDDEN" }`                         |
| SC-005 | Cross-tenant access attempt                 | Token for tenant A, txn belongs to tenant B                           |       403       | `{ "error": "FORBIDDEN" }`                         |
| SC-006 | SQL injection in transaction reference      | `transactionRef: "'; DROP TABLE transactions;--"`                     |       400       | `{ "error": "VALIDATION_ERROR" }`                  |
| SC-007 | Request body size exceeds limit             | Payload > 1MB                                                         |       413       | `{ "error": "PAYLOAD_TOO_LARGE" }`                 |
| SC-008 | Rate limiting exceeded                      | > threshold requests per minute from same client                      |       429       | `{ "error": "RATE_LIMIT_EXCEEDED" }`               |

---

## Non-functional requirements

### Performance

| Metric              | Target               | Measurement method         |
|---------------------|----------------------|----------------------------|
| P50 latency         | < 50ms               | Gatling histogram          |
| P95 latency         | < 200ms              | Gatling histogram          |
| P99 latency         | < 500ms              | Gatling histogram          |
| Throughput          | > 500 req/s          | Sustained 5-minute test    |
| Error rate at peak  | < 0.1%               | 1000 concurrent users      |
| Cold start          | < 3s                 | First request after deploy |

### Reliability

- Graceful degradation when transaction store is unavailable (503 with retry-after header)
- No data corruption under concurrent validation requests for same transaction
- Circuit breaker activates after 5 consecutive downstream failures
- Timeout for DB queries set at 3 seconds

---

## Entry criteria

- Code complete and merged to feature branch
- Unit tests passing (≥ 90% coverage on validation logic)
- API contract/schema finalized and documented
- Test data seeded in integration environment
- Dependencies (transaction store) available or mocked
- No critical/blocker defects in dependent services

## Exit criteria

- All HP and VE test cases passing
- ≥ 90% of EC test cases passing
- All SC test cases passing
- Performance targets met under load test
- No critical or high-severity defects open
- Test report reviewed and signed off

---

## Risks and mitigations

| Risk                                              | Impact | Likelihood | Mitigation                                                        |
|---------------------------------------------------|:------:|:----------:|-------------------------------------------------------------------|
| Transaction store unavailability in test env      |  High  |   Medium   | Use Testcontainers; maintain WireMock stubs as fallback           |
| Eligibility rules change during testing           |  Med   |    Low     | Parameterize time windows and thresholds via config               |
| Race conditions in duplicate detection            |  High  |    Low     | Add concurrency-specific test scenarios; use DB-level constraints |
| Auth provider downtime in E2E                     |  Med   |   Medium   | Use mock JWT issuer for integration; real auth only in E2E        |
| Performance test results skewed by shared infra   |  Med   |   Medium   | Run perf tests in isolated environment; baseline before each run  |
| Incomplete test data coverage                     |  Med   |   Medium   | Generate data programmatically; cover all transaction states       |

---

## Test data requirements

| Entity                   | States needed                                                    |
|--------------------------|------------------------------------------------------------------|
| Transaction              | COMPLETED, PENDING, VOIDED, PARTIALLY_REFUNDED, FULLY_REFUNDED  |
| Transaction age          | < 90 days, exactly 90 days, > 90 days                           |
| Transaction amounts      | 0.01, 1.00, 100.00, 999999.99                                   |
| Refund history           | No prior refunds, single partial, multiple partials, full refund |
| Tenants                  | At least 2 distinct tenants for cross-tenant tests               |

---

## Automation notes

- All test cases should be automated and runnable in CI
- Use `@Tag("unit")`, `@Tag("integration")`, `@Tag("e2e")` for selective execution
- Performance tests run on dedicated schedule (nightly), not on every PR
- Test results feed into `results/summary.json` for orchestrator validation
