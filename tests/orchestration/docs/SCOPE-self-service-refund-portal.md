# Scope definition — Self-Service Refund Portal

| Field        | Value                                                  |
|--------------|--------------------------------------------------------|
| Feature      | Self-Service Refund Portal                             |
| Platform     | Disney Payments (DPAY)                                 |
| Ecosystem    | Config Studio / Payment Controls                       |
| Version      | v1.0                                                   |
| Date         | 2026-07-12                                             |
| Status       | Draft                                                  |

---

## Executive summary

The Self-Service Refund Portal enables Disney guests to request and track refunds for eligible transactions directly through a digital interface, eliminating the need to contact a call center. Refund eligibility rules are driven by Config Studio configurations per business unit, ensuring operational flexibility without code changes. The portal integrates into the existing Payment Controls ecosystem and respects PCI-DSS compliance boundaries.

---

## In scope

### Core capabilities

| #  | Capability                        | Description                                                                                         |
|:--:|-----------------------------------|-----------------------------------------------------------------------------------------------------|
| 1  | Guest authentication              | Authenticate guests via Keycloak/OIDC before accessing refund functionality                         |
| 2  | Transaction lookup                | Display eligible past transactions for the authenticated guest                                      |
| 3  | Eligibility check                 | Evaluate refund eligibility in real time using Config Studio rules (time window, category, amount)   |
| 4  | Full refund submission            | Allow guest to submit a full refund request for an eligible transaction                             |
| 5  | Partial refund submission         | Allow guest to specify a partial amount within configured limits                                    |
| 6  | Refund to original payment method | Route refund back to the original payment instrument used at purchase                               |
| 7  | Refund status tracking            | Provide real-time status visibility (submitted, processing, approved, completed, rejected)           |
| 8  | Reason capture                    | Require guest to select a refund reason from a configurable list                                    |
| 9  | Notifications                     | Send email/push notifications at key state transitions (submitted, approved, completed, rejected)    |
| 10 | Refund history                    | Show historical refund requests and outcomes for the guest                                          |
| 11 | Policy display                    | Surface applicable refund policy details to guest before submission                                 |
| 12 | Cancellation                      | Allow guest to cancel a pending refund request before processing begins                             |

### Configuration (Config Studio)

| #  | Configurable element                 | Description                                                        |
|:--:|--------------------------------------|--------------------------------------------------------------------|
| 1  | Eligibility time window              | Maximum days after purchase that a refund can be requested          |
| 2  | Eligible transaction categories      | Which product/service types permit self-service refunds             |
| 3  | Maximum refund amount threshold      | Cap per-transaction or per-guest within a rolling period            |
| 4  | Partial refund minimum               | Minimum amount for partial refund requests                         |
| 5  | Refund reason codes                  | Business-unit-specific list of selectable reasons                  |
| 6  | Auto-approval rules                  | Conditions under which refunds are approved without manual review   |
| 7  | Daily/monthly refund limits per guest | Velocity controls to prevent abuse                                 |
| 8  | Business unit toggle                 | Enable/disable self-service refunds per business unit              |

---

## Out of scope (v1)

| #  | Exclusion                                  | Rationale                                                                  |
|:--:|--------------------------------------------|----------------------------------------------------------------------------|
| 1  | Chargebacks and disputes                   | Handled by existing dispute resolution workflow and banking partners        |
| 2  | Agent manual overrides                     | Separate admin tooling; not part of guest-facing portal                     |
| 3  | Cross-currency refunds                     | Requires FX engine integration; deferred to v2                             |
| 4  | Refund to alternative payment method       | Regulatory and reconciliation complexity; v1 returns to original method     |
| 5  | Bulk/batch refund requests                 | Operational tool, not guest-facing                                         |
| 6  | Loyalty point refunds                      | Separate loyalty system integration required                               |
| 7  | Refund for expired payment instruments     | Requires manual resolution by payment ops team                             |
| 8  | Multi-transaction grouped refunds          | Complex UX and reconciliation; deferred to v2                              |
| 9  | Offline / in-park kiosk interface          | v1 targets web/mobile digital channels only                                |
| 10 | Real-time chat escalation from portal      | Customer service integration deferred                                      |

---

## Stakeholders

| Stakeholder                  | Role                                                                             |
|------------------------------|----------------------------------------------------------------------------------|
| Guest users                  | Primary consumers — request and track refunds                                    |
| Payment operations team      | Configure refund policies, monitor refund queues, handle exceptions               |
| Finance / reconciliation     | Ensure refund transactions reconcile with payment gateway and general ledger      |
| Customer service agents      | Reduced inbound refund calls; handle escalations from portal rejections           |
| Product management           | Define business rules, measure adoption, iterate on policies                     |
| Engineering (DPAY)           | Build, maintain, and operate the portal                                          |
| Security / compliance        | Validate PCI-DSS adherence, audit trail, data minimization                       |
| Business unit owners         | Define per-BU refund policies configured in Config Studio                        |

---

## Constraints

| #  | Constraint                           | Detail                                                                                    |
|:--:|--------------------------------------|-------------------------------------------------------------------------------------------|
| 1  | PCI-DSS compliance                   | No card data stored or displayed; tokenized references only; SAQ-A eligible architecture   |
| 2  | Payment gateway integration          | Must use existing gateway refund APIs; no direct bank integrations                        |
| 3  | Config Studio configuration model    | All business rules stored as Config Studio configurations; no hard-coded policy logic      |
| 4  | Performance SLAs                     | Eligibility check < 500ms p95; refund submission < 2s p95; status query < 300ms p95       |
| 5  | Availability                         | 99.9% uptime target; graceful degradation if downstream services are unavailable           |
| 6  | Data retention                       | Refund request records retained per Disney data governance policy (minimum 7 years)        |
| 7  | Audit trail                          | Every refund action logged with actor, timestamp, and state transition                    |
| 8  | Accessibility                        | WCAG 2.1 AA compliance for all guest-facing UI                                           |
| 9  | Localization                         | English in v1; internationalization hooks in place for future locales                     |

---

## Dependencies

| #  | Dependency                          | Owner               | Integration type | Risk          |
|:--:|-------------------------------------|----------------------|------------------|---------------|
| 1  | Payment gateway refund APIs         | Gateway team         | REST / async     | Medium        |
| 2  | Transaction history service         | DPAY platform        | REST             | Low           |
| 3  | Guest authentication (Keycloak)     | Identity team        | OIDC             | Low           |
| 4  | Notification service                | Platform services    | Event / async    | Low           |
| 5  | Config Studio rule engine           | Config Studio team   | Internal SDK     | Low           |
| 6  | Reconciliation ledger               | Finance engineering  | Event / batch    | Medium        |
| 7  | Guest profile service               | Identity team        | REST             | Low           |
| 8  | Fraud / abuse detection             | Risk team            | REST / event     | Medium        |

---

## Success criteria

| #  | Metric                                         | Target                                                    | Measurement                                |
|:--:|------------------------------------------------|-----------------------------------------------------------|--------------------------------------------|
| 1  | Call center refund request reduction            | ≥ 40% reduction within 6 months of launch                 | Call center ticket volume comparison        |
| 2  | Average refund processing time                  | < 5 minutes for auto-approved; < 24 hours for reviewed    | Median time from submission to completion   |
| 3  | Guest satisfaction (CSAT)                       | ≥ 4.2 / 5.0 for refund experience                        | Post-refund survey                         |
| 4  | Self-service adoption rate                      | ≥ 60% of eligible refunds processed via portal            | Portal submissions / total eligible refunds |
| 5  | Refund accuracy                                | ≥ 99.5% refunds processed without error or reversal       | Error rate monitoring                      |
| 6  | Portal availability                            | ≥ 99.9% uptime                                           | Synthetic monitoring                       |
| 7  | Eligibility check latency                      | < 500ms p95                                               | APM instrumentation                        |

---

## Assumptions

| #  | Assumption                                                                                              |
|:--:|----------------------------------------------------------------------------------------------------------|
| 1  | Refund policies are configurable per business unit via Config Studio                                     |
| 2  | Not all transactions are refundable — eligibility is rule-driven                                         |
| 3  | The payment gateway supports programmatic refund initiation via existing APIs                            |
| 4  | Guest identity is verified through existing Keycloak/OIDC authentication — no new identity provider      |
| 5  | Transaction history service provides sufficient data to evaluate eligibility (amount, date, category)    |
| 6  | Auto-approval thresholds reduce manual review queue by ≥ 70%                                            |
| 7  | Notification service supports templated email and push notifications                                    |
| 8  | Existing Config Studio promotion workflow applies to refund policy configurations                        |
| 9  | Fraud/abuse signals are available via existing risk platform APIs                                        |
| 10 | Guests accept the displayed refund policy terms before submission (explicit consent)                     |

---

## Risks and mitigations

| #  | Risk                                              | Impact | Likelihood | Mitigation                                                      |
|:--:|---------------------------------------------------|:------:|:----------:|-----------------------------------------------------------------|
| 1  | Refund abuse / fraud                              |  High  |   Medium   | Velocity limits, fraud scoring, Config Studio abuse rules        |
| 2  | Payment gateway refund API latency or downtime    |  High  |    Low     | Async processing with retry; status polling for guests           |
| 3  | Incorrect eligibility evaluation                  | Medium |    Low     | Comprehensive rule testing; shadow-mode rollout                  |
| 4  | Guest confusion on partial refund amounts         | Medium |   Medium   | Clear UX copy, real-time amount validation, policy display       |
| 5  | Reconciliation drift                              |  High  |    Low     | Event-sourced ledger, daily reconciliation job, alerting         |
| 6  | Scope creep (disputes, chargebacks)               | Medium |   Medium   | Firm v1 boundary; separate backlog for v2 items                  |

---

## High-level architecture context

```text
┌─────────────┐       ┌───────────────────┐       ┌─────────────────────┐
│  Guest UI   │──────▶│  Refund WebAPI    │──────▶│  Payment Gateway    │
│ (Angular)   │       │  (Node / BFF)     │       │  Refund API         │
└─────────────┘       └────────┬──────────┘       └─────────────────────┘
                               │
                    ┌──────────┼──────────┐
                    ▼          ▼          ▼
            ┌────────────┐ ┌────────┐ ┌──────────────┐
            │Config Studio│ │ Tx Hx  │ │Notification  │
            │ Rules       │ │Service │ │   Service    │
            └────────────┘ └────────┘ └──────────────┘
```

- **Guest UI**: Angular app within Payment Controls Client (port 3000)
- **Refund WebAPI**: Node.js BFF layer handling orchestration, eligibility, and gateway calls
- **Config Studio Rules**: Eligibility and policy rules managed via Config Studio configurations
- **Transaction History**: Existing service providing past transaction data
- **Payment Gateway**: Existing integration for refund execution

---

## Next steps

1. Validate scope with payment operations and finance stakeholders
1. Detail API contracts between Refund WebAPI and gateway
1. Define Config Studio schema for refund eligibility rules
1. Create UX wireframes for guest refund flow
1. Plan phased rollout (shadow mode → pilot BU → general availability)
