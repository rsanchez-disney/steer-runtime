# Business Rules — WDW Mobile Application (Family and Friends)

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented | — |
| Response time (p95) | Not documented | — |
| Error rate | Not documented | — |

## Peak Periods

- Park opening hours (7am-11pm ET for WDW)
- Holiday seasons (Thanksgiving, Christmas, Spring Break)
- New ticket/reservation release events

## Business Logic

- Allows guests to view and manage their Family and Friends list
- Send and accept connection invites between guests
- Share plans with connected guests
- Android (Kotlin) module within the WDW mobile app (My Disney Experience)
- Disney POC: Mark Lewis

## Key FnF Service Calls

| Screen / Action | Key Endpoint(s) | Notes |
|-----------------|-----------------|-------|
| Family & Friends List | GET /profile-service/v4/guest/{CLIENT}/fnf/friends-by-plans?qrCodeLive=true | Android uses expand service for avatars |
| Get Received Invitations | GET /expand-service/expand (received-invitations) | — |
| Check FnF Sharing Indicator | GET /assembly/guest/{XID}/indicator-set?keys=SHARE_FNF_LIST | — |
| Accept Invite | POST /assembly/guest/{XID}/friends | — |
| Decline Invite | POST /assembly/guest/{XID}/received-invitation/{ID} | — |
| Add Managed Guest | POST /assembly/guest/id;swid={SWID}/managed-guests | — |
| Scan Linking Code | GET /profile-service/v4/guest/{CLIENT}/vault/qrcode/profile/{CODE} | — |
| Show Linking Code | GET /profile-service/v4/guest/{CLIENT}/vault/qrcode/{SWID}?type=CHILD_ASSOCIATION | Uses CHILD_ASSOCIATION even for adults |

## Android-Specific Notes

- Android uses expand-service for avatars (not VAS directly)
- Android and iOS use different endpoints for "find through connected guests"

## Dependencies

- Profile B2C Service — FnF list data, guest associations (BAPP0245892). Tech Lead: andrew.southwick@disney.com
- Profile View Assembly Service (VAS) — Avatar assembly (BAPP0242566). Tech Lead: martin.x.uribe.-nd@disney.com
- Expand Service — Received invitations expansion
- OneID — Authentication. Escalation: Jira IDY-* at support.twdc.technology. Slack: #identity-help
- Akamai CDN/WAF — Edge routing. PROD: profile-svcs.wdprapps.disney.com. Escalation: ops-global-parks-se-guestexp
- GAM — Legacy auth, FnF data integrity. Escalation: GAM team
- Parks WiFi infrastructure — Network connectivity in parks

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting all backend services | Services completely down | CloudWatch: Task Count, CPU, Memory |
| DynamoDB | Sessions (WAM), JWT tokens | Sessions lost, auth tokens invalid | CloudWatch: ThrottledRequests |
| ElastiCache (Redis) | Cache for Profile, Preference | Performance degradation | CloudWatch: CacheHitRate, Evictions |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Known Issues (Open)

- **PRB0048497:** Deactivated profiles remain in FnF list (escalate to Salesforce team)
- **Fumble error on guest removal:** Known issue, no current fix

## Impact Classification

- **Full outage:** Guests cannot view or manage Family and Friends list. Cannot send or accept connection invites. Plan sharing unavailable.
- **Degraded:** Partial list loading, invite delays, or intermittent failures in plan sharing. Deactivated profiles showing in list.

## New Relic Monitoring

```sql
SELECT * FROM MobileRequestError WHERE appName = 'My Disney Experience' AND requestUrl LIKE '%fnf%' OR requestUrl LIKE '%friends%' AND statusCode >= 400 SINCE 1 hour ago FACET statusCode, requestUrl
```
