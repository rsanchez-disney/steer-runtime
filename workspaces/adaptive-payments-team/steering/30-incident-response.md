---
inclusion: auto
description: Incident response patterns for adaptive payments services
---

# Incident response

## Triage checklist

When investigating an incident:

1. Check ServiceNow for the INC ticket (get priority, assignment group, timeline)
2. Identify affected BAPP ID from the alert or ServiceNow CI
3. Run Splunk queries against the service index (see `knowledge/splunk-query-cookbook.md`)
4. Check recent deployments (Harness) — does the timeline match a CHG?
5. Check if this matches the INC0067890 recurrence pattern (connection pool/TLS)

## Cascade pattern (payment failures)

The most common cascade in this platform:

```text
Payment Service (BAPP0012692) — origin
  ↓ HTTP 504 / connection refused
Booking Service (BAPP0012680) — propagates
  ↓ timeout
Order View Assembler (BAPP0143610) — propagates
  ↓ 500
Checkout SPA (BAPP0138342) — user-facing errors
```

If you see errors on Checkout/Booking/Order — check Payment Service FIRST.

## Known recurring issue: INC0067890

See `knowledge/incident-INC0067890-patterns.md` for full details.

**Quick check:** If payment gateway timeouts appear after a deployment:

1. Was there a deployment to Payment Service in the last 24 hours?
2. Check connection pool config: was the June 22 hotfix preserved?
3. If overwritten → re-apply hotfix, escalate to merge into `develop`

## Escalation paths

| Severity | Action                                                |
|----------|-------------------------------------------------------|
| P1       | Page on-call → war room within 15 min                 |
| P2       | Notify team lead → start investigation within 1 hour  |
| P3       | Assign to sprint backlog → investigate within 1 day   |
| P4       | Backlog — address in next sprint                      |

## Incident report template

When closing an incident, document:

1. **Timeline** — when detected, when mitigated, when resolved
2. **Root cause** — what failed and why
3. **Impact** — users affected, revenue impact, duration
4. **Fix applied** — what was done
5. **Prevention** — what will prevent recurrence

## Splunk quick-start

```splunk
# Last 30 min errors for a specific service
index=wdpr_payment* source=*BAPP_ID* status>=500 earliest=-30m
| timechart span=1m count

# Check if cascade is active
index=wdpr_payment* OR index=wdpr_booking* OR index=wdpr_commerce*
  status>=500
  earliest=-1h
| stats count by source
| sort -count
```
