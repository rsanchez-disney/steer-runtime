# Test Plan: POST /api/v1/refunds/validate

**Service:** Payment Services (Spring Boot / Java)
**Domain:** Payment Refund Validation
**Date:** 2026-08-06
**Author:** QA — Adaptive Payment Platform
**Related Ticket:** DPAY-14500 (historical bug reference)

---

## Scope

### In scope

- Request payload validation (required fields, formats, boundaries)
- Business rule validation (refund limits, transaction state, expiration)
- HTTP status code correctness (200 for success, 4xx for client errors)
- Feature flag `RLX_AUTH_AMT_CHECK` behavior (bypass vs enforce amount checks)
- Authentication and authorization (Bearer token, role-based access)
- Error response contract (structured JSON error body)
- Performance under expected load (response time SLA)
- Concurrency and idempotency behavior
- Integration with upstream payment/transaction services

### Out of scope

- Actual refund execution (this endpoint only validates)
- UI layer behavior (Payment Controls Client)
- WebAPI/BFF routing (Payment Controls API passthrough)
- Database schema migrations
- Third-party payment gateway integration (mocked at service boundary)

---

## Test Strategy

### Unit tests

- **Ownership:** Developer
- **Coverage:** Validation logic, business rules, feature flag branching, error mapping
- **Framework:** JUnit 5 + Mockito
- **Target:** 90%+ line coverage on validation service/helper classes

### Integration tests

- **Ownership:** Developer + QA
- **Coverage:** Controller → service → repository flow, HTTP status mapping, feature flag integration
- **Framework:** Spring Boot Test (`@WebMvcTest`, `@SpringBootTest`)
- **Target:** All documented status code paths exercised

### API / Contract tests

- **Ownership:** QA
- **Coverage:** Full request/response contract, error shapes, header requirements
- **Framework:** Bruno collection + Newman / REST Assured
- **Target:** All test cases in this plan automated

### Performance tests

- **Ownership:** QA + DevOps
- **Coverage:** Response time SLA, throughput under concurrent load
- **Framework:** k6 or JMeter
- **Target:** p95 < 500ms at 100 RPS

### Regression tests

- **Ownership:** QA
- **Coverage:** Specifically targeting DPAY-14500 pattern — HTTP status codes MUST reflect validation outcome
- **Execution:** Every build, blocking deployment

---

## Test Environment

| Environment | Purpose                          | Data source                |
|-------------|----------------------------------|----------------------------|
| Local       | Developer unit/integration tests | In-memory DB + mocks       |
| Latest      | Automated API test suite         | Shared dev DynamoDB        |
| Stage       | Full regression + performance    | Stage DynamoDB + test data |

- **Test data:** Factory-generated via test fixtures (valid transactions, expired transactions, already-refunded transactions)
- **Feature flags:** Configurable per environment via LaunchDarkly / config service
- **Dependencies:** Transaction lookup service (mocked in local, real in stage)

---

## Test Schedule

| Phase              | Dates                | Owner     |
|--------------------|----------------------|-----------|
| Test design        | Sprint planning week | QA        |
| Unit test dev      | During implementation| Developer |
| API test automation| Implementation + 1d  | QA        |
| Integration run    | Post-merge to develop| Automated |
| Performance test   | Stage deployment     | QA        |
| Regression sign-off| Pre-prod gate        | QA        |

---

## Entry Criteria

- Endpoint implementation code-complete and merged to `develop`
- Unit tests passing with 90%+ coverage on validation logic
- API contract documented (OpenAPI/Swagger spec available)
- Test environment deployed and healthy
- Feature flag `RLX_AUTH_AMT_CHECK` configurable in test environment
- Test data seeded (valid transactions, edge-case transactions)

## Exit Criteria

- All critical and high-priority test cases passing
- No P0/P1 defects open
- HTTP status code regression tests passing (DPAY-14500 prevention)
- Performance benchmark met (p95 < 500ms)
- 100% of documented error codes return correct HTTP status
- Feature flag toggle verified in both states

---

## Risks

| Risk                                                        | Likelihood | Impact   | Mitigation                                                                 |
|-------------------------------------------------------------|:----------:|:--------:|----------------------------------------------------------------------------|
| **DPAY-14500 regression** — endpoint returns 200 for errors | Medium     | Critical | Dedicated regression suite; PR gate blocks merge if status code tests fail |
| Feature flag misconfiguration in production                 | Low        | High     | Test both flag states; document expected behavior per client                |
| Upstream transaction service unavailable in test env        | Medium     | Medium   | Use contract stubs; test timeout/fallback paths                            |
| Concurrent refund race condition                            | Low        | High     | Load test with parallel identical requests; verify idempotency             |
| Schema drift between environments                           | Low        | Medium   | Contract tests run against all environments                                |

---
