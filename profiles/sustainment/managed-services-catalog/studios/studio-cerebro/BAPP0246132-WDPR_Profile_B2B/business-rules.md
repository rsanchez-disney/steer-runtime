# Business Rules — WDPR Profile B2B

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented in Confluence Cloud | |
| Response time (p95) | Not documented in Confluence Cloud | |
| Error rate | Not documented in Confluence Cloud | |

## Peak Periods

- Not documented in Confluence Cloud. Traffic driven by internal service-to-service calls from downstream consumers.

## Business Logic

- B2B (service-to-service) endpoints only — no guest-facing traffic
- Primary endpoint: aggregated-profile
- Replacement for legacy BAPP0054836
- Internal-only access via ALB and API Gateway
- Downstream consumers use this for retrieving aggregated profile data programmatically

## Dependencies

- Profile B2C (BAPP0245892) — Profile data source. Tech Lead: andrew.southwick@disney.com
- OneID — Authentication/authorization for service tokens. Escalation: Jira IDY-*
- GAM — Guest account management. Escalation: Enterprise Technology
- Akamai CDN/WAF — Not directly exposed (internal-only), but downstream consumers may route through Akamai

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting B2B service (both regions) | Aggregated profile endpoint unavailable | CloudWatch: Task Count, CPU, Memory |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Internal Consumers (Who Calls B2B)

| Consumer | What They Consume | Impact if B2B Fails |
|----------|-------------------|---------------------|
| Internal B2B consumers | aggregated-profile endpoint | Internal systems lose guest data access |
| ParkApps | Profile data | Login loops in ParkApps |
| Shield Team (Digital Itinerary) | Profile B2C APIs (via B2B) | Itinerary features broken |
| Commerce / Ticketing | Profile data for purchases | Cannot validate guest info |

## Impact Classification

- **Full outage:** Aggregated profile endpoint unavailable to internal consumers. Services depending on B2B profile data will fail. No direct guest-facing impact unless downstream services cascade.
- **Degraded:** Increased latency or partial failures on aggregated-profile endpoint. Downstream services may experience timeouts or incomplete data.
