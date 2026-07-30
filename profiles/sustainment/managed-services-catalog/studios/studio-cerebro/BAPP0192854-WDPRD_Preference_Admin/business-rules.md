# Business Rules — WDPRD Preference Admin

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented | — |
| Response time (p95) | Not documented | — |
| Error rate | Not documented | — |

## Peak Periods

- Business hours (Cast Members usage)
- Marketing campaign configuration periods

## Business Logic

- Internal Cast Member tool for managing guest preferences
- Not guest-facing — no direct guest impact if service fails (LOW severity)
- Angular 18 frontend application
- Backend powered by Preference Service (BAPP0170520)
- Cast Member authentication via OneID
- Used by marketing and operations teams to manage communication preferences

## Akamai Gateway (via Profile Services)

| Environment | Hostname |
|-------------|----------|
| PROD | profile-svcs.wdprapps.disney.com |
| STAGE | stage.profile-svcs.wdprapps.disney.com |
| LOAD | load.profile-svcs.wdprapps.disney.com |
| LATEST | latest.profile-svcs.wdprapps.disney.com |

## Dependencies

- Preference Service (BAPP0170520) — Backend for all preference data operations. Tech Lead: andrew.southwick@disney.com
- OneID — Cast Member authentication. Escalation: Jira IDY-* at support.twdc.technology
- Akamai CDN/WAF — Edge routing. Escalation: ops-global-parks-se-guestexp

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting Preference Admin SPA | Admin tool unavailable | CloudWatch: Task Count, CPU, Memory |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Impact Classification

- **Full outage:** Cast Members cannot manage guest preferences through the admin tool. No guest-facing impact. LOW severity.
- **Degraded:** Slow loading or partial functionality in the admin interface.
