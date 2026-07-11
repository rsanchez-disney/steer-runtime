# Root Cause Analysis — INC0067890 (Recurrence #15)

**Date:** 2026-07-11
**Severity:** P1 / Critical
**Status:** RECURRING — 15th occurrence in 26 days
**Analyst:** RCA Investigation Agent

---

## Executive summary

The Payment Service (BAPP0012692) is experiencing connection timeouts following a deployment on or around July 10-11, 2026. This is the **15th recurrence** of the same incident since June 15. The root cause has been known and confirmed since June 22: a production hotfix was never merged into the main branch, so every CI/CD deployment overwrites it.

**This is no longer a technical incident. This is an organizational failure.**

---

## Root cause

| Attribute          | Detail                                                                                          |
|--------------------|------------------------------------------------------------------------------------------------|
| Category           | Process failure — hotfix not merged to source control                                          |
| Root service       | Payment Service (BAPP0012692) — web-global-salescart                                          |
| Technical cause    | Connection pool misconfiguration + TLS endpoint regression reintroduced on every deployment    |
| Process cause      | June 22 hotfix applied directly to production, never merged to `main` branch or CI pipeline   |
| Correction ticket  | DPAY-15902 — in development, NOT deployed as of July 11                                       |

---

## Cascade chain

```text
Payment Service (BAPP0012692)          ← PRIMARY SOURCE (connection pool / TLS)
    └─→ Booking Service (BAPP0012680)          ← downstream timeout
        └─→ Order View Assembler (BAPP0143610) ← downstream timeout
            └─→ Unified Checkout SPA (BAPP0138342) ← user-facing failure
```

All services in `web-global-salescart` cluster.

---

## Recurrence timeline

| #  | Date        | Trigger                          | Resolution              |
|:--:|-------------|----------------------------------|-------------------------|
|  1 | Jun 15      | Original deployment              | Hotfix Jun 22           |
|  2 | Jun 22      | Deployment overwrote hotfix      | Re-apply hotfix         |
|  3 | Jun 25      | Deployment overwrote hotfix      | Re-apply hotfix         |
|  4 | Jun 26      | Deployment overwrote hotfix      | Re-apply hotfix         |
|  5 | Jun 27      | Deployment overwrote hotfix      | Re-apply hotfix         |
|  6 | Jun 28      | Deployment overwrote hotfix      | Re-apply hotfix         |
|  7 | Jul 1       | Deployment overwrote hotfix      | Re-apply hotfix         |
|  8 | Jul 2       | Deployment overwrote hotfix      | Re-apply hotfix         |
|  9 | Jul 3       | Deployment overwrote hotfix      | Re-apply hotfix, VP esc |
| 10 | Jul 4 (AM)  | Deployment overwrote hotfix      | Re-apply hotfix         |
| 11 | Jul 4 (PM)  | Deployment overwrote hotfix      | Re-apply hotfix         |
| 12 | Jul 8       | Deployment overwrote hotfix      | Re-apply hotfix         |
| 13 | Jul 9       | Deployment overwrote hotfix      | Re-apply hotfix         |
| 14 | Jul 10      | Deployment overwrote hotfix      | Re-apply hotfix         |
| 15 | Jul 11      | Deployment overwrote hotfix      | **PENDING**             |

---

## Impact

- **Customer-facing:** Payment timeouts on Unified Checkout — booking flow broken
- **Revenue:** Direct revenue loss on every recurrence (duration × transaction volume)
- **Operational:** 15 incidents × ~1-2 hours each = 15-30 hours of incident response time wasted
- **Trust:** Team credibility eroded; escalation fatigue setting in

---

## Immediate remediation (today)

1. **Re-apply the hotfix** to Payment Service (BAPP0012692) — connection pool + TLS configuration
2. **Freeze deployments** to Payment Service until DPAY-15902 is merged and verified in the pipeline

---

## Permanent fix required

1. **Merge DPAY-15902 to `main` immediately** — this has been "in development" for weeks
2. **Verify CI/CD artifact** contains the corrected connection pool and TLS configuration
3. **Deploy from `main`** and confirm the fix persists
4. **Add pipeline gate** — automated test that validates Payment Service connectivity post-deploy

---

## Escalation recommendation

| Level              | Status                     | Action needed                                       |
|--------------------|----------------------------|-----------------------------------------------------|
| VP escalation      | Active since Jul 3         | No observable result in 8 days                      |
| CTO escalation     | Recommended since Jul 10   | Unknown if actioned — MUST be confirmed today       |
| SVP intervention   | **Recommended NOW**        | 26-day P1 with known fix not deployed is untenable  |

### Recommended escalation message

> INC0067890 has recurred 15 times in 26 days. The root cause is known (hotfix not merged to main branch). The correction ticket (DPAY-15902) exists but has not been deployed. VP escalation on July 3 produced no result. This requires immediate executive intervention to:
>
> 1. Merge and deploy DPAY-15902 within 24 hours
> 2. Freeze Payment Service deployments until verified
> 3. Conduct post-mortem on why a known fix took 26+ days to reach production

---

## Five Whys

1. **Why did payments time out?** — Connection pool misconfigured + TLS endpoint wrong in Payment Service
2. **Why was it misconfigured?** — A deployment overwrote the production hotfix
3. **Why did the deployment overwrite it?** — The hotfix was never merged to the `main` branch
4. **Why wasn't it merged?** — No process enforced hotfix-to-main merge verification
5. **Why has this persisted 26 days?** — Organizational accountability gap; no owner drove the merge to completion despite VP escalation

---

## Process failures identified

- No deployment gate validates critical service connectivity
- No automated check that production hotfixes are merged to source
- No deployment freeze triggered after 2+ recurrences of the same incident
- Escalation process ineffective — VP escalation produced no action in 8 days
- DPAY-15902 has no SLA or deadline despite being a P1 corrective action

---

## Recommendations for post-incident review

1. Mandate "hotfix merge verification" as a release gate
2. Implement automated post-deploy health check for Payment Service connectivity
3. Create policy: 3+ recurrences of same incident = automatic deployment freeze on affected service
4. Review escalation process — why did VP escalation fail to produce results?
5. Assign accountable owner (by name) for DPAY-15902 with 24-hour SLA
