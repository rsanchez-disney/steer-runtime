# Business Rules — WDPR Child Authorization Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in MyWiki | |
| Response time (p95) | Not documented in MyWiki | |
| Error rate | Not documented in MyWiki | |

## Peak Periods

- Not documented in MyWiki. Expected traffic during family account creation and child registration flows.

## Business Logic

- COPPA (Children's Online Privacy Protection Act) compliance via PRIVO integration
- Key functions:
  - Initiate authorization for child account
  - Retrieve child account details
  - Retrieve child account profile
  - PRIVO consent management
- Internal accessibility only — consumed by Profile WebAPI WAM and Profile SPA
- Regulatory compliance requirement — COPPA violations carry legal risk

## Dependencies

- PRIVO (external) — child consent verification service
- Profile WebAPI WAM (BAPP0253435) — upstream consumer (child auth flow)
- Profile SPA (BAPP0180489) — upstream consumer (child auth flow UI)

## Impact Classification

- **Full outage:** Parents cannot authorize child accounts. Child profile data unavailable. PRIVO consent flow breaks. Regulatory compliance risk (COPPA).
- **Degraded:** Partial child auth operations may fail. Consent verification delays. Child profile retrieval may time out.
