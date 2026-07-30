# Business Rules — WDPRD Profile JWT service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented | — |
| Response time (p95) | Not documented | — |
| Error rate | Not documented | — |

## Peak Periods

- Park opening hours (7am-11pm ET for WDW, 7am-12am PT for DLR)
- Holiday seasons (Thanksgiving, Christmas, Spring Break)
- Any event that drives high login volume

## Business Logic

- Generates client-side JSON Web Tokens after OneID login completes
- Called by AuthenticatorJS (BAPP0248309) to issue session tokens
- Tokens stored in DynamoDB
- Session validation for all authenticated API calls across all brands
- Active-active across US-EAST-1 (WDW) and US-WEST-2 (DLR)
- Platform: Node.js 20

## Akamai Gateway

| Environment | Hostname |
|-------------|----------|
| PROD | profile-svcs.wdprapps.disney.com |
| STAGE | stage.profile-svcs.wdprapps.disney.com |
| LOAD | load.profile-svcs.wdprapps.disney.com |
| LATEST | latest.profile-svcs.wdprapps.disney.com |

## Dependencies

- **Upstream (calls JWT):**
  - AuthenticatorJS (BAPP0248309) — OneID Lightbox, session creation. Tech Lead: Cesar.A.Munoz.Acevedo.-ND@disney.com
  - Profile WebAPI / Java WAM (BAPP0253435) — Session validation. Tech Lead: andrew.southwick@disney.com
- **Downstream:**
  - DynamoDB — Token storage (table: wdpr-gam-b0253435-prd-webapi)
- **External:**
  - OneID — Authentication provider. Escalation: Jira IDY-* at support.twdc.technology
  - Akamai CDN/WAF — Edge routing. Escalation: ops-global-parks-se-guestexp

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting JWT service | Token generation completely down, all logins fail | CloudWatch: Task Count, CPU, Memory |
| DynamoDB | Token storage | Sessions lost, auth tokens invalid | CloudWatch: ThrottledRequests, ConsumedCapacity |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Internal Consumers (Who Calls JWT)

| Consumer | Impact if JWT Fails |
|----------|---------------------|
| All Profile SPAs (disneyworld, disneyland, disneycruise, hongkongdisneyland) | Login flow cannot complete |
| WDW/DLR Mobile Apps | Authentication broken |
| Profile WebAPI WAM | Session validation fails, all authenticated API calls rejected |
| NAV UI (Navigation) | Login widget does not render on any page |

## Impact Classification

- **Full outage:** Login flow cannot complete (no JWT issued). Session validation fails. All authenticated API calls rejected across ALL brands (WDW, DLR, DCL, HKDL).
- **Degraded:** Increased latency in token generation; some sessions may fail to validate.
