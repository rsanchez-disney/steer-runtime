# RCA Report — INC0067890

## Incident summary

| Field              | Value                                                    |
|--------------------|----------------------------------------------------------|
| Incident           | INC0067890                                               |
| Severity           | P2                                                       |
| Reported           | 2026-07-13 ~01:00 EDT                                   |
| Impact             | Payment gateway timeouts — guest checkout failures       |
| Assignment group   | web-global-salescart                                     |
| Recurrence         | **#17** (first occurrence: June 15, 2026)                |
| Related fix ticket | DPAY-15902 (in development — NOT yet deployed)           |

---

## Root cause (confirmed recurrence)

This is recurrence **#17** of a known issue where the **Payment Service (BAPP0012692)** deployment artifact does **not** include the June 22 connection pool/TLS hotfix.

**Mechanism:** Every standard deployment of BAPP0012692 overwrites the hotfixed connection pool and TLS configuration with the base artifact, which lacks the fix. This causes:

1. Connection pool exhaustion under normal load
2. TLS handshake timeouts to downstream payment gateways
3. Cascading failures through the booking pipeline

---

## Cascade path

```text
Payment Service (BAPP0012692)
  → Booking Service (BAPP0012680)
    → Order View Assembler
      → Unified Checkout SPA (guest-facing errors)
```

---

## Triggering event

- **Date:** July 12, 2026 (standard deployment window)
- **Action:** Routine deployment of Payment Service (BAPP0012692)
- **Effect:** Hotfixed connection pool/TLS config overwritten by base artifact
- **Symptoms began:** ~01:00 EDT July 13, 2026 (as traffic ramped post-deployment)

---

## Evidence pattern (matches prior 16 recurrences)

- Payment gateway timeout errors spike immediately after BAPP0012692 deployment
- Splunk signature: `connection_pool_exhausted` and `tls_handshake_timeout` in payment service logs
- Booking service reports upstream timeout from payment service
- Checkout SPA shows "payment processing unavailable" errors to guests
- No other infrastructure or code changes correlate

---

## Mitigation (immediate)

Re-apply the June 22 hotfix manually to the deployed Payment Service instances:

1. Restore connection pool configuration (max connections, timeout values)
2. Restore TLS certificate chain and handshake parameters
3. Validate payment gateway connectivity
4. Monitor for timeout resolution

---

## Permanent fix status

| Ticket     | Status         | Description                                              |
|------------|----------------|----------------------------------------------------------|
| DPAY-15902 | In Development | Bake hotfix into base deployment artifact permanently    |

**Until DPAY-15902 is deployed, every standard deployment of BAPP0012692 will trigger this issue.**

---

## Recommendations

1. **Immediate:** Apply deployment gate — block BAPP0012692 deployments until DPAY-15902 merges
2. **Short-term:** Escalate DPAY-15902 priority — 17 recurrences in 28 days is unacceptable
3. **Long-term:** Add post-deployment validation that confirms hotfix config is intact before traffic is routed

---

## Timeline of recurrences

| #  | Date       | Days since first |
|:--:|:----------:|:----------------:|
|  1 | 2026-06-15 |        0         |
| 17 | 2026-07-13 |       28         |

Average: one recurrence every ~1.6 days.

---

*Report generated: 2026-07-13 09:15 EDT*
*Investigator: RCA Investigation Agent*
