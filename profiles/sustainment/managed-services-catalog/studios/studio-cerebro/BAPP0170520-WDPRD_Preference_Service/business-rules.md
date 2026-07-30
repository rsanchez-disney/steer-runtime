# Business Rules — WDPRD Preference Service

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented | — |
| Response time (p95) | Not documented | — |
| Error rate | Not documented | — |

## Peak Periods

- Park opening hours (7am-11pm ET for WDW, 7am-12am PT for DLR)
- Marketing campaign opt-in periods
- Holiday seasons (Thanksgiving, Christmas, Spring Break)

## Business Logic

- Stores guest preferences as SWID-based data (no PII, no PCI)
- Serves as System of Record (SOR) for DynamoDB tables previously used by ProfileService (BAPP0054836)
- Handles communication preference management (marketing opt-ins/outs)
- Supports implicit preference generation
- Internal accessibility only — consumed by other Profile services
- Platform: Java 17

## Akamai Gateway (via Profile Services)

| Environment | Hostname |
|-------------|----------|
| PROD | profile-svcs.wdprapps.disney.com |
| STAGE | stage.profile-svcs.wdprapps.disney.com |
| LOAD | load.profile-svcs.wdprapps.disney.com |
| LATEST | latest.profile-svcs.wdprapps.disney.com |

## Dependencies

- DynamoDB — Primary data store for guest preferences (Global Tables, cross-region replication)
- ElastiCache (Redis) — Preferences cache. Impact if down: performance degradation, cache miss
- Profile B2C (BAPP0245892) — Upstream consumer. Tech Lead: andrew.southwick@disney.com
- Profile WebAPI WAM (BAPP0253435) — Upstream consumer. Tech Lead: andrew.southwick@disney.com
- MNO (BAPP0229223) — Push notification preferences via RabbitMQ. Tech Lead: andrew.southwick@disney.com
- Preference Admin (BAPP0192854) — Admin UI for managing preferences. Tech Lead: gino.x.caverzan.-nd@disney.com

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting the Preference Service | Service completely down | CloudWatch: Task Count, CPU, Memory |
| DynamoDB | Guest preferences storage (Global Tables) | Preferences lost/unavailable | CloudWatch: ThrottledRequests, ConsumedCapacity |
| ElastiCache (Redis) | Preferences cache | Performance degradation, higher DynamoDB load | CloudWatch: CacheHitRate, Evictions, FreeableMemory |
| RabbitMQ (SHURI) | MNO push preference events | Opt-in events not delivered | Queue depth, consumer count |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Internal Consumers (Who Calls Preference Service)

| Consumer | What They Consume | Impact if Preference Fails |
|----------|-------------------|----------------------------|
| Profile B2C (BAPP0245892) | Guest preference data | Cannot retrieve/update guest preferences |
| Profile WebAPI WAM (BAPP0253435) | Preference passthrough | Preference API calls fail |
| MNO (BAPP0229223) | Push notification preferences | Cannot update notification opt-in/out |
| Preference Admin (BAPP0192854) | Admin preference management | Cannot manage guest communication preferences |
| WDW/DLR Mobile Apps | Preferences via B2C | Avatar, communication settings unavailable |

## Impact Classification

- **Full outage:** Guest preferences not saved or retrieved. Communication preference changes lost. Implicit preference generation fails. Marketing opt-ins/outs may not persist.
- **Degraded:** Partial preference data may be stale (Redis cache serving old values). Guest experience degraded but not fully blocked.
