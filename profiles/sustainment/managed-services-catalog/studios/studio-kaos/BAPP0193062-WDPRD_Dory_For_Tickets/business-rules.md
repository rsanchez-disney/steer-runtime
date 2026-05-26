# Business Rules — WDPRD Dory For Tickets

## Purpose

Dory for Tickets ensures compliance with consumer privacy regulations (CCPA) by orchestrating data retrieval and deletion across downstream systems that store guest personal information.

## Operations

| Operation | Description |
|-----------|-------------|
| **RTA** (Request to Acknowledge) | Retrieves personal data from downstream systems to acknowledge what data is held |
| **RTF** (Request to Forget) | Deletes/anonymizes personal data from downstream systems |

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | 99.9% | ECS task health + healthcheck endpoint |
| Response time (p95) | TBD | AppDynamics / Splunk latency queries |
| Error rate | < 1% | Splunk error ratio |

## Peak Periods

- Privacy request volumes may spike after major data breach disclosures or regulatory deadlines
- CCPA compliance deadlines (45-day response window from consumer request)

## Business Logic

- Dory receives requests from **Incognito Service** (upstream orchestrator for all privacy requests)
- Dory does NOT store any personal data itself — it is a stateless pass-through orchestrator
- For each request, Dory fans out to applicable downstream systems and consolidates results
- Supported downstream systems: **TMS**, **Booking Service**, **CME**
- Results are returned to Incognito Service for final consumer response

## Architecture Flow

```
Consumer → Incognito Service → Dory For Tickets → TMS
                                                 → Booking Service
                                                 → CME
```

## Dependencies

| System | Direction | Purpose |
|--------|-----------|---------|
| Incognito Service | Upstream | Sends RTA/RTF requests to Dory |
| TMS (Ticket Management Service) | Downstream | Contains ticket-related personal data |
| Booking Service | Downstream | Contains booking-related personal data |
| CME (Capacity Management Engine) | Downstream | Contains reservation-related personal data |

## Impact Classification

- **Full outage:** Privacy requests cannot be processed — potential regulatory compliance risk (CCPA 45-day SLA)
- **Degraded:** One downstream system unreachable — partial data retrieval/deletion; Incognito receives incomplete results

## Security & Compliance

- Security Assessment completed: RITM3912578
- Penetration Test completed: RITM3919235
- Credentials managed via Vault
- Internal-only service (not internet-facing, no Akamai)
- No personal data stored at rest in Dory
