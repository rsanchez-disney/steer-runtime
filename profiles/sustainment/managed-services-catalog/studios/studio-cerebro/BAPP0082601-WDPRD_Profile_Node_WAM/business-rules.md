# Business Rules — WDPRD Profile Node WAM

> ⛔ **DEPRECATED** — Migrated to Java WAM (BAPP0253435). Node.js 14 is EOL.

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | N/A - DEPRECATED | Service migrated to Java WAM (BAPP0253435) |
| Response time (p95) | N/A | N/A |
| Error rate | N/A | N/A |

## Peak Periods

- N/A — Service is deprecated and migrated to Java WAM (BAPP0253435)

## Business Logic

- Orchestration/BFF layer for Profile SPAs (Layer 3 in architecture)
- DynamoDB session management
- Request routing to backend microservices (B2C, VAS, B2B, Preference, MNO, JWT)
- All functionality migrated to BAPP0253435 (Profile WebAPI - Java WAM, Java 17)

## Akamai Gateway

| Environment | Hostname |
|-------------|----------|
| PROD | profile-svcs.wdprapps.disney.com |
| STAGE | stage.profile-svcs.wdprapps.disney.com |
| LOAD | load.profile-svcs.wdprapps.disney.com |
| LATEST | latest.profile-svcs.wdprapps.disney.com |

## Dependencies

- DynamoDB — Sessions, global tables. Tech Lead: andrew.southwick@disney.com
- ElastiCache (Redis) — Preferences cache
- Profile B2C (BAPP0245892) — Guest APIs. Tech Lead: andrew.southwick@disney.com
- Profile VAS (BAPP0242566) — Data aggregation. Tech Lead: martin.x.uribe.-nd@disney.com
- Profile B2B (BAPP0246132) — Service-to-service. Tech Lead: martin.x.uribe.-nd@disney.com
- OneID — Authentication. Escalation: Jira IDY-* at support.twdc.technology
- Akamai CDN/WAF — Edge routing. Escalation: ops-global-parks-se-guestexp

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting the WAM service | Service completely down | CloudWatch: Task Count, CPU, Memory |
| DynamoDB | Sessions, global tables | Sessions lost, auth tokens invalid | CloudWatch: ThrottledRequests |
| ElastiCache (Redis) | Preferences cache | Performance degradation | CloudWatch: CacheHitRate, Evictions |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Impact Classification

- **Full outage:** N/A — Service deprecated. If still receiving traffic, guests cannot access profile features via web/mobile.
- **Degraded:** N/A — All traffic should be routed to Java WAM (BAPP0253435).

## Replacement

| Field | Legacy (This BAPP) | Replacement |
|-------|---------------------|-------------|
| BAPP | 0082601 | 0253435 |
| Name | Profile Node WAM | Profile WebAPI (Java WAM) |
| Platform | Node.js 14 (EOL) | Java 17 |
| Tech Lead | Andrew Southwick | Andrew Southwick |
| Index | wdpr-gam | wdpr-gam |
