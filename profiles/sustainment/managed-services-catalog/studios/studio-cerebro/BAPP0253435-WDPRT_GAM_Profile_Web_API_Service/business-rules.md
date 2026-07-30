# Business Rules — WDPRT GAM Profile Web API Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | Not documented in Confluence Cloud | |
| Error rate (per endpoint) | See endpoint thresholds below | Splunk error rate query |

### Endpoint Error Thresholds

| Endpoint | Max Error % |
|----------|-------------|
| /profile-api/avatars | 0.003% |
| /profile-api/resorts | 0.4% |
| /profile-api/authentication/get-client-token | 0.1% |
| /profile-api/guest/{swid}/termsAndConditions/{value} | 0.2% (GET) / 4% (POST) |
| /profile-api/jwt/validate | 1.5% |
| /profile-api/child-auth | 1% |
| /profile-api/v1/guest/swid/{swid}/magic-bands | 0.4% |
| /profile-api/stored-payments/eligibility/{swid} | 1% |
| /profile-api/authentication/session | 1% |
| /profile-api/content/{lang}/profile-spa | 50% |
| /profile-api/content/{lang}/ncm/profile-fnf-spa | 0.02% |
| /profile-api/content/{lang}/profile-mb-spa | 0.03% |
| /profile-api/residency/verification | 1% |

## Peak Periods

- Not documented in Confluence Cloud

## Business Logic

- Orchestration/BFF layer — ALL traffic from Akamai passes through this service
- Routes requests from SPAs (Profile SPA, MB+C SPA, FnF SPA, AuthenticatorJS) to backend services
- ~85% of requests routed to GAM CORE APIGW (internal) and GAM APIGW-HA
- Handles authentication, session management (DynamoDB), and request routing
- Java 17 / Spring Boot (migrated from Node.js BAPP0082601)
- Endpoints exposed: Authentication, profile management, preferences, verification processes, content retrieval, stored payments, magic bands, child auth, JWT validation, residency verification
- DynamoDB used as globally synchronized session table
- Critical endpoint: /profile-api/authentication/session

## Dependencies

- **Downstream (calls to):** GAM (Enterprise Technology), DynamoDB (sessions: wdpr-gam-b0253435-prd-webapi), Profile B2C (andrew.southwick@disney.com), VAS (martin.x.uribe.-nd@disney.com), OneID (IDY Jira), D-Scribe, Preferences (andrew.southwick@disney.com), Child Auth (martin.x.uribe.-nd@disney.com), Profile JWT (andrew.southwick@disney.com), ID-Me, Facility Service, Authz, Affiliations, Explorer Service
- **Upstream (dependents):** Profile SPA (BAPP0180489), MB+C SPA (BAPP0180565), FnF SPA (BAPP0247007), AuthenticatorJS (BAPP0248309)

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
| ECS Fargate | Hosting Java WAM (both regions) | ALL SPAs lose backend connectivity | CloudWatch: Task Count, CPU, Memory |
| DynamoDB | Globally synchronized session table | Sessions lost, auth tokens invalid | CloudWatch: ThrottledRequests, ConsumedCapacity |
| ElastiCache (Redis) | Request caching | Performance degradation | CloudWatch: CacheHitRate, Evictions |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**DynamoDB Table (PROD):** wdpr-gam-b0253435-prd-webapi
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Impact Classification

- **Full outage:** ALL SPAs lose connectivity to backend services. Login, registration, and session management break completely. No guest data can be retrieved or updated. Cascading failure across the entire Profile ecosystem.
- **Degraded:** Increased latency, specific endpoint errors (e.g., DynamoDB throttling causing session issues), partial routing failures to specific backend services.
