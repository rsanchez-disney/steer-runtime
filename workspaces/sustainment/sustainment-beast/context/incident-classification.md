# Incident Classification Guide

Purpose: Given an incident, determine the correct `causedBy*` tag and whether to close or reassign.

---

## 1. 5 Whys — Root Cause Analysis Technique

For every incident, apply the 5 Whys technique before assigning a classification. This ensures the tag reflects the true root cause, not just the symptom.

**How to apply:** Start from the visible symptom (the alert or error) and ask "Why?" repeatedly until you reach the deepest cause the available evidence supports.

```
Why 1: Why did the incident occur?
→ [Symptom: what the alert/monitoring detected]

Why 2: Why did that symptom happen?
→ [Direct technical cause: which service/endpoint failed]

Why 3: Why did that service/endpoint fail?
→ [Upstream cause: what dependency or data issue triggered it]

Why 4: Why did that dependency/data issue exist?
→ [Root cause: the underlying reason — data volume, unavailability, bug, config, etc.]

Why 5: Why wasn't this prevented or handled?
→ [Systemic cause: missing retry, no circuit breaker, no data limit, etc.]
```

---

## 2. Classification Flow (Decision Tree)

```
INC received
│
├─ Where is the root cause?
│   │
│   ├─ OUR CODE (Beast scope)
│   │   ├─ Bug in logic → causedByBug
│   │   └─ Our deployment broke it → causedByRelease
│   │
│   ├─ INFRASTRUCTURE
│   │   ├─ AWS / ALB / ECS → causedByInfra
│   │   ├─ AWS patching CHG → causedByAWSPatching
│   │   ├─ Network / DNS → causedByNetwork
│   │   └─ CDN → causedByCdn
│   │
│   ├─ EXTERNAL DEPENDENCY
│   │   ├─ Identify the system → use matching causedBy* tag
│   │   └─ (see External App table below)
│   │
│   └─ CONFIGURATION / CONTENT
│       ├─ Tridion / Content API → causedByContentAPI
│       ├─ PYM / Yield → causedByConfiguration
│       └─ Marketing content → causedByMarketing
│
├─ After troubleshooting, if no root cause found:
│   │
│   ├─ Can we reproduce it?
│   │   └─ NO → tag: notReproducible (We can't verify the issue exists) → Close
│   │
│   └─ Is the behavior correct/intended?
│       └─ YES → tag: workingAsExpected (We verified the behavior is correct/intended) → Close
│
└─ Apply tag + close (if alert) or reassign (if user report) — see section 6
```

---

## 3. CausedBy Tags Reference

### External App / Dependency

| Tag | When to use |
|---|---|
| `causedByAgilysys` | Issue originates in Agilysys (PMS) |
| `causedByAirship` | Push notification delivery failure via Airship |
| `causedByAWSPatching` | Scheduled CHG upgrading AWS infrastructure component |
| `causedByBmacs` | Issue in BMACS system |
| `causedByCdn` | CDN cache/routing issue (Akamai, CloudFront) |
| `causedByConfiguration` | PYM / Availability / Yield misconfiguration |
| `causedByContentAPI` | Tridion / Content API / product-inventory issue |
| `causedByCoreApi` | Core API layer failure |
| `causedByDocusign` | Docusign integration failure |
| `causedByDRS` | DRS (Dining Reservation System) issue |
| `causedByGalaxy` | Galaxy data issue (missing/corrupt data) |
| `causedByInfra` | Infrastructure: ALB, ECS, AWS, DB infra |
| `causedByInPark` | In-Park systems issue |
| `causedByLineberty` | Lineberty (queue management) issue |
| `causedByMarketing` | Marketing / Tridion content misconfiguration |
| `causedByMPG` | MPG (payment gateway) issue |
| `causedByNetwork` | Network connectivity / routing issue |
| `causedByOneId` | OneID / SSO authentication issue |
| `causedByOnPremises` | On-premises system failure |
| `causedByOpera` | Opera (PMS) issue |
| `causedBySecurity` | Security-related issue (WAF, certs, access) |
| `causedBySBC` | SBC system issue |
| `causedBySparkpost` | Email delivery failure via Sparkpost |
| `causedByTbx` | TravelBox booking data issue |
| `causedByTitus` | Titus system issue |
| `causedByWorldpay` | Worldpay payment processing issue |

### Internal (Beast scope)

| Tag | When to use |
|---|---|
| `causedByBug` | Logic error in our code, needs a fix (Jira ticket) |
| `causedByRelease` | Our own deployment caused the issue  |

### Resolution without fix

| Tag | When to use |
|---|---|
| `notReproducible` | We can't verify the issue exists |
| `workingAsExpected` | Verified the behavior is correct/intended, not a bug |

---

## 4. Reassignment Guide (Root Cause → Assignment Group)

When the root cause is external, reassign to the correct AG:

| Root Cause Category | CausedBy Tag | Reassign To |
|---|---|---|
| Tridion / Content API / product-inventory | `causedByContentAPI` | `app-frdlp-web` |
| Infrastructure / ALB / ECS / AWS | `causedByInfra` | `ops-frdlp-CloudOps` |
| Galaxy data issues | `causedByGalaxy` | `app-frdlp-gfs-support-niv2` |
| Database (TMS DB, CME DB) | `causedByInfra` | `dba-global-DBEngineering` |
| PYM / Availability / Yield | `causedByConfiguration` | `prd-global-dlp-RMA-park-yield` |
| Marketing / Tridion content | `causedByMarketing` | `app-frdlp-web` |
| Network / CDN | `causedByNetwork` or `causedByCdn` | `ops-frdlp-CloudOps` |
| OneID / SSO | `causedByOneId` | Escalate via DGE Train |
| TBX / Booking data | `causedByTbx` | TravelBox Ops (Teams) |
| Agilysys (PMS) | `causedByAgilysys` | Escalate via DGE Train |
| Airship (push notifications) | `causedByAirship` | Escalate via DGE Train |
| BMACS | `causedByBmacs` | Escalate via DGE Train |
| Core API | `causedByCoreApi` | Escalate via DGE Train |
| Docusign | `causedByDocusign` | Escalate via DGE Train |
| DRS (Dining Reservation) | `causedByDRS` | Escalate via DGE Train |
| In-Park systems | `causedByInPark` | Escalate via DGE Train |
| Lineberty (queue mgmt) | `causedByLineberty` | Escalate via DGE Train |
| MPG (payment gateway) | `causedByMPG` | Escalate via DGE Train |
| On-Premises | `causedByOnPremises` | Escalate via DGE Train |
| Opera (PMS) | `causedByOpera` | Escalate via DGE Train |
| SBC | `causedBySBC` | Escalate via DGE Train |
| Security (WAF, certs) | `causedBySecurity` | `ops-frdlp-CloudOps` |
| Sparkpost (email) | `causedBySparkpost` | Escalate via DGE Train |
| Titus | `causedByTitus` | Escalate via DGE Train |
| Worldpay (payments) | `causedByWorldpay` | Escalate via DGE Train |
| Release / Deployment (ours) | `causedByRelease` | Squad that owns the app |
| Bug in code | `causedByBug` | Squad that owns the app |

---

## 5. Quick Reference: Tag Selection Cheat Sheet

```
Error from external API?        → causedBy[ExternalSystem]
Our code threw the exception?   → causedByBug
Deployment caused it?           → causedByRelease (ours) or causedByAWSPatching (AWS)
Infra issue (not code)?         → causedByInfra / causedByNetwork / causedByCdn
Can't reproduce?                → notReproducible
Works as designed?              → workingAsExpected
```


---

## 6. Squad Tags

When tagging an incident with the squad tag, use the Configuration Item (CI) to determine which squad owns it.

| Tag | Squad |
|---|---|
| `beastXCruzRamirez` | Cruz Ramirez |
| `beastXStorm` | Storm |
| `beastXForky` | Forky |

### When to Apply the Squad Tag

The squad tag identifies **which Beast squad worked the incident**. It is only required when Beast closes or resolves the incident:

```
causedByBug            → Squad tag REQUIRED (squad that owns the app)
causedByRelease        → Squad tag REQUIRED (squad that deployed)
causedByAWSPatching    → Squad tag REQUIRED (squad that owns the affected app)
notReproducible        → Squad tag REQUIRED (squad that investigated)
workingAsExpected      → Squad tag REQUIRED (squad that validated)
```

#### Alert vs User Report (external root cause)

```
ALERT (AppDynamics/monitoring) + external cause  → Beast closes → Squad tag REQUIRED
USER REPORT + external cause                     → Beast reassigns → NO squad tag (+ reviewedByBeastTeam)
```

### Additional Tags

| Tag | When to apply |
|---|---|
| `jiraFixRelated` | A code change (Jira ticket) is needed to fix the issue. **Blocks closure** until the Jira is promoted to PROD. |
| `reviewedByBeastTeam` | Beast investigated but AG is external (used when reassigning) |
| `prodIssueImpactBeastScope` | Major issue impacted our scope, but AG is external |
| `PRBmonitoredByBeast` | A PRB (Problem Record) that impacts Beast scope |

### How to Determine the Squad Tag (when required)

```
1. Identify the Configuration Item (CI) from the incident
2. Look up the CI in the App Knowledge Index (#app-knowledge-index) → "Squad" column
3. Apply the corresponding squad tag:
   - CI belongs to Cruz Ramirez → beastXCruzRamirez
   - CI belongs to Storm → beastXStorm
   - CI belongs to Forky → beastXForky
   - CI not in any table → Validate with team lead
```

> 📎 Full app-to-squad mapping is in `#app-knowledge-index` (loaded globally).

---

## 7. Agent Behavior — Classification from Comments

When analyzing an incident's comments and work notes to suggest a classification:

### Process

1. Read all comments, work notes, and available evidence from the INC
2. Apply the 5 Whys mentally based on the evidence available
3. Map the deepest root cause to the correct `causedBy*` tag
4. Determine if squad tag applies (only if Beast closes it)
5. Recommend: close or reassign (with target AG)

### Confidence Levels

After analysis, state your confidence:

```
✅ CLEAR    — Evidence clearly points to one root cause → Suggest tag + action
⚠️ UNCLEAR — Evidence is ambiguous or incomplete → State "undefined, we need more information"
```

### When to say "undefined"

If any of these are true, the classification is **undefined** and you must ask for more info:

- The 5 Whys stop at Why 2 or 3 because there's no evidence to go deeper
- The symptom could be caused by 2+ different root causes and nothing distinguishes them
- Comments only describe the symptom but no investigation was done
- There's a mix of internal and external factors and it's unclear which is the true root cause
- A CHG exists in the timeline but no one confirmed if it's related

**Response format when undefined:**

```
🔶 Classification: UNDEFINED

Evidence found:
- [what the comments say]

Missing information needed:
- [what would clarify the root cause]

Possible classifications (pending confirmation):
- Option A: causedBy___ (if [condition])
- Option B: causedBy___ (if [condition])

Suggested next steps:
- [what to investigate or who to ask]
```

### Signal Patterns (heuristics for reading comments)

| Pattern in comments/logs | Likely tag |
|---|---|
| "timeout", "connection refused", "503 from ALB" | `causedByInfra` |
| "Galaxy returned empty/null", "entitlement not found" | `causedByGalaxy` |
| "after CHG deployed", "started after release" | `causedByRelease` |
| "Tridion", "content not published", "product-inventory" | `causedByContentAPI` |
| "OneID", "SSO", "token expired", "auth failed" | `causedByOneId` |
| "TBX", "booking not found", "reservation data" | `causedByTbx` |
| "DNS", "routing", "network unreachable" | `causedByNetwork` |
| "CDN", "cache stale", "Akamai", "CloudFront" | `causedByCdn` |
| "PYM", "yield", "availability mismatch" | `causedByConfiguration` |
| "NullPointerException", "ArrayIndexOutOfBounds", logic error in our code | `causedByBug` |
| "cannot reproduce", "works fine now", "no errors in Splunk" | `notReproducible` |
| "expected behavior", "by design", "not a bug" | `workingAsExpected` |

> ⚠️ These are **hints**, not conclusions. Always validate with the 5 Whys before confirming a tag.
