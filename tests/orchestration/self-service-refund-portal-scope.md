# Self-Service Refund Portal — Project Scope

## Overview

The Self-Service Refund Portal enables Disney Experiences customers to initiate, track, and manage refund requests directly through the platform without contacting customer support. This feature integrates with the existing Disney payments ecosystem, which already handles payment processing, configuration management (Config Studio), and transaction monitoring.

---

## 1. Project boundaries and constraints

### Boundaries

- The portal operates within the authenticated customer experience (My Disney Experience / Disney account).
- Refunds are limited to eligible transactions processed through the Disney payments platform.
- The system enforces automated eligibility rules — no manual override by customers.
- Admin oversight is provided through the existing Config Studio / Payment Controls tooling.
- The portal covers digital self-service only; phone and in-person refund channels remain unchanged.

### Constraints

- Must comply with PCI-DSS requirements for handling payment data.
- Refund processing must route through the existing payment gateway — no direct bank integrations.
- Refund policies are configurable per business unit (Parks, Cruise Line, Resort) but centrally managed.
- Maximum refund amount cannot exceed the original transaction value.
- System must support multi-currency refunds matching the original payment currency.
- All actions must be auditable with immutable logs for compliance and fraud investigation.

---

## 2. In-scope features

### Refund initiation

- Customer-facing form to request a refund for eligible orders/transactions.
- Support for full and partial refund requests.
- Reason code selection (cancellation, dissatisfaction, duplicate charge, service not rendered).
- Attachment upload for supporting documentation (receipts, screenshots).
- Confirmation screen with estimated processing timeline.

### Status tracking

- Real-time refund status visible in the customer's account dashboard.
- Status states: Submitted → Under Review → Approved → Processing → Completed (or Denied).
- Push notifications and email updates at each status transition.
- Historical view of all past refund requests with outcomes.

### Eligibility rules engine

- Configurable rules per product type, business unit, and time window.
- Automatic eligibility check before submission (fail-fast with clear messaging).
- Rules include: refund window (e.g., 30 days post-purchase), product category restrictions, prior refund history limits, and minimum transaction amount thresholds.
- Rule configuration managed through Config Studio by authorized administrators.

### Notifications

- Email notifications at each status change (submitted, approved, denied, completed).
- In-app notifications within My Disney Experience.
- Configurable notification templates per business unit.
- Escalation alerts to finance team for high-value refunds exceeding threshold.

### Admin oversight

- Dashboard in Config Studio for refund request monitoring and metrics.
- Ability to manually approve or deny flagged/escalated refund requests.
- Configurable refund thresholds that trigger manual review.
- Audit trail for all admin actions on refund requests.
- Bulk operations for batch approval during incident recovery.
- Reporting: daily/weekly refund volume, approval rates, average processing time.

---

## 3. Out-of-scope items

| Item                                  | Reason                                                                 |
|---------------------------------------|------------------------------------------------------------------------|
| Chargeback processing                 | Handled by separate fraud/disputes team and payment processor directly |
| Dispute resolution workflows          | Requires dedicated mediation tooling outside this portal's scope       |
| Manual refunds initiated by agents    | Existing agent tooling remains unchanged; no migration planned         |
| Refunds for third-party vendor sales  | Third-party vendors manage their own refund policies                   |
| Gift card or store credit issuance    | Alternative compensation is a separate product initiative              |
| Loyalty points refund/adjustment      | Managed by the loyalty platform team independently                     |
| Payment method changes                | Refund returns to original payment method only                         |
| Cross-border tax recalculation        | Tax adjustments handled downstream by finance systems                  |

---

## 4. Stakeholders

| Stakeholder          | Role                                                                            |
|----------------------|---------------------------------------------------------------------------------|
| Customers            | Primary users initiating and tracking refund requests                           |
| Finance team         | Approves high-value refunds, monitors refund volume, reconciliation             |
| Customer support     | Handles escalations from denied self-service requests, monitors edge cases      |
| Engineering          | Builds, maintains, and operates the portal and integrations                     |
| Compliance           | Ensures PCI-DSS adherence, audit requirements, and data retention policies      |
| Product management   | Defines refund policies, eligibility rules, and customer experience priorities  |
| Business unit leads  | Configure business-specific refund policies (Parks, Cruise, Resort)             |
| Security             | Reviews fraud prevention controls and access patterns                           |

---

## 5. Success criteria and KPIs

### Primary KPIs

| Metric                              | Target                | Measurement method                          |
|-------------------------------------|:---------------------:|---------------------------------------------|
| Reduction in refund support tickets | ≥ 40% within 6 months | Compare pre/post ticket volume              |
| Average refund processing time      | < 3 business days     | Time from submission to funds returned      |
| Customer satisfaction (CSAT)        | ≥ 4.2 / 5.0          | Post-refund survey score                    |
| Self-service adoption rate          | ≥ 60% of all refunds  | Self-service vs. agent-initiated ratio      |
| Refund eligibility accuracy         | ≥ 95%                 | Valid requests approved without escalation   |

### Secondary KPIs

| Metric                              | Target                | Measurement method                          |
|-------------------------------------|:---------------------:|---------------------------------------------|
| Portal uptime                       | ≥ 99.9%              | Infrastructure monitoring                   |
| Fraud detection rate                | < 0.5% false refunds  | Post-refund audit sampling                  |
| Average time to submission          | < 3 minutes           | Session analytics from form start to submit |
| Escalation rate                     | < 15% of requests     | Requests requiring manual admin review      |

### Exit criteria

- All primary KPIs met or trending positive for 4 consecutive weeks post-launch.
- Zero critical/high severity production incidents for 2 weeks post-launch.
- Finance team sign-off on reconciliation accuracy.

---

## 6. Assumptions and dependencies

### Assumptions

- Customers are authenticated via existing Disney account (Keycloak OIDC).
- The existing payment gateway supports programmatic refund initiation via API.
- Order management system provides transaction details (amount, date, product, status) via existing APIs.
- Refund policies are defined and approved by business unit leads before development begins.
- Config Studio can be extended to support refund rule configuration without major architectural changes.
- Email and push notification infrastructure is available and operational.

### Dependencies

| Dependency                       | Owner               | Risk if unavailable                                  |
|----------------------------------|---------------------|------------------------------------------------------|
| Payment gateway refund API       | Payments platform   | Cannot process refunds — blocks core functionality   |
| Order management system API      | Commerce platform   | Cannot validate transactions or determine eligibility |
| Authentication (Keycloak OIDC)   | Identity platform   | Cannot authenticate customers — blocks all access    |
| Config Studio platform           | Config Studio team  | Cannot configure rules — delays admin tooling        |
| Notification service             | Platform services   | Degraded UX — no status updates (non-blocking)       |
| Transaction monitoring           | Payments platform   | Reduced fraud detection capability                   |
| Data warehouse                   | Analytics team      | Delayed KPI reporting (non-blocking)                 |

---

## 7. Risks and constraints

### High-priority risks

| Risk                                          | Impact | Likelihood | Mitigation                                                              |
|-----------------------------------------------|:------:|:----------:|-------------------------------------------------------------------------|
| PCI-DSS compliance gaps                       |  High  |   Medium   | Engage compliance early; no raw card data in portal; tokenized only     |
| Fraudulent refund requests at scale           |  High  |   Medium   | Velocity limits, ML-based fraud scoring, manual review thresholds       |
| Refund policy misconfiguration                |  High  |    Low     | Validation rules in Config Studio; require approval for policy changes  |
| Payment gateway API unavailability            |  High  |    Low     | Queue-based retry with dead-letter; graceful degradation in UI          |
| Customer confusion leading to support spikes  | Medium |   Medium   | Clear UX copy, FAQ integration, phased rollout with support monitoring  |

### Medium-priority risks

| Risk                                          | Impact | Likelihood | Mitigation                                                              |
|-----------------------------------------------|:------:|:----------:|-------------------------------------------------------------------------|
| Multi-currency rounding discrepancies         | Medium |   Medium   | Use original transaction currency; validate amounts server-side         |
| High refund volume during peak events         | Medium |   Medium   | Auto-scaling infrastructure; queue-based processing; rate limiting      |
| Integration latency with order management     | Medium |    Low     | Caching layer for transaction lookups; async eligibility pre-check      |
| Regulatory changes to refund requirements     | Medium |    Low     | Configurable rules engine allows policy updates without code changes    |

### Constraints summary

- PCI-DSS Level 1 compliance is non-negotiable.
- No storage of raw payment card data in the portal — tokenized references only.
- Refund amount validation must occur server-side (never trust client).
- All refund actions require authenticated sessions with MFA for high-value requests.
- Data retention: refund records retained for 7 years per financial compliance requirements.
- Rate limiting: maximum 5 refund requests per customer per 24-hour period.
- The portal must not degrade existing payment processing performance.

---

## Timeline considerations

| Phase       | Duration  | Deliverable                                           |
|-------------|:---------:|-------------------------------------------------------|
| Discovery   | 2 weeks   | Finalized requirements, API contracts, UX wireframes  |
| Development | 8 weeks   | Core portal, eligibility engine, admin dashboard      |
| Testing     | 3 weeks   | Integration testing, security audit, UAT              |
| Soft launch | 2 weeks   | Limited rollout (10% traffic), monitoring             |
| GA          | Ongoing   | Full availability, KPI tracking, iteration            |

---

## Approval

| Role               | Name | Date |
|--------------------|------|------|
| Product owner      |      |      |
| Engineering lead   |      |      |
| Finance sponsor    |      |      |
| Compliance officer |      |      |
| Security reviewer  |      |      |
