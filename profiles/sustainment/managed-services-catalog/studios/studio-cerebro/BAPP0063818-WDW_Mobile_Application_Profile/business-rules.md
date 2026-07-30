# Business Rules — WDW Mobile Application (Profile)

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
- Park WiFi congestion periods (high NetworkFailure rates)

## Business Logic

- Login and registration flows via OneID integration
- Profile viewing and editing (name, avatar, preferences)
- Push notification preferences management (via MNO service)
- Family & Friends list management
- Native module within the My Disney Experience app
- Shared BAPP ID between iOS (Swift) and Android (Kotlin) platforms

## Key Mobile Service Calls

| Screen / Action | Key Endpoint(s) | Notes |
|-----------------|-----------------|-------|
| Startup (logged in) | GET /profile-service/v4/guests/{SWID}/profile-aggregated?sessionEvent=CREATE&site=WDW,DCL | Session event CREATE even without registration |
| Session Refresh | POST /jgc/v8/client/{CLIENT}/guest/refresh-auth; GET /profile-aggregated?sessionEvent=REFRESH | Android not making OneID profile calls |
| Logout | POST /jgc/v8/client/{CLIENT}/guest/{SWID}/logout | OneID logout |
| Registration | POST /jgc/v8/client/{CLIENT}/guest-flow; POST .../guest/register; GET /profile-aggregated?sessionEvent=CREATE | Calls OneID then Profile Aggregated |
| Change Avatar | GET /profile-view-assembly-service/v1/guest/avatars (iOS); GET /explorer-service/public/finder/list/ancestor/80007798 (Android) | Android should use VAS for avatars |
| Membership & Passes | GET /profile-service/v4/guests/{SWID}/affiliations?site=WDW,DCL | Link MEP opens browser |
| Account Settings | GET /jgc/v8/client/{CLIENT}/guest/{SWID}?expand=profile,displayname,linkedaccounts,marketing | iOS requires reauth (low trust) |
| Payment Methods | POST /api/v1/wallet/token; POST /api/v1/wallet/orchestrator/retrieveList | Uses Wallet iFrame |
| Reset Pin | GET /charge-account/services/api/v1/chargeaccount/pin; PUT /profile-b2c/v1/guests/SWID/{SWID}/reset-pin | Android 403 on origin stage URL (no auth token) |
| Family & Friends | GET /profile-service/v4/guest/{CLIENT}/fnf/friends-by-plans?qrCodeLive=true | Android uses expand service for avatars |
| Accept/Decline Invite | POST /assembly/guest/{XID}/friends (accept); POST .../received-invitation/{ID} (decline) | — |
| Add Managed Guest | POST /assembly/guest/id;swid={SWID}/managed-guests | — |
| Scan Linking Code | GET /profile-service/v4/guest/{CLIENT}/vault/qrcode/profile/{CODE} | — |
| Show Linking Code | GET /profile-service/v4/guest/{CLIENT}/vault/qrcode/{SWID}?type=CHILD_ASSOCIATION | Uses CHILD_ASSOCIATION even for adults |

## OneID Client IDs

- Android WDW Stage: `TPR-WDW-LBSDK.AND-STAGE`
- iOS WDW Stage: `TPR-WDW-LBSDK.IOS-STAGE`
- iOS WDW Prod: `TPR-WDW-LBSDK.IOS-PROD`

## Android vs iOS Differences

- Android uses expand-service for avatars; iOS uses VAS directly
- Android not making OneID profile calls on session refresh
- Android 403 on origin stage URL for managed guest avatar (no auth token)
- iOS Reset Pin screen is in ObjC (older design), pending Swift upgrade
- Android and iOS use different endpoints for "find through connected guests"

## Dependencies

- OneID — Authentication (login/registration callbacks). Escalation: Jira IDY-* at support.twdc.technology. Slack: #identity-help
- Profile B2C Service — Guest profile CRUD (BAPP0245892). Tech Lead: andrew.southwick@disney.com
- Profile B2B Service — B2B partner integrations (BAPP0246132). Tech Lead: martin.x.uribe.-nd@disney.com
- Profile View Assembly Service (VAS) — Avatars, assembled views (BAPP0242566). Tech Lead: martin.x.uribe.-nd@disney.com
- Preference Service — Guest preferences (BAPP0170520). Tech Lead: andrew.southwick@disney.com
- Mobile Notification Service (MNO) — Push notifications (BAPP0229223). Tech Lead: andrew.southwick@disney.com
- Wallet Service — Payment methods
- Explorer Service — Android avatar list
- Akamai CDN/WAF — Edge routing. PROD: profile-svcs.wdprapps.disney.com. Escalation: ops-global-parks-se-guestexp
- GAM — Legacy auth (Keyring, GDS, Guest Keys). Escalation: Enterprise Technology
- Parks WiFi infrastructure — Network connectivity in parks

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting all backend services | Services completely down | CloudWatch: Task Count, CPU, Memory |
| DynamoDB | Sessions (WAM), JWT tokens | Sessions lost, auth tokens invalid | CloudWatch: ThrottledRequests |
| ElastiCache (Redis) | Cache for Profile, Preference, MNO | Performance degradation | CloudWatch: CacheHitRate, Evictions |
| RabbitMQ | MNO push events (SHURI queue) | Opt-in events not delivered | Queue depth, consumer count |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Impact Classification

- **Full outage:** Cannot view/edit profile in WDW app. Login/Registration flows broken. OneID integration failures. Push notification preferences unavailable.
- **Degraded:** Intermittent NetworkFailure errors (usually parks WiFi, not a code issue). Slow profile loading. 504 Gateway Timeouts on backend services.

## New Relic Monitoring

```sql
SELECT * FROM MobileRequestError WHERE appName = 'My Disney Experience' AND requestUrl LIKE '%profile%' AND statusCode >= 400 SINCE 1 hour ago FACET statusCode, requestUrl
```
