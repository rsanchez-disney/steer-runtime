# Business Rules — WDPRD WDWDLRDCL Web Application Magic Bands + Cards

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | ART East < 5s, West < 6s | AppDynamics |
| Error rate | < 3% (East/West) | Splunk / CloudWatch |
| CPU | < 30% | CloudWatch |
| Memory | < 50% | CloudWatch |

## Peak Periods

- Not documented in Confluence Cloud

## Business Logic

- Allows guests to manage MagicBand and DisneyBand reservations
- Link/unlink bands to guest accounts
- List MB/DB orders and view reservation data
- Band customization features
- MB+ booking flow (revenue-impacting)
- MagicBand (MB): Order created at booking. Guest cannot complete starting 5 days before arrival.
- DisneyBand (DB): Order created at booking. Guest cannot complete starting 10 days before arrival (45-11 days window).
- Highly dependent on VAS for data aggregation — if VAS has Duplicate Key issue, MB+C also fails
- Active-active deployment across US-EAST-1 (WDW) and US-WEST-2 (DLR)

## Dependencies

- Profile VAS (BAPP0242566) — CRITICAL: All band data comes from VAS. Tech Lead: martin.x.uribe.-nd@disney.com
- Profile WebAPI WAM (BAPP0253435) — Cannot reach backend. Tech Lead: andrew.southwick@disney.com
- AuthenticatorJS (BAPP0248309) — Login/auth fails. Tech Lead: Cesar.A.Munoz.Acevedo.-ND@disney.com
- Akamai CDN — 502 errors, no traffic reaches origin. Escalation: ops-global-parks-se-guestexp
- xBMS (Fulfillment) — Band orders/entitlements unavailable. POC: Will McKnight
- DCL Reservation Service — DCL page data unavailable
- OneID (External) — Authentication. Escalation: Jira IDY-* at support.twdc.technology
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
| ECS Fargate | Hosting MB+C SPA | SPA completely down, all brands affected | CloudWatch: Task Count, CPU, Memory |
| S3 | Static assets, analytics files | 404 on analytics | S3 bucket metrics |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** Error >3% | ART East >5s | West >6s | CPU >30% | Memory >50%
**Alert Channel:** gac-profile-prod-alerts

## Internal Consumers (Who Uses MB+C SPA)

| Consumer | Impact if MB+C SPA Fails |
|----------|--------------------------|
| disneyworld.disney.go.com/magicband/ | MB/DB management unavailable, revenue impact |
| MagicBand / Build-a-Band flow | MB customization and ordering broken |
| DCL guests | Cannot manage bands for cruise |

## Impact Classification

- **Full outage:** Guests cannot manage MagicBand/DisneyBand reservations. Cannot link or unlink bands. MB+ booking flow breaks (revenue impact). Band status and customization unavailable.
- **Degraded:** Partial data loading (VAS Duplicate Key cascading), specific order types failing, DCL data unavailable.
