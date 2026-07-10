# INC0067890 — recurring payment gateway timeouts

## Summary

A connection pool/TLS regression introduced on June 15, 2026 has recurred 14+ times over 25 days because the hotfix was never merged into the main deployment artifact.

## Root cause

The June 15 deployment to Payment Service (BAPP0012692) introduced connection pool exhaustion or TLS configuration changes that cause payment gateway timeouts. The cascade chain:

```text
Payment Service (BAPP0012692)
  → Booking Service (BAPP0012680)
    → Order View Assembler (BAPP0143610)
      → WDW Unified Checkout SPA (BAPP0138342)
```

## Hotfix applied June 22

A connection pool/TLS hotfix was applied on June 22. However, this fix was **never merged into the main deployment artifact** (develop/main branch). Every subsequent deployment overwrites the hotfix, causing immediate recurrence.

## Recurrence pattern

Every deployment to Payment Service since June 22 has triggered the same failure:

- Recurrence #1-4: June 22-25
- Recurrence #5-7: June 26-28
- Recurrence #8-12: June 30 - July 4
- Recurrence #13-14: July 9-10

## Symptoms

- Splunk: `index=wdpr_payment* status>=500 source=*payment-service*`
- Error pattern: HTTP 504 gateway timeout on payment API calls
- Impact: Revenue-blocking across all WDW/DLR digital commerce
- Duration per recurrence: 2-8 hours until manual hotfix re-application

## Affected services

| Service                    | BAPP ID      | Role                      |
|----------------------------|--------------|---------------------------|
| Payment Service            | BAPP0012692  | Origin of failure         |
| Booking Service            | BAPP0012680  | Downstream cascade        |
| Order View Assembler       | BAPP0143610  | Downstream cascade        |
| WDW Unified Checkout SPA   | BAPP0138342  | User-facing impact        |

## Resolution status (as of July 10)

**NOT permanently resolved.** VP escalation active since July 3 with zero corrective action. Recommended: CTO-level escalation with mandate to merge hotfix into deployment artifact.

## Prevention

1. Merge the June 22 hotfix into the `develop` branch of wdpr-payment-services
2. Add connection pool configuration validation to CI pipeline
3. Add automated smoke test post-deploy: verify payment flow returns 200
4. Add deployment gate: compare connection pool config with known-good baseline
