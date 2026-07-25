# Q3 FY2026 — Digital Payments (DPAY) quarterly report

> April 1 – June 30, 2026 | Updated July 25, 2026
> Prepared for: Director, Commerce Technology

---

## 1. Executive summary

Q2 2026 delivered meaningful progress on high-value payment initiatives — 3DS Strong Customer Authentication reached full E2E proof, BNPL PayPal integration advanced to production readiness, and platform throughput grew 40% QoQ. However, these gains are overshadowed by a critical recurring production incident (INC0067890, 40+ days, 24 recurrences) and an accelerating velocity freefall across the last three sprints. SLA compliance has dropped to ~60%, and P2 resolution time breached target by 8x. The team's WIP load is unsustainable and sprint commitments are increasingly unreliable.

**Key metrics at a glance:**

| Metric                   | Q1 2026 | Q2 2026 | Trend |
|--------------------------|:-------:|:-------:|:-----:|
| Throughput (SP)          |   118   |   165   |  ↑    |
| Delivery accuracy        |   82%   |   59%   |  ↓    |
| AI-assisted PRs          |   34%   |   38%   |  ↑    |
| SLA compliance           |   85%   |   60%   |  ↓    |
| steer-runtime releases   |    12   |   19+   |  ↑    |

**Director attention required:** INC0067890 recurring cascade demands VP-level escalation. Velocity decline requires immediate intervention.

---

## 2. Key achievements

| Achievement                                          | Business Impact                                                         |
|------------------------------------------------------|-------------------------------------------------------------------------|
| 3DS full E2E proof (Cardinal SDK v3.1.1-0)           | Enables PSD2 compliance for EU transactions; reduces fraud liability    |
| BNPL PayPal integration — SDK, modals, messaging     | New payment method for WDW/DLR guests; incremental conversion expected  |
| OneID V5 migration — JWT flexibility                 | Unblocks identity modernization; removes single-point-of-failure risk   |
| Payment Controls rewrite — CSRF, auth, export        | Security hardening; reduces audit findings; improves operator UX        |
| Pay-By-Link (PBL) feature — cast-facing MVP          | New revenue channel for in-park contactless payments                     |
| Aurora MySQL migration — LOAD/STAGE/PROD pipeline    | Modernizes DB tier; reduces MariaDB operational burden                   |
| 5x FIND security remediations completed              | Closes P1 audit findings; maintains security posture                    |
| steer-runtime v0.2.177 — 19 releases in quarter      | 3 new teams onboarded; 40% more developer tooling coverage              |

---

## 3. Delivery metrics

### Velocity trend (story points delivered / committed)

| Sprint | Committed | Delivered | Accuracy | Trend  |
|--------|:---------:|:---------:|:--------:|:------:|
| SP430  |    88     |    70     |  79.5%   |   —    |
| SP431  |    88     |    56     |  63.6%   |  ↓↓   |
| SP432  |    96     |  ~34*     |  ~35%    |  ↓↓↓  |

*SP432 projected — Day 11 of sprint, 27 of 96 items done (28.1% complete).

### Quarterly throughput

| Metric                          | Q1 2026 | Q2 2026 | Change  |
|---------------------------------|:-------:|:-------:|:-------:|
| Total SP delivered              |   118   |   165   | +40%    |
| Issues resolved (non-sub-task)  |    72   |   105   | +46%    |
| Avg cycle time (days)           |   8.2   |  11.4   | +39% ↓  |

### Delivery accuracy breakdown

- SP430: 79.5% — acceptable but below 80% target
- SP431: 63.6% — significant miss; 3DS scope expansion mid-sprint
- SP432: projected 35-40% — sprint bloated from 82→96 items mid-sprint; high WIP (6-10 items per dev)

### Root cause of declining velocity

1. **Sprint scope inflation:** Items added mid-sprint (SP432: +14 items after start)
1. **WIP violations:** Individual devs carrying 6-10 concurrent items
1. **Carry-over accumulation:** Items spanning 3 sprints (DPAY-14831, DPAY-15648)
1. **Retro action items:** 0/4 completed from prior sprints
1. **Incident distraction:** INC0067890 pulling resources from planned work

---

## 4. Quality and stability

### Incident summary

| Incident     | Severity | Duration  | Recurrences | Status                  |
|--------------|:--------:|:---------:|:-----------:|-------------------------|
| INC0067890   |   P2     | 40+ days  |     24      | OPEN — recurring        |

**INC0067890 — Payment cascade failure:**

- CHG4417669 overwrote June 22 hotfix on July 21-22 (second regression)
- DPAY-15902 merge deadline missed by 4+ days
- P2 resolution time: 66 hours (target: 8 hours) — **8x SLA breach**
- Change management process failing: approved CHG repeatedly reverting fixes

### SLA compliance

| Metric                         | Target | Actual | Status |
|--------------------------------|:------:|:------:|:------:|
| P1 resolution (4hr)            |  100%  |  100%  |   ✅   |
| P2 resolution (8hr)            |  100%  |   60%  |   ❌   |
| Overall SLA compliance         |   95%  |   60%  |   ❌   |
| Mean time to restore (P2)      |  8hr   |  66hr  |   ❌   |

### Defect escape rate

- 3 production bugs this quarter (payment sheet establishment, AVS mismatch, CORS)
- BNPL defects caught in staging (messaging, modal overflow) — QA gate effective
- ECS OOM issue — untracked, unresolved; proposal pending (512→1024 MiB)

---

## 5. AI adoption and tooling

| Metric                     | Q1 2026 | Q2 2026 | Target Q3 |
|----------------------------|:-------:|:-------:|:---------:|
| AI-assisted PRs            |   34%   |   38%   |    45%    |
| Teams using AI tooling     |    5    |    8    |    10     |
| steer-runtime releases     |   12    |   19+   |    —      |

### Tooling growth

- steer-runtime: v0.2.158 → v0.2.177 (19 releases this quarter)
- 3 new workspaces onboarded: `shuri-team`, `cerebro-team`, `ai-analytics-team`
- AI-assisted development used for: 3DS integration, PBL scaffolding, test generation (genie), export pagination

### Estimated productivity gains

- ~15% reduction in boilerplate code time (measured via PR size/cycle time correlation)
- Functional test generation via AI (DPAY-16104) reducing manual test authoring

---

## 6. Platform and infrastructure

### steer-runtime

| Metric                  | Value                                                |
|-------------------------|------------------------------------------------------|
| Current version         | v0.2.177                                             |
| Releases this quarter   | 19+                                                  |
| New workspaces          | shuri-team, cerebro-team, ai-analytics-team          |
| Agent configurations    | 45+ active agents across profiles                    |

### Infrastructure changes

| Change                                        | Status      | Impact                          |
|-----------------------------------------------|-------------|---------------------------------|
| Aurora MySQL migration (LOAD/STAGE)           | Complete    | DB modernization                |
| Aurora MySQL PROD replication                 | In progress | Final cutover pending           |
| Voltage 7.1.0 + Entrust 13.6.16 upgrade      | Complete    | Encryption compliance           |
| EC2 RHEL9 migration (AFx/Gateways)           | Complete    | OS modernization                |
| ECS memory increase (512→1024 MiB)           | Proposed    | OOM remediation — unscheduled   |
| KMS Lambda PROD US-WEST-2                    | Ready       | Multi-region encryption         |
| DB cluster resizing (Gift Card PROD)         | In progress | Performance/capacity            |

---

## 7. Risks and mitigations

| # | Risk                                             | Severity | Impact                                   | Mitigation                                                    | Owner         |
|---|--------------------------------------------------|:--------:|------------------------------------------|---------------------------------------------------------------|---------------|
| 1 | INC0067890 recurring cascade (40+ days)          | CRITICAL | Guest payment failures; revenue loss     | VP escalation; freeze CHG4417669; dedicated fix team          | Director      |
| 2 | Velocity freefall (79%→64%→35%)                  |   HIGH   | Q3 commitments at risk; team burnout     | Cap WIP to 3/dev; stop mid-sprint additions; retro discipline | Scrum Master  |
| 3 | SP432 sprint bloat (82→96 mid-sprint)            |   HIGH   | Predictability collapse; stakeholder trust| Enforce sprint lock after Day 2; overflow to backlog          | Product Owner |
| 4 | ECS OOM unresolved                               |  MEDIUM  | Intermittent service degradation         | Track as P2; approve 512→1024 MiB increase                   | Platform Lead |
| 5 | 3DS mobile (iOS Cardinal SDK) multi-sprint carry |  MEDIUM  | Delays PSD2 mobile compliance            | Dedicate Mathew Le; remove competing assignments              | Tech Lead     |
| 6 | 0/4 retro action items completed                 |  MEDIUM  | Process debt compounds sprint-over-sprint | Assign owners with due dates; block sprint start until done   | Scrum Master  |

---

## 8. Roadmap — Q3 2026 priorities

| Priority | Initiative                                | Target Sprint | Dependencies            |
|:--------:|-------------------------------------------|:-------------:|-------------------------|
|    1     | INC0067890 permanent resolution           |    SP433      | CHG freeze, dedicated team |
|    2     | 3DS mobile launch (iOS + Android)         |   SP433-434   | Cardinal SDK validation |
|    3     | BNPL PayPal production rollout            |    SP433      | Load testing complete   |
|    4     | Pay-By-Link cast-facing MVP               |   SP434-435   | PBL backend services    |
|    5     | Aurora MySQL PROD cutover                 |    SP434      | EAR access approved     |
|    6     | ECS memory remediation                    |    SP433      | Change approval         |
|    7     | Gift Card data retention implementation   |   SP434-435   | Stakeholder sign-off    |
|    8     | Processor certification (Fiserv 3DS auth) |   SP434-435   | Gateway updates         |
|    9     | reCAPTCHA guest friction reduction        |    SP435      | Spike complete (SP432)  |

---

## 9. Recommendations

### Immediate (this week)

1. **Escalate INC0067890 to VP level.** 40 days, 24 recurrences, 8x SLA breach — this requires executive sponsorship to freeze the conflicting change (CHG4417669) and assign a dedicated resolution team.

1. **Institute sprint scope lock.** No items added after Day 2 of sprint. SP432 grew 17% mid-sprint; this practice makes commitments meaningless.

### Short-term (next 2 sprints)

3. **Cap WIP to 3 items per developer.** Current load of 6-10 items per dev guarantees context-switching waste and missed commitments. Enforce via board configuration.

4. **Mandatory retro action item completion.** Block sprint planning until prior retro items are closed. Zero completion across 4 items signals process is not being taken seriously.

5. **Track ECS OOM as a P2 ticket.** This has been "proposed" for weeks with no formal tracking. Create the ticket, assign it, schedule the change.

### Medium-term (Q3)

6. **Establish change management gate for production hotfixes.** CHG4417669 has overwritten the same hotfix twice. Implement a protection mechanism — tag-based deployment locks or hotfix branch protection.

7. **Review team capacity against commitments.** Three consecutive sprints of declining delivery accuracy suggests commitments exceed actual capacity. Right-size sprint commitments to 60-70 SP until velocity stabilizes.

---

## 10. Appendix — sprint-level data

### SP430 (completed)

| Metric         | Value                          |
|----------------|:------------------------------:|
| Committed      | 88 SP                          |
| Delivered      | 70 SP                          |
| Accuracy       | 79.5%                          |
| Key deliveries | 3DS UI/API/RMS full stack, PayPal modal integration, APP lower env support |

**Notable completions:** DCAP 3DS iFrame setup, CyberSource integration, PayPal iframe integration, BNPL CORS fix, DB ownership standardization, Splunk error remediation.

### SP431 (completed)

| Metric         | Value                          |
|----------------|:------------------------------:|
| Committed      | 88 SP                          |
| Delivered      | 56 SP                          |
| Accuracy       | 63.6%                          |
| Key deliveries | MLE for CyberSource, 3DS persistence layer, OneID V5 JWT, FIND remediations |

**Notable completions:** Payment Services 3DS persistence, MLE encryption for PA APIs, OneID V5 migration (DGC.com + PaymentSheet), Voltage 7.1.0 LOAD upgrade, Android Cardinal SDK setup.

**Rejected items:** DPAY-15681, DPAY-15676 (RMS 3DS — approach changed)

### SP432 (in progress — Day 11)

| Metric         | Value                          |
|----------------|:------------------------------:|
| Committed      | 96 items (inflated from 82)    |
| Done/Closed    | 27 items                       |
| Completion     | 28.1%                          |
| Key active work | PBL feature development, BNPL prod readiness, 3DS processor cert, Gift Card DB work |

**Completed so far:** BNPL load testing, PayPal messaging fixes, 3DS Android alignment, PBL initial UI, Android Cardinal validation, security remediation FIND-47400 (in progress).

**At risk:** 6 items "Not Started", 13 items in "In Development", 10 items in "Dev in Progress" — heavy WIP.

### Carry-over items (spanning 3+ sprints)

| Ticket      | Summary                                      | Sprints          |
|-------------|----------------------------------------------|------------------|
| DPAY-14831  | DVC Pay with Points UI                       | SP430→431→432    |
| DPAY-15648  | iOS Cardinal SDK Integration                 | SP431→432        |
| DPAY-15660  | Payment Sheet API — New Client Configs       | SP430→431→432    |
| DPAY-14683  | Payment Control UI — Batch status bug        | SP423→431→432    |

---

*Report generated July 25, 2026. Data sourced from Jira Cloud (DPAY project) and operational metrics.*
