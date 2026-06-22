# Product Requirements Document: Self-Service Refund Portal

**Document Version:** 1.0  
**Date:** June 22, 2026  
**Author:** Disney Payments Organization  
**Status:** Draft  
**Business Application:** Payment Service (BAPP0012692)

---

## 1. Executive Summary

The Self-Service Refund Portal is a customer-facing digital experience that enables Disney customers to initiate, track, and manage refund requests independently—without contacting customer support. This feature addresses the growing volume of refund-related inquiries handled by customer service agents by providing a streamlined, automated interface integrated with the existing Payment Controls services (BAPP0012692).

Today, all refund requests require agent involvement, resulting in long wait times, increased operational cost, and suboptimal customer satisfaction. The Self-Service Refund Portal will empower customers with direct visibility into their refund eligibility, real-time status tracking, and multi-payment-method support (credit cards, debit cards, gift cards, and digital wallets).

The primary business objective is to reduce customer service call volume for refund inquiries by 60% within 12 months of full launch, while maintaining or improving customer satisfaction scores.

---

## 2. Problem Statement

### Current State
- All refund requests are processed manually by customer service agents via phone, chat, or email.
- Customers lack visibility into refund eligibility, processing timelines, and status updates.
- Average handle time (AHT) for refund calls is 12–15 minutes per interaction.
- Refund-related inquiries account for approximately 35% of total customer service call volume.
- Inconsistent refund decisions across agents lead to policy enforcement gaps and customer frustration.

### Pain Points
| Stakeholder | Pain Point |
|-------------|-----------|
| Customer | Long wait times, no self-service option, lack of transparency on refund status |
| Customer Service Agent | Repetitive manual work, high volume of refund calls, limited tooling |
| Business Operations | High operational cost, inconsistent policy application, limited analytics |

### Desired Future State
A fully automated self-service portal where customers can determine refund eligibility, submit requests, select refund destinations, and track processing status in real time—with agent involvement limited to exception cases and escalations.

---

## 3. Goals & Success Metrics (KPIs)

### Primary Goals
1. Reduce customer service call volume for refund inquiries by 60%
2. Improve customer satisfaction (CSAT) for refund experiences by 20%
3. Decrease average refund processing time from 7–10 business days to 3–5 business days
4. Achieve 80%+ self-service completion rate (customers who start and finish without agent intervention)

### Key Performance Indicators

| KPI | Baseline | Target | Measurement Method |
|-----|----------|--------|-------------------|
| CS Call Volume (Refund) | ~35% of total volume | ≤14% of total volume | Contact center reporting |
| Self-Service Completion Rate | N/A (0%) | ≥80% | Portal analytics |
| Average Refund Processing Time | 7–10 business days | 3–5 business days | Payment system logs |
| CSAT (Refund Experience) | 3.2/5.0 | ≥3.8/5.0 | Post-interaction survey |
| Portal Adoption Rate | N/A | ≥70% of eligible refund requests | Portal analytics |
| Error/Escalation Rate | N/A | ≤10% of portal submissions | Escalation tracking |
| Average Time to Submit Request | N/A | ≤3 minutes | Session analytics |

---

## 4. Target Users / Personas

### Persona 1: Sarah — The Busy Parent
- **Age:** 35–45
- **Tech Comfort:** Moderate
- **Context:** Booked a Disney vacation package but needs to cancel one activity. Wants a quick refund without spending 30 minutes on hold.
- **Needs:** Simple interface, clear eligibility messaging, fast resolution
- **Frustrations:** Long hold times, unclear refund policies, lack of status updates

### Persona 2: Marcus — The Frequent Guest
- **Age:** 28–38
- **Tech Comfort:** High
- **Context:** Annual passholder who makes multiple purchases. Occasionally needs partial refunds for merchandise or dining experiences. Prefers digital interactions over phone calls.
- **Needs:** Transaction history access, partial refund capability, real-time tracking
- **Frustrations:** Repeating information to agents, inconsistent refund outcomes

### Persona 3: Linda — The Gift Card User
- **Age:** 55–65
- **Tech Comfort:** Low to Moderate
- **Context:** Received a Disney gift card and made a purchase that didn't meet expectations. Needs a refund returned to the gift card balance.
- **Needs:** Clear instructions, accessibility features, confirmation of refund destination
- **Frustrations:** Confusing interfaces, lack of confirmation, difficulty finding help

### Persona 4: Alex — The Customer Service Manager (Internal)
- **Age:** 30–50
- **Tech Comfort:** High
- **Context:** Manages a team of CS agents. Needs visibility into portal-submitted refunds, ability to override automated decisions, and analytics on self-service adoption.
- **Needs:** Admin dashboard, override capabilities, reporting, escalation queue management
- **Frustrations:** Lack of data, inconsistent agent decisions, high call volume

---

## 5. User Stories & Acceptance Criteria

### US-01: Initiate a Refund Request

**As a** customer,  
**I want to** initiate a refund request from my order history,  
**So that** I can get my money back without calling customer support.

**Acceptance Criteria:**

```gherkin
Given I am an authenticated customer on the refund portal
  And I have at least one eligible transaction in my order history
When I select a transaction and click "Request Refund"
Then I am presented with a refund request form pre-populated with transaction details
  And I can see the eligible refund amount
  And I can submit the request with a reason for the refund

Given I am an authenticated customer with no eligible transactions
When I navigate to the refund portal
Then I see a message indicating no refund-eligible transactions are available
  And I am offered a link to contact customer support for assistance
```

**Priority:** P0  
**Sprint Target:** Phase 1

---

### US-02: Track Refund Status

**As a** customer,  
**I want to** view the real-time status of my refund requests,  
**So that** I know when to expect my money back and don't need to call support for updates.

**Acceptance Criteria:**

```gherkin
Given I have submitted one or more refund requests
When I navigate to the "My Refunds" section of the portal
Then I see a list of all my refund requests with current status
  And each request displays: request date, amount, payment method, and status (Submitted, In Review, Approved, Processing, Completed, Denied)
  And I can click into any request to see detailed timeline events

Given my refund status changes from one state to another
When I view the refund detail page
Then I see the updated status with a timestamp
  And I see the estimated completion date (if applicable)
```

**Priority:** P0  
**Sprint Target:** Phase 1

---

### US-03: Eligibility Validation

**As a** customer,  
**I want to** immediately know whether my transaction is eligible for a refund,  
**So that** I don't waste time submitting a request that will be denied.

**Acceptance Criteria:**

```gherkin
Given I select a transaction to request a refund
When the system evaluates the transaction against refund policies
Then I receive an immediate eligibility determination (Eligible, Partially Eligible, Not Eligible)
  And if not eligible, I see a clear explanation of why (e.g., "This transaction is past the 30-day refund window")
  And if partially eligible, I see which items/amounts qualify

Given a transaction was made more than 90 days ago
When I attempt to request a refund
Then the system displays "Not Eligible — Transaction exceeds the refund policy window"
  And I am offered the option to submit an exception request for manual review

Given a transaction has already been fully refunded
When I attempt to request a refund
Then the system displays "Not Eligible — This transaction has already been refunded"
  And I see the date and amount of the previous refund
```

**Priority:** P0  
**Sprint Target:** Phase 1

---

### US-04: Partial Refunds

**As a** customer,  
**I want to** request a refund for specific items within a multi-item transaction,  
**So that** I can keep the items I'm satisfied with and only return what I don't want.

**Acceptance Criteria:**

```gherkin
Given I have a multi-item transaction that is refund-eligible
When I initiate a refund request for that transaction
Then I am presented with a line-item breakdown of the order
  And I can select individual items to refund
  And the refund amount updates dynamically based on my selections
  And applicable taxes and fees are prorated accordingly

Given I select some but not all items for a refund
When I submit the partial refund request
Then the system processes only the selected items for refund
  And the remaining items retain their original transaction status
  And the confirmation shows the exact partial refund amount

Given a transaction contains items with different refund eligibility windows
When I view the line items
Then each item shows its individual eligibility status
  And I can only select items that are currently eligible
```

**Priority:** P1  
**Sprint Target:** Phase 2

---

### US-05: Refund to Original Payment Method

**As a** customer,  
**I want** my refund to be returned to the original payment method used for the purchase,  
**So that** the money goes back to the correct account without additional steps.

**Acceptance Criteria:**

```gherkin
Given I submit a refund request for a transaction paid with a credit card
When the refund is approved
Then the refund is processed back to the same credit card (last 4 digits displayed for confirmation)
  And I see the estimated processing time for credit card refunds (5–10 business days)

Given I submit a refund request for a transaction paid with a gift card
When the refund is approved
Then the refund amount is credited back to the gift card balance
  And the updated balance is reflected immediately in my account

Given I submit a refund request for a transaction paid with multiple payment methods (split tender)
When the refund is approved
Then the system proportionally distributes the refund across the original payment methods
  And I see a breakdown of how much is returned to each method

Given the original payment method is no longer valid (e.g., expired card, closed account)
When the refund is approved
Then the system notifies me that the original method is unavailable
  And I am offered alternative refund options (e.g., gift card credit, updated card on file)
  And the selection requires my explicit confirmation before processing
```

**Priority:** P0  
**Sprint Target:** Phase 1

---

### US-06: Refund History

**As a** customer,  
**I want to** view a complete history of all my past refund requests,  
**So that** I can reference previous refunds and have documentation for my records.

**Acceptance Criteria:**

```gherkin
Given I am an authenticated customer
When I navigate to "Refund History" in the portal
Then I see a chronological list of all refund requests (last 24 months)
  And each entry shows: date, original transaction reference, amount, status, and payment method
  And I can filter by status (Completed, Denied, In Progress)
  And I can filter by date range
  And I can search by order number or transaction ID

Given I click on a completed refund in my history
When the detail view loads
Then I see the full timeline from request to completion
  And I see the refund method and confirmation number
  And I can download a refund receipt as PDF
```

**Priority:** P1  
**Sprint Target:** Phase 2

---

### US-07: Notifications

**As a** customer,  
**I want to** receive notifications when my refund status changes,  
**So that** I stay informed without having to repeatedly check the portal.

**Acceptance Criteria:**

```gherkin
Given I have submitted a refund request
When my refund status changes (e.g., Approved, Processing, Completed, Denied)
Then I receive an email notification with the updated status and relevant details
  And I receive an in-app notification (if logged into the portal)
  And the notification includes a deep link to the refund detail page

Given I have opted into SMS notifications in my communication preferences
When my refund status changes
Then I also receive an SMS notification with a brief status update and link

Given my refund has been denied
When I receive the denial notification
Then the notification includes the specific reason for denial
  And it provides instructions on how to appeal or contact support

Given my refund has been completed
When I receive the completion notification
Then the notification includes the refund amount, destination, and expected arrival date
```

**Priority:** P1  
**Sprint Target:** Phase 2

---

### US-08: Admin Override Capabilities

**As a** customer service manager,  
**I want to** override automated refund decisions in the portal,  
**So that** I can handle edge cases and exceptions that fall outside standard policy.

**Acceptance Criteria:**

```gherkin
Given I am an authenticated admin user with override permissions
When I access the admin dashboard
Then I see a queue of refund requests flagged for manual review
  And I see requests that customers have escalated after denial
  And each entry shows customer details, transaction history, and the automated decision rationale

Given I select a denied refund request
When I choose to override the decision
Then I must provide a justification reason (from a predefined list or free text)
  And I can set the approved refund amount (full or custom)
  And I can select the refund destination
  And the override is logged with my user ID, timestamp, and justification

Given I approve an override
When the override is saved
Then the customer is notified of the approval
  And the refund is queued for processing
  And the action appears in the audit trail

Given I am a standard CS agent without override permissions
When I attempt to access the override function
Then I am denied access with a message to escalate to a manager
```

**Priority:** P1  
**Sprint Target:** Phase 2

---

### US-09: Refund Reason Selection and Feedback

**As a** customer,  
**I want to** provide a reason for my refund request,  
**So that** Disney understands my experience and can improve their offerings.

**Acceptance Criteria:**

```gherkin
Given I am submitting a refund request
When I reach the reason selection step
Then I see a list of predefined refund reasons (e.g., "Changed plans," "Product not as described," "Duplicate charge," "Service issue," "Other")
  And I can optionally provide additional comments (free text, max 500 characters)
  And a reason selection is required to proceed with submission

Given I select "Other" as my reason
When I proceed
Then a free text field becomes required (minimum 10 characters)
  And the system does not reject the request based on the reason alone
```

**Priority:** P2  
**Sprint Target:** Phase 2

---

### US-10: Cancel a Pending Refund Request

**As a** customer,  
**I want to** cancel a refund request that has not yet been processed,  
**So that** I can change my mind before the refund is finalized.

**Acceptance Criteria:**

```gherkin
Given I have a refund request in "Submitted" or "In Review" status
When I view the refund detail page
Then I see a "Cancel Request" button
  And clicking it prompts a confirmation dialog

Given I confirm the cancellation
When the cancellation is processed
Then the refund request status changes to "Cancelled"
  And no refund is processed
  And I receive a confirmation notification of the cancellation

Given my refund request is in "Approved" or "Processing" status
When I view the refund detail page
Then the "Cancel Request" button is not available
  And I see a message: "This refund can no longer be cancelled. Please contact support for assistance."
```

**Priority:** P2  
**Sprint Target:** Phase 3

---

### US-11: Accessibility and Multi-Language Support

**As a** customer with accessibility needs or language preferences,  
**I want** the refund portal to be fully accessible and available in my preferred language,  
**So that** I can complete the refund process independently.

**Acceptance Criteria:**

```gherkin
Given I am using a screen reader
When I navigate the refund portal
Then all interactive elements have appropriate ARIA labels
  And focus order is logical and consistent
  And status changes are announced to assistive technology

Given I have my language preference set to Spanish
When I access the refund portal
Then all UI text, labels, and system messages display in Spanish
  And email notifications are sent in Spanish
  And refund policy explanations are localized
```

**Priority:** P1  
**Sprint Target:** Phase 2

---

## 6. Functional Requirements

### FR-01: Authentication & Authorization
- Users must authenticate via existing Disney account (MyDisneyExperience / Disney Account SSO).
- Role-based access: Customer, CS Agent, CS Manager/Admin.
- Session timeout after 15 minutes of inactivity.

### FR-02: Transaction Retrieval
- Portal retrieves transaction history from Payment Service (BAPP0012692) via REST API.
- Displays transactions from the last 24 months.
- Supports filtering and searching by date, amount, order number, and payment method.

### FR-03: Eligibility Engine
- Real-time evaluation of refund eligibility based on configurable business rules.
- Rules include: time window (30/60/90 day policies), transaction type, product category, prior refund history, and fraud indicators.
- Returns eligibility status with human-readable explanation.

### FR-04: Refund Processing
- Submits approved refunds to BAPP0012692 for processing.
- Supports full and partial refund amounts.
- Routes refunds to original payment method by default.
- Handles split-tender transactions proportionally.
- Provides fallback options when original payment method is invalid.

### FR-05: Status Management
- Refund lifecycle states: Submitted → In Review → Approved → Processing → Completed (or Denied/Cancelled at applicable stages).
- Real-time status updates via event-driven architecture.
- Status changes trigger notification dispatches.

### FR-06: Notification Service
- Email notifications for all status changes (mandatory).
- In-app notifications via portal UI.
- SMS notifications (opt-in via communication preferences).
- Push notifications for mobile app (future phase).

### FR-07: Admin Dashboard
- Queue management for manual review items.
- Override capability with audit logging.
- Reporting on refund volume, self-service rates, and processing times.
- Ability to configure eligibility rules (phase 3).

### FR-08: Audit & Compliance
- All refund actions logged with user ID, timestamp, and action detail.
- Override justifications recorded and reportable.
- Data retention per Disney data governance policies.
- PCI-DSS compliance for all payment data handling.

---

## 7. Non-Functional Requirements

### Performance
| Requirement | Target |
|-------------|--------|
| Page load time | ≤2 seconds (P95) |
| Eligibility check response time | ≤1 second (P95) |
| Refund submission acknowledgment | ≤3 seconds (P95) |
| Transaction history retrieval | ≤3 seconds for up to 100 transactions |
| Concurrent users supported | 10,000+ simultaneous sessions |
| System availability | 99.9% uptime (excluding planned maintenance) |

### Security
- All data in transit encrypted via TLS 1.3.
- All payment data at rest encrypted (AES-256).
- PCI-DSS Level 1 compliance maintained.
- No full card numbers displayed (masked with last 4 digits only).
- CSRF protection on all form submissions.
- Rate limiting on API endpoints (100 requests/minute per user).
- Fraud detection integration for anomalous refund patterns.
- Admin actions require MFA.

### Accessibility
- WCAG 2.1 AA compliance minimum.
- Screen reader compatible (ARIA labels, semantic HTML).
- Keyboard-navigable (all interactions achievable without a mouse).
- Color contrast ratios meeting AA standards (4.5:1 for normal text).
- Support for browser zoom up to 200% without loss of functionality.
- Focus indicators visible on all interactive elements.

### Scalability
- Horizontal scaling for stateless application tier.
- Database read replicas for transaction history queries.
- CDN delivery for static assets.
- Queue-based processing for refund submissions (handles burst traffic).
- Designed to support 5x current transaction volume without re-architecture.

### Reliability
- Circuit breaker pattern for downstream service calls (BAPP0012692).
- Graceful degradation if eligibility engine is unavailable (queue for async processing).
- Retry logic with exponential backoff for transient failures.
- Automated alerting for error rates exceeding 1%.

---

## 8. Technical Constraints & Dependencies

### Dependencies
| Dependency | Type | Owner | Risk Level |
|-----------|------|-------|------------|
| Payment Service (BAPP0012692) | API Integration | Disney Payments | High — core dependency for transaction data and refund processing |
| Disney Account SSO | Authentication | Identity Platform | Medium — required for user authentication |
| Notification Service | Email/SMS Dispatch | Platform Services | Medium — required for status notifications |
| Data Warehouse | Analytics/Reporting | Data Engineering | Low — reporting and analytics |
| Fraud Detection Service | Risk Assessment | Trust & Safety | Medium — anomalous refund pattern detection |

### Technical Constraints
- Must use existing Disney Payments API contracts (no breaking changes to BAPP0012692).
- Payment card data must never be stored in the portal database (tokenized references only).
- Must deploy within Disney's existing cloud infrastructure (AWS).
- Must integrate with existing CI/CD pipelines and monitoring (Datadog, Splunk).
- Mobile-responsive design (not a native mobile app in initial release).
- API rate limits imposed by BAPP0012692 (500 req/sec) must not be exceeded.
- Must comply with Disney's Design System (DLS) for UI components.

---

## 9. Out of Scope

The following items are explicitly excluded from this initiative:

1. **Native mobile application** — Portal is web-responsive only; native apps are a future consideration.
2. **Automated refunds without customer initiation** — System will not proactively issue refunds.
3. **Refund policy changes** — This project implements existing policies digitally; policy revisions are a separate workstream.
4. **Chargebacks / dispute resolution** — Bank-initiated chargebacks remain a separate process.
5. **Third-party marketplace refunds** — Only first-party Disney transactions are in scope.
6. **Real-time chat integration** — Live agent chat within the portal is deferred to a future phase.
7. **Loyalty points refunds** — Disney Rewards point reversals are handled by the Loyalty team.
8. **International payment method support beyond US market** — Initial launch is US-only; international expansion in Phase 4+.
9. **Refund method changes post-approval** — Once a refund is approved and in processing, customers cannot change the destination.
10. **Bulk/batch refund processing for customers** — Admin bulk processing is out of scope for initial release.

---

## 10. Assumptions & Risks

### Assumptions
1. BAPP0012692 APIs can support the expected increase in programmatic refund submissions without significant modification.
2. Existing refund policies are documented and can be translated into configurable business rules.
3. Disney Account SSO will provide the necessary user identity context for transaction matching.
4. Customers will have access to the email associated with their Disney account for notifications.
5. Current transaction data in BAPP0012692 contains sufficient detail for line-item eligibility evaluation.
6. Customer service leadership supports the shift to self-service and will assist with change management.

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| BAPP0012692 API performance degradation under increased load | Medium | High | Load testing prior to launch; circuit breakers; phased rollout |
| Fraud exploitation via automated refund requests | Medium | High | Rate limiting; fraud detection integration; anomalous pattern alerts; dollar thresholds for auto-approval |
| Low customer adoption of self-service portal | Low | Medium | In-call IVR deflection; email campaigns; agent-assisted onboarding during transition |
| Eligibility rules not covering all edge cases | High | Medium | Manual review queue for edge cases; iterative rule refinement; admin override capability |
| Downstream payment processor delays | Medium | Medium | Set accurate customer expectations on timelines; provide tracking updates; SLA monitoring |
| Accessibility compliance gaps discovered post-launch | Low | High | Accessibility audit during QA; screen reader testing; VPAT documentation |
| Regulatory/compliance issues with automated refund processing | Low | High | Legal review during design phase; audit trail compliance; PCI-DSS assessment |

---

## 11. Release Strategy (Phased Approach)

### Phase 1: Foundation (Months 1–3)
**Objective:** Core self-service refund flow for simple, full-refund transactions.

**Scope:**
- Customer authentication and transaction retrieval
- Eligibility validation (basic rules: time window, transaction type)
- Full refund request submission
- Refund to original payment method (single tender only)
- Basic status tracking (Submitted, Processing, Completed, Denied)
- Email notifications for status changes
- Internal soft launch with Disney Cast Members (dogfooding)

**Success Gate:** ≥90% of test users complete refund flow without assistance; system handles 1,000 concurrent sessions.

---

### Phase 2: Enhanced Experience (Months 4–6)
**Objective:** Partial refunds, split tender, admin tools, and richer notifications.

**Scope:**
- Partial refund (line-item selection)
- Split-tender refund support
- Refund history (24 months) with search and filter
- SMS and in-app notifications
- Admin dashboard with override capability
- Manual review queue and escalation workflow
- Multi-language support (English, Spanish)
- Accessibility audit and remediation

**Success Gate:** Self-service completion rate ≥70%; CS call volume reduction ≥30%.

---

### Phase 3: Optimization & Scale (Months 7–9)
**Objective:** Advanced features, analytics, and operational excellence.

**Scope:**
- Cancellation of pending requests
- Advanced eligibility rules (customer lifetime value, purchase history, fraud scoring)
- Configurable rules engine (admin-managed)
- Detailed analytics and reporting dashboard
- Performance optimization based on production metrics
- Customer feedback integration (post-refund survey)
- Invalid payment method fallback flows
- PDF receipt generation

**Success Gate:** Self-service completion rate ≥80%; CS call volume reduction ≥60%; CSAT ≥3.8/5.

---

### Phase 4: Future Expansion (Months 10–12+)
**Objective:** Scale to additional markets and channels.

**Scope (Planned):**
- International market expansion (EU, APAC)
- Additional payment method support (region-specific)
- Native mobile app integration
- Live chat escalation within portal
- AI-powered refund recommendation engine
- Proactive refund suggestions (service disruptions)
- Push notifications (mobile)

---

## Appendix A: Glossary

| Term | Definition |
|------|-----------|
| BAPP0012692 | Disney Payment Service business application identifier |
| Split Tender | A transaction paid using multiple payment methods |
| Eligibility Engine | Rules-based service that determines if a transaction qualifies for refund |
| Override | Manual approval of a refund that was automatically denied |
| AHT | Average Handle Time — average duration of a customer service interaction |
| CSAT | Customer Satisfaction Score |
| PCI-DSS | Payment Card Industry Data Security Standard |

---

## Appendix B: Approval & Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Engineering Lead | | | |
| Design Lead | | | |
| Security/Compliance | | | |
| Customer Service Lead | | | |
| Finance/Business Ops | | | |

---

*End of Document*
