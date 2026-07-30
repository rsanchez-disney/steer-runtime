# Business Rules — FNF New Connection Methods SPA

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | Not documented in Confluence Cloud |
| Response time (p95) | Not documented in Confluence Cloud | Not documented in Confluence Cloud |
| Error rate | < 3% (alert threshold) | Content endpoint: 0.02% |

## Peak Periods

- Park opening hours when guests manage their Family & Friends lists
- Holiday seasons with high park attendance
- New reservation release events (hotel reservation import feature)

## Business Logic

- Account consolidation — merging duplicate guest accounts
- Friend list management — view, add, remove connections
- Add guest/managed guest — add children or managed profiles
- GUID-based friend list retrieval
- Hotel reservation import — import reservations to share with friends
- Connection invites — send and accept friend requests
- Plan sharing and group features
- Replaces previous FnF SPA (BAPP0180541)

## Dependencies

- Profile WebAPI WAM (BAPP0253435) — Cannot reach backend services if down. Tech Lead: andrew.southwick@disney.com
- Profile VAS (BAPP0242566) — Connected guests data unavailable if down. Tech Lead: martin.x.uribe.-nd@disney.com
- Profile B2C (BAPP0245892) — FnF list data. Tech Lead: andrew.southwick@disney.com
- AuthenticatorJS (BAPP0248309) — Login/auth fails if down. Tech Lead: Cesar.A.Munoz.Acevedo.-ND@disney.com
- Akamai CDN — 502 errors, no traffic reaches origin if down. Escalation: ops-global-parks-se-guestexp
- GAM — Friend list data source. Escalation: GAM team
- OneID — Authentication. Escalation: Jira IDY-*
- Internal Libraries: Vault, Nimbus, RA Components, RA Logger, Analytics, CloudWatch, NavUI, Profile-shared

## Akamai Gateway

| Environment | Hostname |
|-------------|----------|
| PROD | profile-svcs.wdprapps.disney.com |
| STAGE | stage.profile-svcs.wdprapps.disney.com |
| LOAD | load.profile-svcs.wdprapps.disney.com |
| LATEST | latest.profile-svcs.wdprapps.disney.com |

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting FnF SPA (both regions) | FnF features completely down | CloudWatch: Task Count, CPU, Memory |
| S3 | Static assets, analytics files | 404 on analytics | S3 bucket metrics |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** Error >3%, Content endpoint >0.02%, CPU >30%, Memory >50%
**Alert Channel:** gac-profile-prod-alerts

## Internal Consumers (Who Uses FnF SPA)

| Consumer | URL | Impact if FnF SPA Fails |
|----------|-----|-------------------------|
| disneyworld.disney.go.com | /family-friends/ | Cannot manage friends, invites, account consolidation |
| disneyland.disney.go.com | /family-friends/ | Cannot manage friends |
| disneycruise.disney.go.com | /family-friends/ | Cannot manage friends |

## Impact Classification

- **Full outage:** Guests cannot view or manage Family and Friends list. Cannot send or accept connection invites. Account consolidation unavailable. Hotel reservation import fails. Plan sharing and group features affected.
- **Degraded:** Partial friend list loading, slow responses, intermittent connection invite failures.
