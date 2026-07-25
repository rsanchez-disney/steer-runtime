# Test Plan: POST /api/v1/refunds/validate

## Scope

- **In scope:**
  - Functional validation of refund requests (happy path, validation failures, edge cases)
  - HTTP status code correctness (regression for DPAY-14500)
  - `RLX_AUTH_AMT_CHECK` flag bypass behavior
  - Integration with downstream payment services and database
  - Security (authentication, authorization, input validation, injection prevention)
  - Performance (latency, throughput, concurrency)
- **Out of scope:**
  - Actual refund processing/execution (separate endpoint)
  - UI integration testing
  - Third-party payment gateway end-to-end flows
  - Load balancer and CDN configuration

## Test Strategy

| Type        | Approach                                                                                  |
|-------------|-------------------------------------------------------------------------------------------|
| Unit        | JUnit 5 + Mockito for service/validator logic; verify HTTP status codes at controller     |
| Integration | SpringBootTest with embedded DB; WireMock for downstream services                         |
| Security    | OWASP ZAP scan; manual injection tests; auth token manipulation                           |
| Performance | Gatling scripts targeting 500 RPS sustained; p99 latency < 200ms                          |
| Regression  | Dedicated suite asserting HTTP status codes match business validation outcomes (DPAY-14500)|

## Test Environment

| Environment | Purpose                        | Database        | Downstream Services |
|-------------|--------------------------------|-----------------|---------------------|
| Local       | Unit + integration dev testing | H2 in-memory    | WireMock stubs      |
| CI (Latest) | Automated regression on merge  | MariaDB (Docker)| WireMock stubs      |
| Stage       | Full integration + performance | MariaDB         | Live stage services |
| Pre-prod    | Final validation before release| MariaDB         | Live pre-prod       |

- **Tools:** JUnit 5, Mockito, WireMock, Gatling, OWASP ZAP, Postman/Bruno
- **Test data:** Factory-generated via test fixtures; no production PII

## Test Schedule

| Phase            | Duration | Activities                                       |
|------------------|----------|--------------------------------------------------|
| Test design      | 3 days   | Write test cases, prepare data fixtures          |
| Unit + integration| 3 days  | Implement automated tests, integrate into CI     |
| Security testing | 2 days   | ZAP scan, manual injection, auth boundary tests  |
| Performance      | 2 days   | Gatling scripts, baseline measurement, tuning    |
| Regression       | 1 day    | Execute full regression suite on stage           |
| Sign-off         | 1 day    | Review results, defect triage, approval          |

## Entry Criteria

- Endpoint implementation code-complete and compiling
- Unit tests passing in CI
- Stage environment available with test data seeded
- Downstream service stubs configured (WireMock for CI, live for stage)
- `RLX_AUTH_AMT_CHECK` flag configurable per environment

## Exit Criteria

- All Critical/High priority test cases passing
- No P0/P1 defects open
- HTTP status code regression suite: 100% pass rate
- Performance: p99 < 200ms at 500 RPS sustained for 5 minutes
- Security scan: no Critical/High findings
- Test coverage > 85% on validation logic

## Risks

| Risk                                                  | Likelihood | Impact | Mitigation                                              |
|-------------------------------------------------------|:----------:|:------:|---------------------------------------------------------|
| HTTP 200-on-error regression (DPAY-14500 repeat)      |   Medium   |  High  | Dedicated regression suite with CI gate                 |
| `RLX_AUTH_AMT_CHECK` misconfiguration in prod         |   Medium   |  High  | Config validation tests; environment-specific assertions |
| Downstream service unavailability during stage testing |    Low     | Medium | WireMock fallback; retry window in schedule             |
| Performance degradation under concurrent load         |    Low     |  High  | Early baseline; Gatling in CI for trend detection       |
| Incomplete test data for edge cases                   |   Medium   |  Low   | Data factory with parameterized builders                |

---
