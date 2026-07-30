# Business Rules — WDPR Mobile Device Notification Optin Service (MNO)

## SLAs & Availability Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Uptime | Not documented | — |
| Response time (p95) | Not documented | — |
| Error rate | Not documented | — |

## Peak Periods

- Park opening hours when guests enable push notifications on their mobile devices
- Holiday seasons with high park attendance
- New feature launches that prompt notification opt-in

## Business Logic

- Records guest opt-ins to mobile push notification lists
- Does NOT perform actual push notifications — that is handled by mobile applications' services
- Externally accessible API
- Active-active deployment across US-EAST-1 (WDW) and US-WEST-2 (DLR)
- Platform: Java 17
- Uses RabbitMQ (SHURI queue: gam-exp-rmq-vhl) for event processing

## Akamai Gateway (via Profile Services)

| Environment | Hostname |
|-------------|----------|
| PROD | profile-svcs.wdprapps.disney.com |
| STAGE | stage.profile-svcs.wdprapps.disney.com |
| LOAD | load.profile-svcs.wdprapps.disney.com |
| LATEST | latest.profile-svcs.wdprapps.disney.com |

## Dependencies

- DynamoDB — Data store for opt-in records
- RabbitMQ (SHURI queue: gam-exp-rmq-vhl) — Event messaging. Impact if down: opt-in events not delivered
- Preference Service (BAPP0170520) — Preference data integration. Tech Lead: andrew.southwick@disney.com
- Mobile applications (WDW/DLR) — Upstream: send opt-in requests. POC: mark.s.lewis@disney.com
- OneID — Authentication. Escalation: Jira IDY-*
- Akamai CDN/WAF — Edge routing. Escalation: ops-global-parks-se-guestexp

## AWS Infrastructure

| Service | Usage | Impact if Down | Monitoring |
|---------|-------|----------------|------------|
| ECS Fargate | Hosting MNO service (both regions) | Opt-in recording completely down | CloudWatch: Task Count, CPU, Memory |
| DynamoDB | Opt-in records storage | Cannot record or retrieve opt-ins | CloudWatch: ThrottledRequests, ConsumedCapacity |
| RabbitMQ (SHURI) | Event messaging (gam-exp-rmq-vhl) | Opt-in events not delivered to consumers | Queue depth, consumer count |

**Regions:** US-EAST-1 (Primary WDW) | US-WEST-2 (Secondary DLR)
**Alert Thresholds:** CPU >30%, Memory >50%
**Alert Channel:** [DX Profile] Prod Alerts

## Internal Consumers (Who Calls MNO)

| Consumer | What They Send | Impact if MNO Fails |
|----------|----------------|---------------------|
| WDW Mobile App (My Disney Experience) | Push notification opt-in requests | Guests won't receive push notifications |
| DLR Mobile App (Disneyland) | Push notification opt-in requests | Guests won't receive push notifications |
| Shield Team (Digital Itinerary) | Push notification registration | Itinerary push notifications fail |

## Impact Classification

- **Full outage:** Push notification opt-in records unavailable. Guests won't receive push notifications, but core app functionality is unaffected.
- **Degraded:** Delayed opt-in processing via RabbitMQ. Guests may not receive timely push notifications.
