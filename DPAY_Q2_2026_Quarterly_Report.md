# DPAY — Q2 2026 Quarterly Business Report

**Team:** Disney Payments Platform (DPAY)  
**Period:** April 1 – June 30, 2026 (Final Post-Quarter Update)  
**Prepared:** July 8, 2026  
**Distribution:** Director / SVP Leadership  

---

## Executive Summary

Q2 2026 was a high-output quarter for DPAY, delivering **118 Story Points (+19% QoQ)** across critical identity migration, payment authentication, and platform modernization workstreams. The team achieved end-to-end proof on two strategic initiatives — **OneID V5 multi-platform migration** and **3DS Cardinal SDK authentication** — while sustaining Config Studio operations and growing the AI developer platform (steer-runtime) to 148 agents across 16 profiles.

These gains were offset by a **persistent production incident (INC0067890)** that recurred 14 times due to a deployment governance gap, driving GSM status to RED for 5+ consecutive weeks and pulling delivery accuracy to **74.7% (below the 80% target)**. The root cause is known and the fix is straightforward — merge the June 22 hotfix into the base AMI — but the absence of a deployment gate continues to allow regressions on every patching cycle.

**Top-level asks for leadership:**
1. Approve deployment guardrails to prevent hotfix overwrites (INC0067890 — 14 recurrences)
2. Acknowledge velocity dip as incident-driven, not performance-driven
3. Fund 0.5 FTE observability investment for payment gateway stability

---

## 1. Key Achievements

### 1.1 OneID V5 Migration (DPAY-15726)

Multi-platform Identity SDK migration from V4 to V5 OIDC — the largest cross-platform initiative this quarter.

| Platform | Status | Key Deliverable |
|----------|--------|-----------------|
| **Android** | ✅ Merged | PR #905 (V4/V5 toggle + TLS hardening) — May 12 |
| **Android** | ✅ E2E Confirmed | PR #912 (Identity SDK 5.1.0 integration) |
| **Web Demo** | ✅ Merged | PR #121 & #123 (Browser V5 SDK + CSP fix) |
| **Web Demo API** | ✅ Merged | PR #58 (4-step OIDC flow) — Apr 21 |
| **Payment Sheet API** | ✅ Merged | PR #949 (V5 token SWID/trust metadata) — Jul 1 |
| **iOS** | 🔄 In Progress | PR #1477 (Identity SDK V5) — Jeremias |
| **Scope Fix** | ✅ Finalized Jul 7 | PR #956 (comprehensive hasScope fix), PR #134, PR #63 |

**Impact:** Unblocks DLR Ticket Mods (TEP3-36386) and enables unified V5 identity across all payment surfaces. iOS completion is the final platform gap, tracked for early Q3.

---

### 1.2 3DS Authentication (DPAY-15646)

Cardinal SDK integration for 3D Secure payment authentication.

- **Full end-to-end proof achieved July 8, 2026**
- Cardinal SDK v3.1.1-0 successfully initializes with device data token
- Thread safety fix applied (CardinalSDKHelper.kt — background→main thread dispatch)
- Maestro UI test automation established (`.maestro/` test suite, Makefile with 19 targets)

**Impact:** Removes dependency on legacy 3DS flow. Production readiness is the Q3 target.

---

### 1.3 GCP Admin Services

- **v2.0.0-391 deployed successfully**
- Testing wave completed: 62 bugs identified in SP429, all addressed
- System operational and stable post-deployment

---

### 1.4 Payment Controls (Config Studio)

- PR #301 reviewed and approved (ACH tokenization config fix — DPAY-15871)
- Streaming exports and progress indicators maintained
- Platform stable and serving production traffic

---

### 1.5 steer-runtime (AI Developer Platform)

| Metric | Q1 End | Q2 End | Change |
|--------|--------|--------|--------|
| Version | v0.2.122 | v0.2.153 | +31 releases |
| Agents | ~120 | 148 | +28 agents |
| Profiles | 12 | 16 | +4 profiles |
| Platform support | macOS, Linux | macOS, Linux, Windows | +Windows (v2.11) |

**New Q2 capabilities:**
- Connected Products workspace
- POS orchestration agents (android_arch, android_dev, android_test, android_quality, android_pr)
- QA Validation Agent
- PM Agent fixes and MCP bundles rebuild
- Token savings strategy spec published
- myjira/mywiki migration to Atlassian Cloud completed

**Adoption:** Fully adopted by DPAY; expansion to Connected Products and POS teams in Q2.

---

### 1.6 RDJ to Spring Batch Modernization

Assessment completed July 7, 2026:
- Full migration path reviewed: Oracle 9 → Oracle 19, RDJ → Spring Batch
- **14 open questions** documented for stakeholder resolution
- **8 critical assumptions** flagged for validation
- Next steps defined: inventory sprint, POC with AI agent on 2–3 representative jobs, architecture workshop

---

## 2. Velocity & Delivery Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Story Points (Quarter) | — | 118 | +19% QoQ ✅ |
| Delivery Accuracy | 80% | 74.7% | ⚠️ Below target |
| Completion Rate (SP427) | — | 87.6% | ✅ |
| Completion Rate (SP428–SP429) | — | ~77% | ⚠️ Declined |
| PRs per Sprint | — | 11+ avg | ✅ Healthy |
| Sprint Cadence | 2-week | SP427→SP429 | ✅ On cadence |

**Root Cause for Delivery Accuracy Dip:**
1. INC0067890 — 14 recurrences consumed unplanned sprint capacity (firefighting, RCA, hotfixes)
2. GCP Admin testing wave — 62 bugs discovered in SP429 exceeded the 30% bug-intake threshold
3. Incident-driven, not performance-driven — throughput *increased* 19% despite disruptions

---

## 3. AI Adoption & Productivity

| Dimension | Coverage |
|-----------|----------|
| SDLC Coverage | BA, QA, PM, Dev, Ops, Leadership, Sustainment |
| AI-Powered Workflows | Sprint retros, incident RCA, GSM reports, release management, code reviews, architecture assessments, quarterly reporting |
| Team Adoption | DPAY (full), Connected Products (Q2), POS (Q2) |
| Cross-Platform | macOS, Linux, Windows (Koda v2.11) |

The steer-runtime platform now provides **148 agents across 16 profiles**, covering the full software delivery lifecycle. AI-assisted sessions are used across all roles, with measurable impact on code review turnaround, incident analysis, and reporting cadence.

---

## 4. Risks & Issues

### 🔴 CRITICAL: INC0067890 — Payment Gateway Timeouts

| Attribute | Detail |
|-----------|--------|
| Recurrences | **14 times** in 23 days (Jun 15 → Jul 8) |
| GSM Status | **RED — 5+ consecutive weeks** |
| Root Cause | June 22 connection pool/TLS hotfix never merged to base AMI |
| Failure Mode | Every deployment/patching overwrites the hotfix |
| Compounding Factor | Entrust 13.6.16 + Voltage SDA 7.1.0 upgrade (CHG4384461) modifies TLS crypto libraries — in progress through Jul 10 |
| Escalation | VP escalation active; **Director/SVP escalation recommended** |
| Permanent Fix | Merge June 22 hotfix into base AMI |
| Governance Gap | **No deployment gate exists** to prevent hotfix overwrite |

**This is a deployment governance failure, not a code defect.** The fix has been known since June 22. The absence of a pre-deployment check that validates hotfix presence allows the regression on every patching cycle.

---

### 🟠 HIGH: INC0012345 — Checkout 500 Cascade (P1)

- **Chain:** Payment Service → Booking → Order View Assembler → Checkout SPA
- Hotfix deployed July 8 ~07:15 ET; stability validation pending
- Same cascade pattern recurring since June 2026
- Requires architectural review of circuit-breaking between services

---

### 🟠 HIGH: TEP3-36386 — DLR Ticket Mods 403 Loop (P1)

- Same root cause as DPAY-15726 (V5 OIDC token scope validation)
- **Fix ready:** PR #956 (comprehensive hasScope fix) — finalized July 7
- **NOT YET DEPLOYED** to latest/stage/prod
- Cross-brand impact: DLR + WDW
- Blocking: TEP3-21462, TEP3-21466, TEP3-32262
- **Deployment of PR #956 is the single action needed to resolve**

---

### 🟡 MEDIUM: Delivery Accuracy Below Target

- 74.7% vs 80% target
- Incident-driven disruptions consumed sprint capacity
- Bug intake exceeded 30% threshold in SP429
- Expected to recover in Q3 as incidents stabilize

---

## 5. Director Asks

| # | Ask | Urgency | Rationale |
|---|-----|---------|-----------|
| 1 | **Deployment Guardrails** | 🔴 URGENT | Block deployments that overwrite hotfixes. INC0067890 has recurred **14 times** because no gate exists. Every day without this gate is another potential recurrence. |
| 2 | **ECS Memory Upgrade** | HIGH | OOM events contributing to service instability. Remediation needed. |
| 3 | **Velocity Reset Acknowledgment** | MEDIUM | Q2 dip was incident-driven, not team performance. Throughput actually increased 19%. Team needs leadership backing. |
| 4 | **0.5 FTE Observability** | HIGH | Dedicated investment in payment gateway observability to reduce MTTR and prevent cascade failures. |
| 5 | **AI Field Mandate** | MEDIUM | Standardize AI metrics tracking fields in Jira across all payment teams for consistent productivity measurement. |
| 6 | **Cross-Team Onboarding** | MEDIUM | Fund steer-runtime/Koda onboarding sessions for Connected Products, POS, and other payment teams ready to adopt. |

---

## 6. Q3 2026 Roadmap

| Priority | Initiative | Target Outcome |
|----------|-----------|----------------|
| 1 | **OneID V5 Rollout** | Complete iOS integration, deploy PR #956 to production, full V5 across all platforms |
| 2 | **3DS Production Ship** | Cardinal SDK E2E proven → production deployment |
| 3 | **INC0067890 Resolution** | Permanent fix: merge hotfix into base AMI + deployment gate |
| 4 | **RDJ Migration POC** | Inventory sprint + AI-assisted POC on 2–3 representative batch jobs |
| 5 | **steer-runtime Scale** | Target 160+ agents, expand to 3+ teams |
| 6 | **Deployment Governance** | Implement hotfix-protection gates in CI/CD pipeline |
| 7 | **Config Studio** | Continue export enhancements and streaming improvements |

---

## 7. Conclusion

DPAY delivered strong output in Q2 despite significant operational headwinds. The team proved two strategic capabilities (OneID V5 and 3DS), shipped 31 releases of the AI platform, and maintained +19% throughput growth — all while absorbing 14 production incident recurrences from a governance gap outside their control.

**The single highest-leverage action for Q3 stability is approving deployment guardrails (Ask #1).** Until the base AMI includes the June 22 hotfix and a gate prevents its removal, INC0067890 will continue to recur, consume sprint capacity, and keep GSM status at RED.

The team is positioned for a strong Q3 with clear, achievable targets: ship V5 to production, ship 3DS, and close the incident permanently. Leadership support on the six asks above will remove the friction needed to hit these targets.

---

*Report generated by DPAY Engineering · Q2 2026 Final*
