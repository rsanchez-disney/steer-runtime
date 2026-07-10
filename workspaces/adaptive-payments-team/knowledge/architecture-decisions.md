# Architecture decisions

## Payment-controls-api microservice split

**Status:** Designed (not yet implemented)
**Date:** June 2026
**Context:** INC0067890 mitigation + scalability

### Decision

Split `wdpr-payment-controls-api` (Node.js BFF, port 8625) into:

| Service                  | Port | Responsibility                     |
|--------------------------|------|------------------------------------|
| payment-controls-api     | 8625 | Retained slim gateway (backward compat) |
| dpay-refund-service      | 8630 | Refund processing                  |
| dpay-validation-service  | 8631 | Payment validation                 |

### Key design decisions

- **ALB path-based routing** — no frontend changes needed during migration
- **Strangler fig pattern** — validation first → refund second → decommission BFF
- **SNS/SQS** for cross-service events
- **Fail-closed over-refund guard** (DPAY-14500 mitigation)
- **Isolated connection pools per service** (INC0067890 mitigation)
- **Canary gates with auto-rollback** in Harness

### Migration timeline

~10 weeks across 3 phases:

1. Phase 1: Extract validation-service, shadow traffic
2. Phase 2: Extract refund-service, shadow traffic
3. Phase 3: Decommission BFF routes, retain gateway for legacy

### Motivation

- Single BFF (port 8625) is a SPOF — connection pool exhaustion cascades to all consumers
- Refund logic is high-risk and needs isolated blast radius
- Validation logic is high-traffic and needs independent scaling
