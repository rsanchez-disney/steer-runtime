# Test plan — POST /api/v1/refunds/validate (v2)

## Overview

| Attribute    | Value                                                           |
|--------------|-----------------------------------------------------------------|
| Endpoint     | `POST /api/v1/refunds/validate`                                 |
| Service      | Spring Boot (Java) microservice                                 |
| Domain       | Payment validation — refund request pre-processing              |
| Auth         | Bearer token (OAuth2)                                           |
| Date created | 2026-07-03                                                      |
| Author       | Test Planning Agent                                             |
| RCA ref      | DPAY-14500 — HTTP 200 returned for invalid refunds (regression) |

---

## 1. Scope

### In-scope

- HTTP status code correctness (regression from DPAY-14500 — must return 400/4xx, NOT 200, for failures)
- RLX_AUTH_AMT_CHECK flag bypass behavior and edge cases
- RefundTransactionValidator.validateRefundAmount() boundary conditions
- Response body structure consistency with HTTP status codes
- Request payload validation (structure, types, required fields)
- Business rule validation (amount limits, duplicate detection, transaction state)
- Authentication and authorization enforcement
- Integration with transaction lookup (verify referenced transaction exists)
- Unit tests for validator and service logic
- API-level contract tests
- Performance baseline for validation throughput

### Out-of-scope

- Actual refund processing/execution (this endpoint only validates)
- Payment gateway integration
- Downstream ledger updates
- UI/frontend testing
- Load testing at scale (covered by separate performance plan)
- Database migration testing
- V3 migration work (future scope)

---

## 2. Test strategy

| Layer          | Tool / Framework      | Focus                                                            |
|----------------|-----------------------|------------------------------------------------------------------|
| Unit           | JUnit 5 + Mockito     | Validators, service logic, mappers, flag behavior                |
| Integration    | Spring Boot Test + H2 | Controller → service → repository flow, HTTP status correctness  |
| API / Contract | MockMvc / RestAssured | HTTP contract, status codes, response shape consistency          |
| Security       | Spring Security Test  | Auth enforcement, role-based access                              |
| Regression     | JUnit 5 + MockMvc     | DPAY-14500 scenarios — status code correctness                   |
| Performance    | JMH / Gatling         | Baseline latency and throughput under concurrent load            |

### Test pyramid distribution

- Unit tests: ~55% (validators, business rules, flag logic, mappers)
- Integration tests: ~25% (controller + service + persistence + HTTP status)
- API contract tests: ~15% (end-to-end HTTP validation, response consistency)
- Performance tests: ~5% (latency baselines)

---
